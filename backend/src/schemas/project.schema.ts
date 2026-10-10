import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Base } from './base.schema';

export type ProjectDocument = Project & Document;

@Schema()
export class Project extends Base {
  @Prop({
    required: true,
  })
  name: string; // 项目名

  @Prop({
    required: true,
  })
  type: number; // 0, 成绩数值越大越好，1，成绩数值越小越好。

  @Prop({
    required: false,
    default: 0,
  })
  group: number; // 0: 男子，1：女子, 2, 班级赛

  @Prop({
    required: false,
    default: -1,
  })
  record: number; // 记录

  @Prop({
    required: false,
    type: MongooseSchema.Types.Mixed,
  })
  recordHolder: any; // { name: string; class: number; grade: number; flag: string }; 记录保持者

  @Prop({
    required: true,
    default: 1,
  })
  category: number; // 0, 单项；1，团体赛, 2, 班级赛

  @Prop({
    required: true,
    default: false,
  })
  finish: boolean; // false, 未完赛，true，已完赛
  // @Prop({
  //   required: false,
  //   type: MongooseSchema.Types.Mixed,
  // })
  // scoreRule: any; // { 1: number; 2: number; 3: number; 4: string }; 积分规则

  static getCollectionName(): string {
    return 'project';
  }
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
