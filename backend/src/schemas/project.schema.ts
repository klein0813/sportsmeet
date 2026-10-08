import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
  type: number; // 0, 田赛，1，竞赛  田赛：远度或高度越大越好；径赛：时间越短越好。

  @Prop({
    required: true,
    default: 0,
  })
  group: number; // 0: 男子，1：女子

  @Prop({
    required: true,
    default: -1,
  })
  record: number; // 1: 记录

  static getCollectionName(): string {
    return 'project';
  }
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
