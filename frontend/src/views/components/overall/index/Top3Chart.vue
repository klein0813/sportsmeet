<script setup>
import ECharts from '@/components/ECharts.vue';
import { ref, watch } from 'vue';
import { createTop3Excel }  from './exportTop3.js';
const props = defineProps(['data']);

// const grades = ['高一', '高二', '高三']
const grades = [{ label: '高一', value: 'grade1' }, { label: '高二', value: 'grade2' }, { label: '高三', value: 'grade3' }]
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
    // data: grades.map((grade, index) => initData[`grade${index+1}`][rankIndex]?.score || 0),
    data: grades.map((grade) => initData[grade.value][rankIndex]?.score || 0),
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
        const { axisValue } = params[0]
        const currentGrade = grades.find(g => g.value === axisValue);
        const displayLabel = currentGrade ? currentGrade.label : axisValue;
        let html = `<strong>${displayLabel}</strong><br/>`
        params.forEach(p => {
          const item = initData[axisValue][p.seriesIndex]
          if (item) {
            html += `${item.name}：${item.score} 分<br/>`
          }
        })
        return html
      },
    },
    legend: { data: rankNames, top: '5%', left: '10%' },
    title: {
      text: '年级积分前三名',
    },
    grid: { top: '18%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      // 把原来的对象数组只提取 value 传给 data
      data: grades.map(item => item.value), 
      axisLabel: {
        // 当 ECharts 渲染刻度时，通过 formatter 把 value 翻译回 label
        formatter: function (value) {
          // 在原始数组中找匹配的项
          const target = grades.find(item => item.value === value);
          return target ? target.label : value;
        }
      }
    },
    yAxis: { type: 'value', name: '积分' },
    series,
  };
}

// 导出当前图表
function exportChart() {
  createTop3Excel(props.data).catch(console.error);
}

// 导出全部数据
function exportAll() {
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
    export-chart-btn-text="导出前三名"
    export-all-btn-text="导出整体排名"
    @export-chart="exportChart"
    @export-all="exportAll"
  >
  </ECharts>
</template>

<style lang="less" scoped>
</style>
