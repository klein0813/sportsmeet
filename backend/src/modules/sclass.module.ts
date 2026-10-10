// 应用程序的根模块
import { Module } from '@nestjs/common';
import { Sclass, SclassSchema } from 'src/schemas/sclass.schema';
import { SclassController } from 'src/controllers/sclass.controller';
import { SclassService } from 'src/services/sclass.service';

// 如果想在另外的模块中使用这个模型，将MongooseModule添加到UserModule的exports部分并在其他模块中导入UserModule
// const UserMongooseModule = MongooseModule.forFeature([
//   // name «String|Function» model name or class extending Model
//   // [schema] «Schema» the schema to use
//   // [collection] «String» name (optional, inferred from model name)
//   { name: User.name, schema: UserSchema, collection: User.getCollectionName() },
// ]);
const SclassMongooseModule = Sclass.getMongooseModule(
  Sclass.name,
  SclassSchema,
);

@Module({
  imports: [SclassMongooseModule],
  controllers: [SclassController],
  providers: [SclassService],
  exports: [SclassMongooseModule],
})
export class SclassModule {}
