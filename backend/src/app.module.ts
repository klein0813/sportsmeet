import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
// import { ActivityModule } from './modules/comps/activity.module';

@Module({
  imports: [
    // ActivityModule,
    MongooseModule.forRoot('mongodb://localhost:27017/sportsmeet'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
