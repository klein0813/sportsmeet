import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import * as Excel from 'exceljs';
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
    const { keyword, grade, project, group } = query;

    return this.athleteService.getBySidKeyword(
      keyword,
      Number.parseInt(grade),
      Number.parseInt(group),
      project,
    );
  }

  @Get(API_COUNT)
  count() {
    return this.athleteService.count();
  }

  @Get(API_FIND)
  findByName(@Query() query: any) {
    return this.athleteService.findByName(query.name);
  }

  @Get('init')
  async init() {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile('src/utils/学生名单.xlsx');
    const worksheet = workbook.getWorksheet(1);

    const athletes = {};
    // 从第 2 行开始遍历（跳过第 1 行表头）
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // 跳过表头

      // row.values 返回的是一个数组，索引 0 是空位，数据从索引 1 开始
      // 例如：[ <1 empty item>, '101', 292, 120 ]
      // console.log(`第 ${rowNumber} 行数据:`, row.values);

      // 获取单个单元格的值
      const sid = row.getCell(2).value as string; // 号码
      const project = row.getCell(6).value; // 项目
      if (athletes[sid]) {
        athletes[sid]['projects'].push(project);
        return;
      }
      const grade = row.getCell(1).value; // 年级
      const name = row.getCell(3).value; // 姓名
      const className = row.getCell(4).value; // 班级
      const gender = row.getCell(5).value; // 性别
      athletes[sid] = {
        sid,
        grade,
        name,
        class: className,
        gender,
        projects: [project],
        flag: '2026',
      };
    });
    this.athleteService.batchInsert(Object.values(athletes));

    return true;
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
