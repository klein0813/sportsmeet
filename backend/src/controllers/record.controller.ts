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
  API_FLASH_COUNT,
  API_EXPORT_FLASH_RECORD_DATA,
  GROUP_LEVEL_MAPPING,
  API_REVOKE,
} from 'src/utils/constants';
import CopmsUtil from 'src/utils/comps.util';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';
import * as contentDisposition from 'content-disposition';
import { isValidObjectId } from 'mongoose';

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
    if (STR_GROUPS.includes(query.group)) {
      q['projectGroup'] = Number.parseInt(query.group);
    }
    if (STR_ROUNDS.includes(query.round)) {
      q['round'] = Number.parseInt(query.round);
    }
    if (GRADE_MAPPING[query.grade]) {
      q['athleteGrade'] = Number.parseInt(query.grade);
    }
    if (query.class && !isNaN(Number(query.class))) {
      q['athleteClass'] = query.class;
    }
    if (query.sid && !isNaN(Number(query.sid))) {
      q['athleteSid'] = query.sid;
    }
    if (query.recordBreaking && ['0', '1'].includes(query.recordBreaking)) {
      q['recordBreaking'] = query.recordBreaking === '1';
    }
    return this.recordService.get(page, size, q);
  }

  @Get(API_COUNT)
  count() {
    return this.recordService.count();
  }

  @Get(API_FIND)
  findProjectRecord(@Query() query: any) {
    const { projectId, grade, round } = query;
    if (
      isValidObjectId(projectId) &&
      GRADE_MAPPING[grade] &&
      STR_ROUNDS.includes(round)
    ) {
      return this.recordService.findProjectRecord(
        projectId,
        Number.parseInt(grade),
        Number.parseInt(round),
      );
    }
    return [];
  }

  @Post(API_BATCH)
  batchInsert(@Body() body: any) {
    return this.recordService.batchInsert(body.data);
  }

  @Post(API_REVOKE)
  revokeProjectRecore(@Body() body: any) {
    const { projectId, grade, round } = body;
    if (
      isValidObjectId(projectId) &&
      GRADE_MAPPING[grade] &&
      STR_ROUNDS.includes(`${round}`)
    ) {
      return this.recordService.revokeProjectAndRecalculate(
        projectId,
        Number.parseInt(grade),
        Number.parseInt(round),
      );
    }
    return false;
  }

  @Get(API_GET_TOP)
  getTop(@Query() query: any) {
    const top = Number.parseInt(query.top);
    const grade = Number.parseInt(query.grade);
    return this.recordService.getTop(top, grade);
  }

  @Get(API_FLASH_COUNT)
  getFlashCount() {
    return this.recordService.getFlashCount();
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
      { header: '类型', key: 'projectGroup' },
      { header: '项目', key: 'projectName' },
      { header: '号码', key: 'athleteSid' },
      { header: '姓名', key: 'athleteName' },
      { header: '班级', key: 'athleteClass' },
      { header: '成绩', key: 'level' },
      { header: '名次', key: 'ranking' },
      { header: '积分', key: 'score' },
    ];
    const q = {};
    if (query?.top) {
      q['ranking'] = { $lte: parseInt(query.top) };
    }
    const records = await this.recordService.getExportData(q);
    records.forEach((record: any) => {
      worksheet.addRow({
        athleteGrade: GRADE_MAPPING[record.athleteGrade],
        athleteSid: record.athleteSid,
        athleteName: record.athleteName,
        athleteClass: record.athleteClass,
        level: CopmsUtil.levelNumber2String(
          record.projectName,
          `${record.level}`,
        ),
        projectGroup: GENDER_MAPPING[record.projectGroup],
        projectName: GROUP_LEVEL_MAPPING[record.projectName],
        ranking: RANKING_MAPPING[record.ranking],
        score: record.score,
      });
    });

    // 设置列宽
    worksheet.columns.forEach((column) => {
      column.width = 10;
    });
    // 设置行高
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.height = 24;
    });

    // 设置表头行（假设是第一行）
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // 给第 1 行到第 10 行，1 到 4 列的所有单元格加边框
    for (let i = 1; i <= records.length + 1; i++) {
      worksheet.getColumn(i).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 9; j++) {
        row.getCell(j).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    worksheet.headerFooter = {
      // 奇数页页眉（默认所有页）
      oddHeader: '&L运动会项目数据&C第 &P 页，共 &N 页',
      // 奇数页页脚：左侧版权，右侧打印时间
      oddFooter:
        '&L&"微软雅黑"&9运动会成绩管理系统 ©2026 Klein&R&"微软雅黑"&9打印时间：&D &T',
    };
    worksheet.protect('yq', {
      selectLockedCells: true, // 允许用户选中被锁定的单元格（通常设为 true，方便查看）
      selectUnlockedCells: true, // 允许用户选中未锁定的单元格
      formatCells: false, // 禁止修改单元格格式
      insertRows: false, // 禁止插入行
      deleteRows: false, // 禁止删除行
      sort: false, // 禁止排序
    });

    // 生成 Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 将 Buffer 转换为 Readable 流
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // 表示流结束

    return new StreamableFile(stream);
  }

  @Get(API_EXPORT_FLASH_RECORD_DATA)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    `attachment; filename=${contentDisposition('运动会纪录刷新数据.xlsx')}`,
  )
  async downloadFlashRecordExcel(): Promise<StreamableFile> {
    const workbook = new ExcelJS.Workbook();
    // 添加一个工作表
    const worksheet = workbook.addWorksheet('详细');

    // 添加一些数据
    worksheet.columns = [
      { header: '类型', key: 'projectGroup' },
      { header: '项目', key: 'projectName' },
      { header: '号码', key: 'athleteSid' },
      { header: '年级', key: 'athleteGrade' },
      { header: '班级', key: 'athleteClass' },
      { header: '姓名', key: 'athleteName' },
      { header: '成绩', key: 'level' },
      { header: '原记录', key: 'orignRecord' },
    ];
    const q = {
      recordBreaking: true,
    };
    const records = await this.recordService.getExportFlashData(q);
    records.forEach((record: any) => {
      worksheet.addRow({
        athleteGrade: GRADE_MAPPING[record.athleteGrade],
        athleteSid: record.athleteSid,
        athleteName: record.athleteName,
        athleteClass: record.athleteClass,
        level: CopmsUtil.levelNumber2String(
          record.projectName,
          `${record.level}`,
        ),
        orignRecord: CopmsUtil.levelNumber2String(
          record.projectName,
          `${record.orignRecord}`,
        ),
        projectGroup: GENDER_MAPPING[record.projectGroup],
        projectName: GROUP_LEVEL_MAPPING[record.projectName],
      });
    });

    // 设置列宽
    worksheet.columns.forEach((column) => {
      column.width = 11.2;
    });
    // 设置行高
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.height = 24;
    });

    // 设置表头行（假设是第一行）
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
    });

    // 给第 1 行到第 10 行，1 到 4 列的所有单元格加边框
    for (let i = 1; i <= records.length + 1; i++) {
      worksheet.getColumn(i).alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      const row = worksheet.getRow(i);
      for (let j = 1; j <= 8; j++) {
        row.getCell(j).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      }
    }

    worksheet.headerFooter = {
      // 奇数页页眉（默认所有页）
      oddHeader: '&L运动会纪录刷新数据&C第 &P 页，共 &N 页',
      // 奇数页页脚：左侧版权，右侧打印时间
      oddFooter:
        '&L&"微软雅黑"&9运动会成绩管理系统 ©2026 Klein&R&"微软雅黑"&9打印时间：&D &T',
    };
    worksheet.protect('yq', {
      selectLockedCells: true, // 允许用户选中被锁定的单元格（通常设为 true，方便查看）
      selectUnlockedCells: true, // 允许用户选中未锁定的单元格
      formatCells: false, // 禁止修改单元格格式
      insertRows: false, // 禁止插入行
      deleteRows: false, // 禁止删除行
      sort: false, // 禁止排序
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
