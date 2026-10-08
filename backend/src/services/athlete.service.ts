import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AthleteDocument } from 'src/schemas/athlete.schema';

@Injectable()
export class AthleteService {
  constructor(
    @InjectModel('Athlete') private athleteModel: Model<AthleteDocument>,
  ) {}

  get() {
    return this.athleteModel.find({ isDeleted: false });
  }

  count() {
    return this.athleteModel.countDocuments({ isDeleted: false });
  }

  findById(id: string) {
    return this.athleteModel.findById(id);
  }

  findByName(name: string) {
    return this.athleteModel.findOne({ name, isDeleted: false });
  }

  findByKeyword(keyword: string) {
    return this.athleteModel.find({
      name: {
        $regex: `^${keyword}`, // ^ 表示以关键词开头
        $options: 'i', // i 表示不区分大小写
      },
    });
  }

  getBySidKeyword(keyword: string) {
    return this.athleteModel.find({
      sid: {
        $regex: `^${keyword}`, // ^ 表示以关键词开头
        $options: 'i', // i 表示不区分大小写
      },
    });
  }

  // create(name: string, type: number, record: number, group: number) {
  //   return this.athleteModel.create({ name, type, record, group });
  // }

  batchInsert(datas) {
    return this.athleteModel.insertMany(datas);
  }
}
