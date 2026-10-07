import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from '../base.schema';

export type ActivityDocument = Activity & Document;

@Schema()
export class Activity extends Base {
  @Prop({
    required: true,
  })
  name: string; // 活动名

  @Prop({
    required: true,
  })
  title: string; // 页面title

  @Prop({
    required: true,
    default: 0,
  })
  rule: number; // 1: 去掉最高分和最低分

  @Prop({
    required: true,
    default: 0,
  })
  scoresys: number; // 0: 10分制，1: 100分制

  @Prop({
    required: true,
    default: false,
  })
  status: boolean; // true, 活动已开启

  static getCollectionName(): string {
    return 'activity';
  }
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
