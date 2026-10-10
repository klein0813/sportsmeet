import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecordDocument } from 'src/schemas/record.schema';
import { ProjectDocument } from 'src/schemas/project.schema';
import { AthleteDocument } from 'src/schemas/athlete.schema';
import { SclassDocument } from 'src/schemas/sclass.schema';
import {
  PROJECTS,
  SCLASS,
  SCORE_RULE,
  FLAG,
  PROJECT_DATA,
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
      this.recordModel.countDocuments(),
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
        ...projectData,
        name: item,
        flag: FLAG,
      };
      if (projectData.category === 2) {
        projects.push({ ...project, group: 2 });
      } else {
        projects.push({ ...project, group: 0 });
        projects.push({ ...project, group: 1 });
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
      projectGroup: project.group,
      category: project.category,
      flag: datas.flag,
      round: datas.round,
    };
    // 成绩按规则排序：type： 0, 成绩数值越大越好，1，成绩数值越小越好
    datas.records.sort((a, b) =>
      project.type === 1 ? a.level - b.level : b.level - a.level,
    );
    const updateSclass = {};
    let lastLevel = -99;
    let lastRanking = 0;
    const records = await Promise.all(
      datas.records.map(async (record, index) => {
        const res = {
          ...data,
          level: record.level,
        };
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
              };
            }
          }
        }
        return res;
      }),
    );
    // 更新班级积分
    Object.keys(updateSclass).forEach(async (className) => {
      const updateSclassData = updateSclass[className];
      const { text, score, originText, originScore } = updateSclassData;
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
        },
      );
    });
    // 预决赛、决赛，说明比赛结束，标注项目比赛完成
    if (datas.round >= 2) {
      await this.projectModel.findByIdAndUpdate(datas.projectId, {
        finish: true,
      });
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

  private getGanderProjectTop(top: number, grade: number) {
    return this.recordModel.aggregate([
      {
        $match: {
          athleteGrade: grade,
          projectGroup: { $in: [0, 1] },
          ranking: { $lte: top },
        },
      },
      {
        $set: {
          fullName: {
            $concat: ['$athleteClass', ' ', '$athleteName', ' ', '$level'],
          },
        },
      },
      {
        $group: {
          _id: { ranking: '$ranking', projectGroup: '$projectGroup' },
          items: {
            $push: {
              k: '$projectName',
              v: '$fullName',
            },
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
              { ranking: '$ranking', projectGroup: '$projectGroup' },
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
}
