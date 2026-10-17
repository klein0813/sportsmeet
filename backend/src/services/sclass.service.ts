import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SclassDocument } from 'src/schemas/sclass.schema';

@Injectable()
export class SclassService {
  constructor(
    @InjectModel('Sclass') private sclassModel: Model<SclassDocument>,
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  async get(query) {
    const datas = await this.sclassModel.aggregate([
      {
        $match: {
          ...query,
          isDeleted: false,
        },
      },
      {
        $replaceRoot: {
          // 拉平 projects
          newRoot: {
            $mergeObjects: ['$$ROOT', '$projects'],
          },
        },
      },
      { $project: { projects: 0 } }, // 排除原嵌套字段
      {
        $sort: {
          score: -1,
          'rankingCounts.no1': -1, // 先按第一名数量降序
          'rankingCounts.no2': -1, // 第一名相同，按第二名数量降序
          'rankingCounts.no3': -1,
          'rankingCounts.no4': -1,
          'rankingCounts.no5': -1,
          'rankingCounts.no6': -1,
        },
      },
    ]);
    // 设置排名
    let lastScore = -99;
    let lastRanking = 0;
    let lastRankingCounts = {};
    datas.forEach((data, index) => {
      // 如遇两队积分相等，以获第一名多者名次列前，以此类推, 排名相同，下一名次跳过
      if (
        lastScore == data.score &&
        this.judgeRankingEqual(lastRankingCounts, data.rankingCounts)
      ) {
        data['ranking'] = lastRanking;
      } else {
        data['ranking'] = index + 1;
        lastRanking = data['ranking'];
        lastScore = data.score;
        lastRankingCounts = data.rankingCounts;
      }
    });
    datas.sort((a, b) => a.name - b.name);
    return datas;
  }

  async getTopThreeByGrade() {
    const sortCond = {
      score: -1,
      'rankingCounts.no1': -1, // 先按第一名数量降序
      'rankingCounts.no2': -1, // 第一名相同，按第二名数量降序
      'rankingCounts.no3': -1,
      'rankingCounts.no4': -1,
      'rankingCounts.no5': -1,
      'rankingCounts.no6': -1,
    } as const;
    const [raw] = await this.sclassModel.aggregate([
      {
        $facet: {
          // 一年级前三名
          grade1: [
            { $match: { grade: 1 } },
            { $sort: sortCond }, // 排序规则（如果 ranking 是名次 1,2,3 则改为 1）
            { $limit: 3 },
            { $project: { _id: 1, name: 1, score: 1 } }, // 👈 加上 score
          ],
          // 二年级前三名
          grade2: [
            { $match: { grade: 2 } },
            { $sort: sortCond },
            { $limit: 3 },
            { $project: { _id: 1, name: 1, score: 1 } }, // 👈 加上 score
          ],
          // 三年级前三名
          grade3: [
            { $match: { grade: 3 } },
            { $sort: sortCond },
            { $limit: 3 },
            { $project: { _id: 1, name: 1, score: 1 } }, // 👈 加上 score
          ],
        },
      },
    ]);

    return {
      grade1: raw?.grade1 ?? [],
      grade2: raw?.grade2 ?? [],
      grade3: raw?.grade3 ?? [],
    };
  }

  count() {
    return this.sclassModel.countDocuments({ isDeleted: false });
  }

  findById(id: string) {
    return this.sclassModel.findById(id);
  }

  findByName(name) {
    return this.sclassModel.findOne({ name, isDeleted: false });
  }

  create(name: string, type: number, record: number, group: number) {
    return this.sclassModel.create({ name, type, record, group });
  }

  batchInsert(datas) {
    return this.sclassModel.insertMany(datas);
  }

  private judgeRankingEqual(lastRankingCounts, rankingCounts) {
    return (
      lastRankingCounts.no1 == rankingCounts.no1 &&
      lastRankingCounts.no2 == rankingCounts.no2 &&
      lastRankingCounts.no3 == rankingCounts.no3 &&
      lastRankingCounts.no4 == rankingCounts.no4 &&
      lastRankingCounts.no5 == rankingCounts.no5 &&
      lastRankingCounts.no6 == rankingCounts.no6
    );
  }
}
