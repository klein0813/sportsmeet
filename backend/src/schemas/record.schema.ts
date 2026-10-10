import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';
import { ObjectId } from 'mongodb';

export type RecordDocument = Record & Document;

@Schema()
export class Record extends Base {
  @Prop({
    required: true,
  })
  projectId: ObjectId; // 项目ID

  @Prop({
    required: true,
  })
  projectName: string; // 项目名称

  @Prop({
    required: true,
  })
  projectGroup: number; // 项目组别

  @Prop({
    required: false,
  })
  athleteId: ObjectId; // 运动员ID

  @Prop({
    required: false,
  })
  athleteName: string; // 运动员姓名

  @Prop({
    required: false,
  })
  athleteSid: string; // 运动员编号

  @Prop({
    required: true,
  })
  athleteClass: string; // 运动员班级

  @Prop({
    required: true,
    min: 1,
  })
  athleteGrade: number; // 运动员年级

  @Prop({
    required: true,
  })
  level: string; // 成绩

  @Prop({
    required: false,
    min: 1,
  })
  ranking: number; // 排名

  @Prop({
    required: true,
  })
  round: number; // 轮次 1，预赛，2 预决赛 3 决赛

  @Prop({
    required: false,
  })
  score: number; // 积分

  @Prop({
    required: true,
    default: 1,
  })
  category: number; // 0, 单项；1，团体赛

  @Prop({
    required: true,
    default: '',
  })
  flag: string; // 2026

  static getCollectionName(): string {
    return 'record';
  }
}

export const RecordSchema = SchemaFactory.createForClass(Record);
