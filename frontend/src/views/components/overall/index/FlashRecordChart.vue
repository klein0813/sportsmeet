<script setup>
import ECharts from '@/components/ECharts.vue';
import { ref } from 'vue';

// const statCompletionData = ref({});
const chartOptions =ref({
  title: {
    text: '记录刷新情况',
  },
  legend: {},
  tooltip: {},
  label: {
    show: true,
    position: 'inside'
  },
  dataset: {
    source: [
      ['记录项目数', 43.3],
      ['记录刷新项目数', 83.1],
      ['记录刷新人次', 86.4],
    ]
  },
  xAxis: { type: 'category' },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [{ type: 'bar' }]
});
</script>

<template>
  <ECharts :options="chartOptions"></ECharts>
</template>

<style lang="less" scoped>
</style>
