<template>
  <a-button @click="exportToExcel">导出</a-button>
</template>
   
<script setup>
import { toRaw } from 'vue';
import * as XLSX from 'xlsx';
import { EXPORT_EXCEL_HEADERS, EXPORT_EXCEL_HEADER_T } from '@/utils/constant'

const props = defineProps(['data', 'filename']);

function exportToExcel() {
  // 定义数据
  const data = toRaw(props.data).value;
  const pdata = []
  if (!data || data.length < 1) {
    console.warn('无数据')
    return;
  }
  let rawData = []
  for (let item of EXPORT_EXCEL_HEADERS) {
    rawData.push(EXPORT_EXCEL_HEADER_T[item])
  }
  pdata.push(rawData)

  for (let i = 0; i < data.length; i++) {
    rawData = [i + 1]
    const dataitem = data[i];
    for (let item of EXPORT_EXCEL_HEADERS) {
      rawData.push(dataitem[item])
    }
    pdata.push(rawData)
  }

  // 将数据转换为工作表
  const ws = XLSX.utils.aoa_to_sheet(pdata??[]);
  
  // 创建工作簿并添加工作表
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  // 生成Excel文件并触发下载
  XLSX.writeFile(wb, `${props.filename}${(new Date()).getTime()}.xlsx`);
}
</script>
