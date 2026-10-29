<script setup>
import { ref } from 'vue';
import { statCompletion, getFlashCount, getGradeTop3 } from '@/api';
import CompletionChart from './CompletionChart.vue';
import Top3Chart from './Top3Chart.vue';
import FlashRecordChart from './FlashRecordChart.vue';

const completionChartData = ref({});
const flashRecordChartData = ref({
  recordCount: 0,
  newRecordCount: 0,
});
const top3ChartData = ref({
  高一: [
  ],
  高二: [
  ],
  高三: [
  ],
});

statCompletion().then(({ data: { overall, byGrade, recordCount, newRecordCount } }) => {
  completionChartData.value = { overall, byGrade };
  flashRecordChartData.value.recordCount = recordCount;
  flashRecordChartData.value.newRecordCount = newRecordCount;
});
getFlashCount().then(({ data }) => { flashRecordChartData.value.flash = data; })
getGradeTop3().then(({ data }) => { top3ChartData.value = data; })
</script>

<template>
  <div style="display: flex">
    <CompletionChart :data="completionChartData"></CompletionChart>
    <FlashRecordChart :data="flashRecordChartData"></FlashRecordChart>
  </div>
  <Top3Chart :data="top3ChartData"></Top3Chart>
</template>

<style lang="less" scoped>
</style>
