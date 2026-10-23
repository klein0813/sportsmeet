import { Controller, Get, Header, Query, StreamableFile } from '@nestjs/common';
import { SclassService } from '../services/sclass.service';
import {
  API_SCLASS,
  API_COUNT,
  API_FIND,
  API_GRADE_TOP_THREE,
  API_EXPORT_RANKING_DATA,
} from 'src/utils/constants';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';
import * as contentDisposition from 'content-disposition';

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

  @Get(API_GRADE_TOP_THREE)
  getTopThreeByGrade() {
    return this.sclassService.getTopThreeByGrade();
  }

  @Get('t')
  t() {
    return this.sclassService.getRankingData();
  }

  @Get(API_EXPORT_RANKING_DATA)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    `attachment; filename=${contentDisposition('运动会年级积分排名.xlsx')}`,
  )
  async downloadClassRankingExcel(): Promise<StreamableFile> {
    // 年级映射配置
    const gradeConfigs = [
      { grade: 1, sheetName: '高一' },
      { grade: 2, sheetName: '高二' },
      { grade: 3, sheetName: '高三' },
    ];

    const workbook = new ExcelJS.Workbook();
    const dbData = await this.sclassService.getRankingData();

    // 1. 循环遍历三个年级
    for (const config of gradeConfigs) {
      // 创建 Sheet
      const worksheet = workbook.addWorksheet(config.sheetName);
      // 过滤出当前年级的数据
      const currentData = dbData.filter((item) => item.grade === config.grade);
      this.sclassService.sort(currentData);
      // 设置表头
      worksheet.columns = [
        { header: '班级', key: 'name' },
        { header: '成绩', key: 'score' },
        { header: '排名', key: 'ranking' },
      ];
      // 5. 将数据填入表格
      worksheet.addRows(currentData);

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      // 设置列宽
      worksheet.columns.forEach((column) => {
        column.width = 30;
      });
      // 设置行高
      worksheet.eachRow({ includeEmpty: false }, (row) => {
        row.height = 24;
      });
      // 所有单元格加边框
      for (let i = 1; i <= currentData.length + 1; i++) {
        worksheet.getColumn(i).alignment = {
          vertical: 'middle',
          horizontal: 'center',
        };
        const row = worksheet.getRow(i);
        for (let j = 1; j <= 3; j++) {
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
        oddHeader: '&L运动会年级积分排名&C第 &P 页，共 &N 页',
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
    }
    // 设置表头行（假设是第一行）
    // const headerRow = worksheet.getRow(1);
    // headerRow.eachCell((cell) => {
    //   cell.font = { bold: true };
    // });

    // 生成 Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 将 Buffer 转换为 Readable 流
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // 表示流结束

    return new StreamableFile(stream);
  }
}
