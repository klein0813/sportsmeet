import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ActivityService } from '../../services/comps/activity.service';
import {
  API_COMPS_ACTIVITY,
  API_COUNT,
  API_FIND,
  API_ID,
} from 'src/utils/constants';

@Controller(API_COMPS_ACTIVITY)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  get() {
    return this.activityService.get();
  }

  @Get(API_COUNT)
  count() {
    return this.activityService.count();
  }

  @Get(API_FIND)
  findByName(@Query() query: any) {
    return this.activityService.findByName(query.name);
  }

  @Get(API_ID)
  findById(@Param() params: any) {
    return this.activityService.findById(params.id);
  }

  @Post()
  create(@Body() body: any) {
    return this.activityService.create(
      body.name,
      body.title,
      body.rule,
      body.scoresys,
    );
  }
}
