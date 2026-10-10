import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectDocument } from 'src/schemas/project.schema';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel('Project') private projectModel: Model<ProjectDocument>,
  ) {}

  // private readonly user: User = {
  //   email: '',
  //   password: '',
  // };

  get(query) {
    return this.projectModel.find({
      ...query,
      isDeleted: false,
    });
  }

  count() {
    return this.projectModel.countDocuments({ isDeleted: false });
  }

  findById(id: string) {
    return this.projectModel.findById(id);
  }

  findByName(name) {
    return this.projectModel.findOne({ name, isDeleted: false });
  }

  create(name: string, type: number, record: number, group: number) {
    return this.projectModel.create({ name, type, record, group });
  }

  batchInsert(datas) {
    return this.projectModel.insertMany(datas);
  }
}
