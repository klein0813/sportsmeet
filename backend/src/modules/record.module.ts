// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Record, RecordSchema } from 'src/schemas/Record.schema';
import { RecordController } from 'src/controllers/Record.controller';
import { RecordService } from 'src/services/record.service';
import { AthleteService } from 'src/services/athlete.service';
import { ProjectService } from 'src/services/project.service';
import { AthleteModule } from './athlete.module';
import { ProjectModule } from './project.module';
import { Sclass, SclassSchema } from 'src/schemas/sclass.schema';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const RecordMongooseModule = Record.getMongooseModule(
  Record.name,
  RecordSchema,
);

const SclassMongooseModule = Sclass.getMongooseModule(
  Sclass.name,
  SclassSchema,
);

@Module({
  imports: [
    RecordMongooseModule,
    AthleteModule,
    ProjectModule,
    SclassMongooseModule,
  ],
  controllers: [RecordController],
  providers: [RecordService, AthleteService, ProjectService],
  exports: [RecordMongooseModule],
})
export class RecordModule {}
