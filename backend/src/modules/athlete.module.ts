// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Athlete, AthleteSchema } from 'src/schemas/athlete.schema';
import { AthleteController } from 'src/controllers/athlete.controller';
import { AthleteService } from 'src/services/athlete.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const AthleteMongooseModule = Athlete.getMongooseModule(
  Athlete.name,
  AthleteSchema,
);

@Module({
  imports: [AthleteMongooseModule],
  controllers: [AthleteController],
  providers: [AthleteService],
  exports: [AthleteMongooseModule],
})
export class AthleteModule {}
