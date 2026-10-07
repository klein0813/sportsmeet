// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Activity, ActivitySchema } from 'src/schemas/comps/activity.schema';
import { ActivityController } from 'src/controllers/comps/activity.controller';
import { ActivityService } from 'src/services/comps/activity.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const ActivityMongooseModule = Activity.getMongooseModule(
  Activity.name,
  ActivitySchema,
);

@Module({
  imports: [ActivityMongooseModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityMongooseModule],
})
export class ActivityModule {}
