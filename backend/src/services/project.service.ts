import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ProjectDocument } from 'src/schemas/project.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  get(query) {
    return this.projectModel.find({
      ...query,
      isDeleted: false,
    });
  }

  count() {
    return this.projectModel.countDocuments({ isDeleted: false });
  }

  findById(id: string) {
    return this.projectModel.findById(id);
  }

  findByName(name) {
    return this.projectModel.findOne({ name, isDeleted: false });
  }

  create(name: string, type: number, record: number, group: number) {
    return this.projectModel.create({ name, type, record, group });
  }

  batchInsert(datas) {
    return this.projectModel.insertMany(datas);
  }

  async updateRecord(id, record) {
    const res = await this.projectModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(id),
        'gradeStatus.1': false,
        'gradeStatus.2': false,
        'gradeStatus.3': false,
      },
      {
        $set: {
          record: record,
        },
      },
    );
    if (res.modifiedCount) {
      return true;
    }
    return false;
  }

  async statCompletion() {
    const data = await this.projectModel.aggregate([
      // { $match: { flag: 2026 } },
      {
        $facet: {
          // 总体：已完成任务数 + 逻辑项目数
          overall: [
            {
              $project: {
                done: {
                  $add: [
                    { $cond: ['$grade1Done', 1, 0] },
                    { $cond: ['$grade2Done', 1, 0] },
                    { $cond: ['$grade3Done', 1, 0] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalDone: { $sum: '$done' },
                projectCount: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                totalDone: 1,
                projectCount: 1,
              },
            },
          ],
          // 分年级：各年级完成数
          byGrade: [
            {
              $group: {
                _id: null,
                g1Done: { $sum: { $cond: ['$grade1Done', 1, 0] } },
                g2Done: { $sum: { $cond: ['$grade2Done', 1, 0] } },
                g3Done: { $sum: { $cond: ['$grade3Done', 1, 0] } },
              },
            },
            {
              $project: {
                _id: 0,
                g1Done: 1,
                g2Done: 1,
                g3Done: 1,
              },
            },
          ],
        },
      },
    ]);
    return data[0];
  }
}
