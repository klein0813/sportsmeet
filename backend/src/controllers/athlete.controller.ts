import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AthleteService } from '../services/athlete.service';
import {
  API_ATHLETE,
  API_COUNT,
  API_FIND,
  API_ID,
  API_BATCH,
  API_SID,
} from 'src/utils/constants';

@Controller(API_ATHLETE)
export class AthleteController {
  constructor(private readonly athleteService: AthleteService) {}

  @Get()
  get(@Query() query: any) {
    const q = {};
    if (query?.projectName) {
      q['projects'] = query.projectName;
    }
    if (query?.projectGroup) {
      q['gender'] = query.projectGroup;
    }
    if (query?.keyword) {
      return this.athleteService.findByKeyword(query.keyword, q);
    }
    return this.athleteService.get(q);
  }

  @Get(API_SID)
  getBySidKeyword(@Query() query: any) {
    return this.athleteService.getBySidKeyword(query.keyword);
  }

  @Get(API_COUNT)
  count() {
    return this.athleteService.count();
  }

  @Get(API_FIND)
  findByName(@Query() query: any) {
    return this.athleteService.findByName(query.name);
  }

  @Get(API_ID)
  findById(@Param() params: any) {
    return this.athleteService.findById(params.id);
  }

  // @Post()
  // create(@Body() body: any) {
  //   return this.athleteService.create(
  //     body.name,
  //     body.type,
  //     body.group,
  //     body.record,
  //   );
  // }

  @Post(API_BATCH)
  batchInsert(@Body() body: any) {
    return this.athleteService.batchInsert(body.data);
  }
}
