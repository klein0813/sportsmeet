import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Base } from './base.schema';

export type SclassDocument = Sclass & Document;

@Schema()
export class Sclass extends Base {
  @Prop({
    required: true,
    min: 1,
  })
  grade: number; // 年级

  @Prop({
    required: true,
    min: 1,
  })
  name: string; // 班级

  @Prop({
    required: true,
    type: MongooseSchema.Types.Mixed,
  })
  projects: any; // 项目名称 { 100M: 5(男), 400M: 8+7(女) }

  @Prop({
    required: true,
    default: 0,
  })
  score: number; // 总分

  @Prop({
    required: false,
    min: 1,
  })
  ranking: number; // 排名

  @Prop({
    required: true,
    default: '',
  })
  flag: string; // 2026

  static getCollectionName(): string {
    return 'sclass';
  }
}

export const SclassSchema = SchemaFactory.createForClass(Sclass);
