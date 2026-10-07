import { DynamicModule } from '@nestjs/common';
import { MongooseModule, Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Base extends Document {
  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;

  @Prop({ required: true, default: false })
  isDeleted: boolean;

  static getCollectionName(): string {
    return '';
  }

  static getMongooseModule(
    name: string,
    schema: mongoose.Schema<any>,
  ): DynamicModule {
    return MongooseModule.forFeatureAsync([
      {
        name,
        useFactory: () => {
          schema.pre('save', async function (next) {
            if (this.updatedAt) {
              this.updatedAt = new Date();
            }
            next();
          });
          // schema.pre('findOne', function (next) {
          //   next();
          // });
          return schema;
        },
        collection: this.getCollectionName(),
      },
    ]);
  }
}
