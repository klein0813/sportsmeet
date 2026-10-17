<script setup>
import ECharts from '@/components/ECharts.vue';
import { ref, watch } from 'vue';

const props = defineProps(['data']);
const chartRef = ref(null)
const dataset = {
  source: [
    ['记录项目数', 0],
    ['记录刷新项目数', 0],
    ['记录刷新人次', 0],
  ]
};
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
  dataset,
  xAxis: { type: 'category' },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [{ type: 'bar' }]
});

watch(() => props.data, ({ recordCount, newRecordCount, flashCount }) => {
  chartOptions.value.dataset = {
    source: [
      ['记录项目数', recordCount[0].count],
      ['记录刷新项目数', newRecordCount[0].count],
      ['记录刷新人次', flashCount],
    ],
  }
  chartRef.value.chart.setOption(chartOptions, true)
}, { deep: true });
</script>

<template>
  <ECharts ref="chartRef" :options="chartOptions"></ECharts>
</template>

<style lang="less" scoped>
</style>
