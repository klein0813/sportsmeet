<script setup>
import ECharts from '@/components/ECharts.vue';
import { ref } from 'vue';
import { statCompletion } from '@/api';

const chartRef = ref(null)
const dataset = {
    source: [
      ['product', '总数', '完赛数'],
      ['整体', 0, 0],
      ['高一', 0, 0],
      ['高二', 0, 0],
      ['高三', 0, 0],
    ]
  };
// const statCompletionData = ref({});
const chartOptions = ref({
  title: {
    text: '项目完成情况',
  },
  label: {
    show: true,
    position: 'inside'
  },
  legend: {},
  tooltip: {},
  dataset,
  xAxis: { type: 'category' },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [
  {
    type: 'bar',
  },
  {
    type: 'bar',
    markPoint: {
      data: [
        { type: 'max', name: 'Max' },
        { type: 'min', name: 'Min' }
      ]
    },
  }]
});

statCompletion().then(({ data: { overall, byGrade } }) => {
  const { totalDone, projectCount } = overall[0];
  const { g1Done, g2Done, g3Done } = byGrade[0];
  const gradeTotal = projectCount / 3;
  chartOptions.value.dataset = {
    source: [
      ['product', '总数', '完赛数'],
      ['整体', projectCount, totalDone],
      ['高一', gradeTotal, g1Done],
      ['高二', gradeTotal, g2Done],
      ['高三', gradeTotal, g3Done],
    ],
  }
  chartRef.value.chart.setOption(chartOptions, true)
})
</script>

<template>
  <ECharts ref="chartRef" :options="chartOptions"></ECharts>
</template>

<style lang="less" scoped>
</style>
