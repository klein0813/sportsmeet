<script setup>
import ECharts from '@/components/ECharts.vue';
import { ref, watch } from 'vue';

const props = defineProps(['data']);

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
        // { type: 'max', name: 'Max' },
        { type: 'min', name: '最低完成度' }
      ]
    },
  }]
});

watch(() => props.data, ({ overall, byGrade }) => {
  const totalDone = overall[0]?.totalDone || 0;
  const projectCount = overall[0]?.projectCount || 0;
  const g1Done = byGrade[0]?.g1Done || 0;
  const g2Done = byGrade[0]?.g2Done || 0;
  const g3Done = byGrade[0]?.g3Done || 0;
  const gradeTotal = projectCount;
  chartOptions.value.dataset = {
    source: [
      ['product', '总数', '完赛数'],
      ['整体', projectCount * 3, totalDone],
      ['高一', gradeTotal, g1Done],
      ['高二', gradeTotal, g2Done],
      ['高三', gradeTotal, g3Done],
    ],
  }
  chartRef.value.chart.setOption(chartOptions, true)
});
</script>

<template>
  <ECharts ref="chartRef" :options="chartOptions"></ECharts>
</template>

<style lang="less" scoped>
</style>
