import { Workbook } from 'exceljs';

export async function createTop3Excel(data) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet('积分前三名');

  // ==========================================
  // 1. 基础设置：列宽 (6列，列宽12)
  // ==========================================
  for (let i = 1; i <= 6; i++) {
    worksheet.getColumn(i).width = 14.9;
  }

  // 定义边框和居中的公共样式
  const commonStyle = {
    alignment: { vertical: 'middle', horizontal: 'center' },
    border: {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
  };

  // ==========================================
  // 2. 封装生成单个年级区块的函数
  // ==========================================
  /**
   * @param {number} startRow 起始行号
   * @param {string} gradeName 年级名称
   * @param {Array} row3Data 第三行表头数据
   * @param {Array} row4Data 第四行数据
   */
  const createGradeBlock = (startRow, gradeName, row3Data, row4Data) => {
    // 2.1 设置前四行高度为 35，第五行为 15
    for (let i = 0; i < 4; i++) worksheet.getRow(startRow + i).height = 35;
    worksheet.getRow(startRow + 4).height = 15;

    // 2.2 写入并合并第一行
    worksheet.mergeCells(`A${startRow}:F${startRow}`);
    worksheet.getCell(`A${startRow}`).value = gradeName;

    // 2.3 写入并合并第二行
    worksheet.mergeCells(`A${startRow + 1}:B${startRow + 1}`);
    worksheet.getCell(`A${startRow + 1}`).value = '第一名';
    
    worksheet.mergeCells(`C${startRow + 1}:D${startRow + 1}`);
    worksheet.getCell(`C${startRow + 1}`).value = '第二名';
    
    worksheet.mergeCells(`E${startRow + 1}:F${startRow + 1}`);
    worksheet.getCell(`E${startRow + 1}`).value = '第三名';

    // 2.4 写入第三、四行数据
    worksheet.getRow(startRow + 2).values = row3Data;
    worksheet.getRow(startRow + 3).values = row4Data;

    // 2.5 为当前区块的前四行统一应用样式（边框、居中）
    for (let i = 0; i < 4; i++) {
      const row = worksheet.getRow(startRow + i);
      for (let j = 1; j <= 6; j++) {
        row.getCell(j).alignment = commonStyle.alignment;
        row.getCell(j).border = commonStyle.border;
      }
    }
  };

  const formatData = { grade1:[],grade2:[],grade3:[], }
  for (let key in data) {
    // 建议使用 hasOwnProperty 过滤掉原型链上的属性
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      formatData[key] = data[key].map((item) => [item.name, item.score]).flat();
    }
  }
  // ==========================================
  // 3. 生成各个年级的数据
  // ==========================================

  // 高一年级 (从第 1 行开始)
  createGradeBlock(
    1, 
    '高一年级', 
    ['班级', '分数', '班级', '分数', '班级', '分数'], 
    formatData['grade1'],
  );

  // 高二年级 (从第 6 行开始，因为高一占了 1-4 行，第 5 行行高 15)
  createGradeBlock(
    6, 
    '高二年级', 
    ['班级', '分数', '班级', '分数', '班级', '分数'], 
    formatData['grade2'],
  );

  // 高三年级 (从第 11 行开始，高二占了 6-9 行，第 10 行行高 15)
  createGradeBlock(
    11, 
    '高三年级', 
    ['班级', '分数', '班级', '分数', '班级', '分数'], 
    formatData['grade3'], // 这里填入高三的数据
  );
  // ==========================================
  // 5. 导出文件
  // ==========================================
  // 1. 将工作簿写入内存缓冲区
  const buffer = await workbook.xlsx.writeBuffer();

  // 2. 将 Buffer 转成 Blob 对象（指定正确的 xlsx MIME 类型）
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // 3. 创建一个临时下载链接并触发点击
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '年级积分前三名.xlsx'; // 你要下载的文件名
  document.body.appendChild(link);
  link.click();

  // 4. 清理临时 URL 和 DOM 节点
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  console.log('Excel 文件已成功生成！');
}
