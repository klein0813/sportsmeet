import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Connection } from 'mongoose';
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
    @InjectConnection() private readonly connection: Connection, // 注入连接以开启事务
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  async get(page: number, size: number, q: any) {
    // return this.recordModel.find({ isDeleted: false });
    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 };
    if (q.ranking) {
      sort = {
        projectName: -1,
        projectGroup: -1,
        round: -1,
        athleteGrade: -1,
        ranking: 1,
      };
    }
    const skip = (page - 1) * size;
    const [list, total] = await Promise.all([
      this.recordModel.find(q).sort(sort).skip(skip).limit(size).lean().exec(),
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
        if (Array.isArray(projectData.record)) {
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
        } else {
          projects.push({ ...project, group: 0 });
          projects.push({ ...project, group: 1 });
        }
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
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const project = await this.projectModel
        .findById(datas.projectId)
        .session(session);
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
        if (project.type === 1) {
          const alevel = Number.parseInt(a.level) - (a.worse ? -0.5 : 0);
          const blevel = Number.parseInt(b.level) - (b.worse ? -0.5 : 0);
          return alevel - blevel;
        }
        const alevel = Number.parseInt(a.level) + (a.worse ? -0.5 : 0);
        const blevel = Number.parseInt(b.level) + (b.worse ? -0.5 : 0);
        return blevel - alevel;
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
        if (lastLevel == record.level && record.worse != true) {
          res['ranking'] = lastRanking;
        } else {
          res['ranking'] = index + 1;
          lastRanking = res['ranking'];
          lastLevel = record.level;
        }
        let sclass;
        if (project.category === 0) {
          // 单项
          const athlete = await this.athleteModel
            .findById(record.athleteId)
            .session(session);
          res['athleteSid'] = athlete.sid;
          res['athleteClass'] = athlete.class;
          res['athleteId'] = athlete._id;
          res['athleteName'] = athlete.name;
          res['athleteGrade'] = athlete.grade;
          sclass = await this.sclassModel
            .findOne({ name: athlete.class })
            .session(session);
        } else {
          // 团体项目
          sclass = await this.sclassModel
            .findById(record.athleteId)
            .session(session);
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
        await this.sclassModel
          .updateOne(
            { name: className },
            {
              $set: {
                [`projects.${project.name}`]: `${originText ?? ''}+${text}`,
                score: originScore + score,
              },
              $inc: { [`rankingCounts.no${ranking}`]: 1 },
            },
          )
          .session(session);
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
        await this.projectModel
          .findByIdAndUpdate(datas.projectId, updater)
          .session(session);
      }

      await this.recordModel.insertMany(records, { session });
      await session.commitTransaction();
    } catch (error) {
      // 发生任何错误，回滚所有操作
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      await session.endSession();
    }
    return true;
  }

  async getTop(top: number, grade: number) {
    const ganderTop = await this.getGanderProjectTop(top, grade);
    const classTop = await this.getClassProjectTop(top, grade);
    return {
      ganderTop,
      classTop,
    };
  }

  findProjectRecord(tprojectId: string, athleteGrade: number, round: number) {
    const projectId = new mongoose.Types.ObjectId(tprojectId);
    return this.recordModel.find({ projectId, athleteGrade, round });
  }

  async revokeProjectAndRecalculate(
    tprojectId: string,
    athleteGrade: number,
    round: number,
  ) {
    const projectId = new mongoose.Types.ObjectId(tprojectId);
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // 1、根据 projectId 和 athleteGrade 查找并删除 Record，返回删除的记录列表
      const deletedRecords = await this.recordModel
        .find({ projectId, athleteGrade, round })
        .session(session);
      if (deletedRecords.length === 0) return false;
      await this.recordModel
        .deleteMany({ projectId, athleteGrade, round })
        .session(session);
      if (round === 1) {
        // 预赛，删除记录即可
        await session.commitTransaction();
        await session.endSession();
        return true;
      }

      // 2、更新 Project 表。将对应年级的 gradeXDone 设为 false
      const updateField = `grade${athleteGrade}Done`;
      const project = await this.projectModel
        .findById(projectId)
        .session(session);
      if (!project) return false;
      project[updateField] = false;
      if (project.newRecord) {
        // 重算 newRecord 和 recordHolder
        project.newRecord = null;
        project.recordHolder = PROJECT_DATA[project.name].record[project.group];
        // 查剩余记录
        const remainingRecords = await this.recordModel
          .find({ projectId })
          .session(session);
        if (remainingRecords.length > 0) {
          const isTrack = project.type === 1; // 1代表时间越小越好
          // 手动排序
          remainingRecords.sort((a, b) => {
            const valA = Number(a.level);
            const valB = Number(b.level);
            return isTrack ? valA - valB : valB - valA;
          });
          const best = remainingRecords[0];
          if (best.recordBreaking) {
            project.newRecord = Number(best.level);
            project.recordHolder = {
              name: best.athleteName,
              class: best.athleteClass,
              flag: best.flag,
              date: CopmsUtil.getDateYM(best.createdAt || new Date()),
            };
          }
        }
      }
      await project.save({ session });
      // 3、遍历步骤 1 返回的记录，根据 athleteClass 更新 Sclass 表。
      // (1) rankingCounts.noX -= 1。
      // (2) score -= record.score。
      // (3) 重置（清空/重新计算）该班级 projects[projectName] 字段
      // 先统计每个班级一共被扣了多少分、哪个名次扣了几次
      const classStatsMap = new Map<
        string,
        { scoreToSubtract: number; rankingsToSubtract: number[] }
      >(); // { "101": { scoreToSubtract: 10, rankingsToSubtract: [1, 2] } }
      deletedRecords.forEach((record) => {
        if (!classStatsMap.has(record.athleteClass)) {
          classStatsMap.set(record.athleteClass, {
            scoreToSubtract: 0,
            rankingsToSubtract: [],
          });
        }
        const stats = classStatsMap.get(record.athleteClass);
        stats.scoreToSubtract += record.score || 0;
        if (record.score) {
          if (record.recordBreaking) {
            stats.scoreToSubtract += REWARD_SCORE[project.category];
          }
          stats.rankingsToSubtract.push(record.ranking);
        }
      });
      // 遍历受影响的班级进行扣减和重算操作
      for (const [className, stats] of classStatsMap.entries()) {
        const sclass = await this.sclassModel
          .findOne({ name: className })
          .session(session);

        if (sclass) {
          // (2) 扣减总分 (防止出现负数)
          sclass.score = Math.max(0, sclass.score - stats.scoreToSubtract);

          // (1) 扣减名次统计
          stats.rankingsToSubtract.forEach((rank) => {
            if (rank >= 1 && rank <= 6) {
              const rankKey = `no${rank}` as keyof typeof sclass.rankingCounts;
              sclass.rankingCounts[rankKey] = Math.max(
                0,
                sclass.rankingCounts[rankKey] - 1,
              );
            }
          });

          // 核心修复：重置 projects[projectName]
          // 查询该班级在【该年级、该项目】下是否还有剩余成绩（解决男女组共用一个名字的问题）
          const remainingClassRecords = await this.recordModel
            .find({
              projectName: project.name,
              athleteClass: className,
            })
            .sort({ ranking: 1 })
            .session(session);

          if (remainingClassRecords.length > 0) {
            // 如果还有成绩（比如女子组的成绩没被撤销），重新生成积分字符串
            const remainScores = remainingClassRecords
              .map((r) => {
                if (!r.score) return '';
                if (r.recordBreaking) {
                  return `+${r.score}+${REWARD_SCORE[project.category]}`;
                }
                return `+${r.score}`;
              })
              .join('');
            // 覆盖原来的字符串（比如原本是 "+10+8"，撤销男子后变成 "+8"）
            sclass.projects[project.name] = remainScores;
          } else {
            // 如果该班级在这个项目下一个成绩都没了，重置值
            sclass.projects[project.name] = '';
          }
          // 由于 projects 是 Mixed 类型，修改内部对象后必须调用 markModified
          sclass.markModified('projects');

          await sclass.save({ session });
        }
      }
      await session.commitTransaction();
    } catch (error) {
      console.error('发生错误，触发回滚:', error);
      // 发生任何错误，回滚所有操作
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw new BadRequestException('操作失败，请稍后重试');
    } finally {
      await session.endSession();
    }
    return true;
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
          round: { $in: [2, 3] },
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
          round: { $in: [2, 3] },
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
