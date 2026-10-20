import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecordDocument } from 'src/schemas/record.schema';
import { ProjectDocument } from 'src/schemas/project.schema';
import { AthleteDocument } from 'src/schemas/athlete.schema';
import { SclassDocument } from 'src/schemas/sclass.schema';
import CopmsUtil from 'src/utils/comps.util';
import {
  PROJECTS,
  SCLASS,
  SCORE_RULE,
  FLAG,
  PROJECT_DATA,
  REWARD_SCORE,
} from 'src/utils/constants';

@Injectable()
export class RecordService {
  scoreService: any;
  constructor(
    @InjectModel('Record') private recordModel: Model<RecordDocument>,
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
    @InjectModel('Athlete') private athleteModel: Model<AthleteDocument>,
    @InjectModel('Sclass') private sclassModel: Model<SclassDocument>,
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  async get(page: number, size: number, q: any) {
    // return this.recordModel.find({ isDeleted: false });
    const skip = (page - 1) * size;
    const [list, total] = await Promise.all([
      this.recordModel
        .find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .lean()
        .exec(),
      this.recordModel.countDocuments(q),
    ]);
    return {
      list,
      total,
      page,
      size,
    };
  }

  count() {
    return this.recordModel.countDocuments({ isDeleted: false });
  }

  findById(id: string) {
    return this.recordModel.findById(id);
  }

  findByName(name) {
    return this.recordModel.findOne({ name, isDeleted: false });
  }

  create(name: string, type: number, record: number, group: number) {
    return this.recordModel.create({ name, type, record, group });
  }

  init() {
    const projects = [];
    const projectsObj = {};
    PROJECTS.forEach((item) => {
      const projectData = PROJECT_DATA[item];
      const project = {
        type: projectData.type,
        category: projectData.category,
        name: item,
        flag: FLAG,
      };
      if (projectData.category === 2) {
        projects.push({ ...project, record: projectData.record, group: 2 });
      } else {
        projects.push({
          ...project,
          record: projectData.record[0].v,
          recordHolder: projectData.record[0],
          group: 0,
        });
        projects.push({
          ...project,
          record: projectData.record[1].v,
          recordHolder: projectData.record[1],
          group: 1,
        });
      }
      projectsObj[item] = '';
    });
    this.projectModel.insertMany(projects);

    const sclasses = [];
    for (const grade in SCLASS) {
      SCLASS[grade].forEach((item) => {
        const aclass = {
          grade,
          name: item,
          projects: projectsObj,
          score: 0,
          flag: FLAG,
        };
        sclasses.push(aclass);
      });
    }
    return this.sclassModel.insertMany(sclasses);
  }

  async batchInsert(datas) {
    const project = await this.projectModel.findById(datas.projectId);
    const data = {
      projectId: project._id,
      projectName: project.name,
      projectType: project.type,
      projectGroup: project.group,
      category: project.category,
      flag: datas.flag,
      round: datas.round,
    };
    // 成绩按规则排序：type： 0, 成绩数值越大越好，1，成绩数值越小越好
    datas.records.sort((a, b) => {
      const alevel = Number.parseInt(a.level);
      const blevel = Number.parseInt(b.level);
      return project.type === 1 ? alevel - blevel : blevel - alevel;
    });
    const updateSclass = {};
    let lastLevel = '-99';
    let lastRanking = 0;
    const records = [];
    await datas.records.reduce(async (previousPromise, record, index) => {
      await previousPromise;
      const res = {
        ...data,
        level: record.level,
      };
      // 是否破纪录，成绩按规则排序：type： 0, 成绩数值越大越好，1，成绩数值越小越好
      // 目前只支持个人项目的破纪录计分
      const level = Number.parseInt(record.level);
      if (
        project.record > -1 &&
        ((project.type === 1 && level < project.record) ||
          (project.type === 0 && level > project.record))
      ) {
        res['recordBreaking'] = true;
        res['orignRecord'] = project.record;
      }
      // 成绩并列，排名相同，下一名次跳过
      if (lastLevel == record.level) {
        res['ranking'] = lastRanking;
      } else {
        res['ranking'] = index + 1;
        lastRanking = res['ranking'];
        lastLevel = record.level;
      }
      let sclass;
      if (project.category === 0) {
        // 单项
        const athlete = await this.athleteModel.findById(record.athleteId);
        res['athleteSid'] = athlete.sid;
        res['athleteClass'] = athlete.class;
        res['athleteId'] = athlete._id;
        res['athleteName'] = athlete.name;
        res['athleteGrade'] = athlete.grade;
        sclass = await this.sclassModel.findOne({ name: athlete.class });
      } else {
        // 团体项目
        sclass = await this.sclassModel.findById(record.athleteId);
        res['athleteClass'] = sclass.name;
        res['athleteGrade'] = sclass.grade;
        res['athleteName'] = '';
      }
      // 预决赛、决赛，说明比赛结束，需要统计分数
      if (datas.round >= 2) {
        res['score'] = SCORE_RULE[project.category][res['ranking'] - 1] || 0;
        if (res['score'] > 0) {
          const className = sclass['name'];
          if (updateSclass[className]) {
            const sclass = updateSclass[className];
            sclass.text = `${sclass.text}+${res['score']}`;
            sclass.score = sclass.score + res['score'];
          } else {
            updateSclass[className] = {
              text: `${res['score']}`,
              score: res['score'],
              originText: sclass.projects[project.name],
              originScore: sclass.score,
              ranking: res['ranking'],
            };
          }
          if (res['recordBreaking']) {
            const flashRecordScore = REWARD_SCORE[project.category];
            updateSclass[className].text += `+${flashRecordScore}`;
            updateSclass[className].score += flashRecordScore;
          }
        }
      }
      records.push(res);
      return res;
    }, Promise.resolve());
    // 更新班级积分
    Object.keys(updateSclass).forEach(async (className) => {
      const updateSclassData = updateSclass[className];
      const { text, score, originText, originScore, ranking } =
        updateSclassData;
      // // 给分数添加组别（男/女）
      // if (project.group < 2) {
      //   text = `${text}(${GENDER_MAPPING[project.group]})`;
      // }
      await this.sclassModel.updateOne(
        { name: className },
        {
          $set: {
            [`projects.${project.name}`]: `${originText ?? ''}+${text}`,
            score: originScore + score,
          },
          $inc: { [`rankingCounts.no${ranking}`]: 1 },
        },
      );
    });
    // 预决赛、决赛，说明比赛结束
    // 1.标注项目比赛完成
    // 2.若破纪录了，并且成绩比新纪录要好，更新记录
    if (datas.round >= 2) {
      const updater: any = { $set: { [`grade${datas.grade}Done`]: true } };
      const bestRecord = records[0];
      if (
        bestRecord['recordBreaking'] &&
        (!project['newRecord'] ||
          bestRecord['level'] > project['record'] ===
            bestRecord['level'] > project['newRecord'])
      ) {
        updater.$set['newRecord'] = bestRecord['level'];
        updater.$set['recordHolder'] = {
          name: bestRecord['athleteName'],
          class: bestRecord['athleteClass'],
          flag: bestRecord['flag'],
          date: CopmsUtil.getDateYM(),
        };
      }
      await this.projectModel.findByIdAndUpdate(datas.projectId, updater);
    }

    return this.recordModel.insertMany(records);
  }

  async getTop(top: number, grade: number) {
    const ganderTop = await this.getGanderProjectTop(top, grade);
    const classTop = await this.getClassProjectTop(top, grade);
    return {
      ganderTop,
      classTop,
    };
  }

  getFlashCount() {
    return this.recordModel.countDocuments({ recordBreaking: true });
  }

  private getGanderProjectTop(top: number, grade: number) {
    return this.recordModel.aggregate([
      {
        $match: {
          athleteGrade: grade,
          projectGroup: { $in: [0, 1] },
          ranking: { $lte: top },
        },
      },
      // 1. 直接按 排名、组别、项目名 分组
      {
        $group: {
          _id: {
            ranking: '$ranking',
            projectGroup: '$projectGroup',
            projectName: '$projectName',
          },
          // 把名字去重后放入数组
          names: {
            $addToSet: {
              $concat: [
                '$athleteClass',
                ' ',
                '$athleteName',
                ' ',
                '$level',
                { $cond: ['$recordBreaking', ' (破)', ''] },
              ],
            },
          },
        },
      },
      // 2. 再次分组，把项目聚合成对象数组
      {
        $group: {
          _id: {
            ranking: '$_id.ranking',
            projectGroup: '$_id.projectGroup',
          },
          items: {
            $push: { k: '$_id.projectName', v: '$names' }, // 此时 v 是一个数组
          },
        },
      },
      {
        $project: {
          _id: 0,
          ranking: '$_id.ranking',
          projectGroup: '$_id.projectGroup',
          items: { $arrayToObject: '$items' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                ranking: '$ranking',
                projectGroup: '$projectGroup',
              },
              '$items',
            ],
          },
        },
      },
      { $sort: { ranking: 1, projectGroup: 1 } },
    ]);
  }

  private getClassProjectTop(top: number, grade: number) {
    return this.recordModel.aggregate([
      {
        $match: {
          athleteGrade: grade,
          projectGroup: 2,
          ranking: { $lte: top },
        },
      },
      {
        $group: {
          _id: { ranking: '$ranking' },
          items: {
            $push: {
              k: '$projectName',
              v: '$athleteClass',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          ranking: '$_id.ranking',
          items: { $arrayToObject: '$items' },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ ranking: '$ranking' }, '$items'],
          },
        },
      },
      { $sort: { ranking: 1 } },
    ]);
  }

  getExportData(query) {
    return this.recordModel
      .find(query)
      .sort({
        athleteGrade: 1,
        projectGroup: 1,
        projectName: 1,
        ranking: 1,
        createdAt: -1,
      }) // 1 = 升序，-1 = 降序
      .exec();
  }

  getExportFlashData(query) {
    // return this.recordModel
    //   .find(query)
    //   .sort({
    //     projectGroup: 1,
    //     projectName: 1,
    //     score: 1,
    //   }) // 1 = 升序，-1 = 降序
    //   .exec();
    return this.recordModel.aggregate([
      // 1. 动态生成一个用于统一排序的虚拟字段 sortScore
      {
        $match: query,
      },
      {
        $addFields: {
          sortScore: {
            $cond: {
              if: { $eq: ['$projectType', 1] }, // 如果是径赛
              then: { $multiply: ['$score', -1] }, // 取负值（时间 10s 变成 -10）
              else: '$score', // 田赛保持原值（距离 5m 还是 5m）
            },
          },
        },
      },
      {
        $sort: { projectGroup: 1, projectName: 1, sortScore: -1 },
      },
      // 3. 隐藏虚拟字段（如果不需要返回给前端）
      {
        $project: { sortScore: 0 },
      },
    ]);
  }
}
