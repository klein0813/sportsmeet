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
      { $sort: { score: -1 } },
    ]);
    // 设置排名
    let lastScore = -99;
    let lastRanking = 0;
    datas.forEach((data, index) => {
      // 成绩并列，排名相同，下一名次跳过
      if (lastScore == data.score) {
        data['ranking'] = lastRanking;
      } else {
        data['ranking'] = index + 1;
        lastRanking = data['ranking'];
        lastScore = data.score;
      }
    });
    datas.sort((a, b) => a.name - b.name);
    return datas;
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
}
