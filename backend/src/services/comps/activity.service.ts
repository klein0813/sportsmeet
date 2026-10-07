import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityDocument } from 'src/schemas/comps/activity.schema';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel('Activity') private activityModel: Model<ActivityDocument>,
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  get() {
    return this.activityModel.find({ isDeleted: false });
  }

  count() {
    return this.activityModel.countDocuments({ isDeleted: false });
  }

  findById(id: string) {
    return this.activityModel.findById(id);
  }

  findByName(name) {
    return this.activityModel.findOne({ name, isDeleted: false });
  }

  create(name: string, title: string, rule: number, scoresys: number) {
    return this.activityModel.create({ name, title, rule, scoresys });
  }
}
