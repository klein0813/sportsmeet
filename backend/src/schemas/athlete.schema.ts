import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';

export type AthleteDocument = Athlete & Document;

@Schema()
export class Athlete extends Base {
  @Prop({
    required: true,
  })
  name: string; // 姓名

  @Prop({
    required: true,
  })
  sid: string; // 编号

  @Prop({
    required: true,
    default: 0,
  })
  gender: number; // 0: 男子，1：女子

  @Prop({
    required: false,
    default: '',
  })
  flag: string; // 2026

  @Prop({
    required: false,
    default: [],
  })
  projects: Array<string>; // ["100米", "200米"]

  static getCollectionName(): string {
    return 'athlete';
  }
}

export const AthleteSchema = SchemaFactory.createForClass(Athlete);
