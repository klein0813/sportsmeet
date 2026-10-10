import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { ProjectModule } from './modules/project.module';
import { AthleteModule } from './modules/athlete.module';
import { RecordModule } from './modules/record.module';
import { SclassModule } from './modules/sclass.module';

@Module({
  imports: [
    ProjectModule,
    AthleteModule,
    RecordModule,
    SclassModule,
    MongooseModule.forRoot('mongodb://localhost:27017/sportsmeet'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
