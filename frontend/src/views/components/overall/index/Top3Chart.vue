<script setup>
import ECharts from '@/components/ECharts.vue';
import { ref, watch } from 'vue';
const props = defineProps(['data']);

const grades = ['高一', '高二', '高三']
const rankNames = ['第1名', '第2名', '第3名']
const colors = ['#1677ff', '#52c41a', '#faad14']

const chartRef = ref(null)
const chartOptions = ref(initChart({
  'grade1': [
    { name: '', score: 0 },
    { name: '', score: 0 },
    { name: '', score: 0 },
  ],
  'grade2': [
    { name: '', score: 0 },
    { name: '', score: 0 },
    { name: '', score: 0 },
  ],
  'grade3': [
    { name: '', score: 0 },
    { name: '', score: 0 },
    { name: '', score: 0 },
  ],
}));

function initChart(initData) {
  const series = rankNames.map((rankName, rankIndex) => ({
    name: rankName,
    type: 'bar',
    barGap: '10%',
    barCategoryGap: '30%',
    itemStyle: { color: colors[rankIndex], borderRadius: [4, 4, 0, 0] },
    data: grades.map((grade, index) => initData[`grade${index+1}`][rankIndex]?.score || 0),
    label: {
      show: true,
      position: 'top',
      formatter: (params) => {
        const item = initData[`grade${params.dataIndex+1}`][rankIndex]
        return item ? `${item.name}（${item.score}）` : ''
      },
      color: '#333',
      fontSize: 12,
    },
  }))
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const grade = `grade${params[0].axisIndex+1}`
        let html = `<strong>${grade}</strong><br/>`
        params.forEach(p => {
          const item = initData[grade][p.seriesIndex]
          if (item) {
            html += `${item.name}：${item.score} 分<br/>`
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
  };
}

// 导出当前图表
function exportChart() {
  if (!chartRef.value.chart) return
  const dataURL = chartRef.value.chart.getDataURL({
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
        班级: item.name,
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

watch(() => props.data, (newVal) => {
  chartOptions.value = initChart(newVal);
  chartRef.value.chart.setOption(chartOptions, true)
}, { deep: true });
</script>

<template>
  <ECharts
    ref="chartRef"
    :options="chartOptions"
    :show-export-chart="true"
    :show-export-all="true"
    @export-chart="exportChart"
    @export-all="exportAll"
  >
  </ECharts>
</template>

<style lang="less" scoped>
</style>
