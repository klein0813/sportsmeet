// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Project, ProjectSchema } from 'src/schemas/project.schema';
import { ProjectController } from 'src/controllers/project.controller';
import { ProjectService } from 'src/services/project.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const ProjectMongooseModule = Project.getMongooseModule(
  Project.name,
  ProjectSchema,
);

@Module({
  imports: [ProjectMongooseModule],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectMongooseModule],
})
export class ProjectModule {}
