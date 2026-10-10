import { Controller, Get, Query } from '@nestjs/common';
import { SclassService } from '../services/sclass.service';
import { API_SCLASS, API_COUNT, API_FIND } from 'src/utils/constants';

@Controller(API_SCLASS)
export class SclassController {
  constructor(private readonly sclassService: SclassService) {}

  @Get()
  get(@Query() query: any) {
    const { grade } = query;
    const q = {};
    if (grade) {
      q['grade'] = Number.parseInt(grade);
    }
    return this.sclassService.get(q);
  }

  @Get(API_COUNT)
  count() {
    return this.sclassService.count();
  }

  @Get(API_FIND)
  findByName(@Query() query: any) {
    return this.sclassService.findByName(query.name);
  }
}
