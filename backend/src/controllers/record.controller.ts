import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { RecordService } from '../services/record.service';
import {
  API_RECORD,
  API_COUNT,
  API_FIND,
  API_BATCH,
  GENDER_MAPPING,
  GRADE_MAPPING,
  RANKING_MAPPING,
  API_EXPORT_PROJECT_RECORD_DATA,
  API_INIT,
  API_GET_TOP,
  PROJECTS,
  STR_GROUPS,
  STR_ROUNDS,
} from 'src/utils/constants';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';
import * as contentDisposition from 'content-disposition';

@Controller(API_RECORD)
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Get(API_INIT)
  init() {
    return this.recordService.init();
  }

  @Get()
  get(@Query() query: any) {
    const q = {};
    const page = Number.parseInt(query.current);
    const size = Number.parseInt(query.pageSize);
    if (query.projectName && PROJECTS.includes(query.projectName)) {
      q['projectName'] = query.projectName;
    }
    if (STR_GROUPS.includes[query.group]) {
      q['projectGroup'] = Number.parseInt(query.group);
    }
    if (STR_ROUNDS.includes[query.round]) {
      q['projectGroup'] = query.round;
    }
    return this.recordService.get(page, size, q);
  }

  @Get(API_COUNT)
  count() {
    return this.recordService.count();
  }

  @Get(API_FIND)
  findByName(@Query() query: any) {
    return this.recordService.findByName(query.name);
  }

  @Post(API_BATCH)
  batchInsert(@Body() body: any) {
    console.log(API_RECORD, API_BATCH, body.data);
    return this.recordService.batchInsert(body.data);
  }

  @Get(API_GET_TOP)
  getTop(@Query() query: any) {
    const top = Number.parseInt(query.top);
    const grade = Number.parseInt(query.grade);
    return this.recordService.getTop(top, grade);
  }

  @Get(API_EXPORT_PROJECT_RECORD_DATA)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    `attachment; filename=${contentDisposition('运动会项目数据.xlsx')}`,
  )
  async downloadExcel(@Query() query: any): Promise<StreamableFile> {
    const workbook = new ExcelJS.Workbook();
    // 添加一个工作表
    const worksheet = workbook.addWorksheet('详细');

    // 添加一些数据
    worksheet.columns = [
      // { header: 'ID', key: 'id', width: 10 },
      // { header: 'Name', key: 'name', width: 30 },
      { header: '年级', key: 'athleteGrade' },
      { header: '号码', key: 'athleteSid' },
      { header: '姓名', key: 'athleteName' },
      { header: '班级', key: 'athleteClass' },
      { header: '成绩', key: 'level' },
      { header: '类型', key: 'projectGroup' },
      { header: '项目', key: 'projectName' },
      { header: '名次', key: 'ranking' },
      { header: '积分', key: 'score' },
    ];
    const q = {};
    if (query?.top) {
      q['ranking'] = { $lte: parseInt(query.top) };
    }
    if (query?.finish) {
      q['round'] = 1;
      q['round'] = query.finish == 0 ? 1 : { $in: [2, 3] };
    }
    const records = await this.recordService.getExportData(q);
    records.forEach((record: any) => {
      worksheet.addRow({
        athleteGrade: GRADE_MAPPING[record.athleteGrade],
        athleteSid: record.athleteSid,
        athleteName: record.athleteName,
        athleteClass: record.athleteClass,
        level: record.level,
        projectGroup: GENDER_MAPPING[record.projectGroup],
        projectName: record.projectName,
        ranking: RANKING_MAPPING[record.ranking],
        score: record.score,
      });
    });

    // 设置列宽
    worksheet.columns.forEach((column) => {
      column.width = column.width || 10; // 设置默认宽度为10，根据需要调整
    });

    // 生成 Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 将 Buffer 转换为 Readable 流
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // 表示流结束

    return new StreamableFile(stream);
  }
}
