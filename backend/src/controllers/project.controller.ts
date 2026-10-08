import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import {
  API_PROJECT,
  API_COUNT,
  API_FIND,
  API_ID,
  API_BATCH,
} from 'src/utils/constants';

@Controller(API_PROJECT)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  get() {
    return this.projectService.get();
  }

  @Get(API_COUNT)
  count() {
    return this.projectService.count();
  }

  @Get(API_FIND)
  findByName(@Query() query: any) {
    return this.projectService.findByName(query.name);
  }

  @Get(API_ID)
  findById(@Param() params: any) {
    return this.projectService.findById(params.id);
  }

  @Post()
  create(@Body() body: any) {
    return this.projectService.create(
      body.name,
      body.type,
      body.group,
      body.record,
    );
  }

  @Post(API_BATCH)
  batchInsert(@Body() body: any) {
    return this.projectService.batchInsert(body.data);
  }
}
