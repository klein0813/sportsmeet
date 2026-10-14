<template>
  <div class="chart-wrapper">
    <div class="chart-actions">
      <a-button size="small" @click="exportChart">
        <template #icon><DownloadOutlined /></template>
        导出图表
      </a-button>
      <a-button size="small" type="primary" @click="exportAll">
        <template #icon><FileExcelOutlined /></template>
        导出全部
      </a-button>
    </div>

    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons-vue'

const chartRef = ref(null)
let chart = null

const data = {
  高一: [
    { className: '一班', score: 95 },
    { className: '二班', score: 90 },
    { className: '三班', score: 85 },
  ],
  高二: [
    { className: '三班', score: 88 },
    { className: '一班', score: 82 },
    { className: '二班', score: 80 },
  ],
  高三: [
    { className: '二班', score: 92 },
    { className: '三班', score: 87 },
    { className: '一班', score: 83 },
  ],
}

const grades = ['高一', '高二', '高三']
const rankNames = ['第1名', '第2名', '第3名']
const colors = ['#1677ff', '#52c41a', '#faad14']

function initChart() {
  chart = echarts.init(chartRef.value)

  const series = rankNames.map((rankName, rankIndex) => ({
    name: rankName,
    type: 'bar',
    barGap: '10%',
    barCategoryGap: '30%',
    itemStyle: { color: colors[rankIndex], borderRadius: [4, 4, 0, 0] },
    data: grades.map(grade => data[grade][rankIndex]?.score || 0),
    label: {
      show: true,
      position: 'top',
      formatter: (params) => {
        const grade = grades[params.dataIndex]
        const item = data[grade][rankIndex]
        return item ? `${item.className}（${item.score}）` : ''
      },
      color: '#333',
      fontSize: 12,
    },
  }))

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const grade = params[0].axisValue
        let html = `<strong>${grade}</strong><br/>`
        params.forEach(p => {
          const item = data[grade][p.seriesIndex]
          if (item) {
            html += `${item.className}：${item.score} 分<br/>`
          }
        })
        return html
      },
    },
    legend: { data: rankNames, top: '10%', right: 0 },
    title: {
      text: '年级积分前三名',
    },
    grid: { top: '15%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: grades },
    yAxis: { type: 'value', name: '积分' },
    series,
  })
}

// 导出当前图表
function exportChart() {
  if (!chart) return
  const dataURL = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff',
  })
  const link = document.createElement('a')
  link.href = dataURL
  link.download = `年级前三名积分_${Date.now()}.png`
  link.click()
}

// 导出全部数据
function exportAll() {
  const rows = []
  grades.forEach(grade => {
    data[grade].forEach((item, index) => {
      rows.push({
        年级: grade,
        名次: `第${index + 1}名`,
        班级: item.className,
        积分: item.score,
      })
    })
  })

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['年级', '名次', '班级', '积分'],
  })
  worksheet['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '前三名积分')
  XLSX.writeFile(workbook, `年级前三名积分_${Date.now()}.xlsx`)
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 370px;
  /* 450 */
}
.chart {
  width: 100%;
  height: 100%;
}
.chart-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
</style>
