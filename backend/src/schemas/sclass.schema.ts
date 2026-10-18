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
    type: {
      no1: { type: Number, default: 0 },
      no2: { type: Number, default: 0 },
      no3: { type: Number, default: 0 },
      no4: { type: Number, default: 0 },
      no5: { type: Number, default: 0 },
      no6: { type: Number, default: 0 },
    },
    default: () => ({ no1: 0, no2: 0, no3: 0, no4: 0, no5: 0, no6: 0 }),
  })
  rankingCounts: {
    no1: number;
    no2: number;
    no3: number;
    no4: number;
    no5: number;
    no6: number;
  };

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
SclassSchema.index({ name: 1, flag: 1 }, { unique: true });
