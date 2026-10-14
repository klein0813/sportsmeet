<script setup>
// import { ref } from 'vue';
import CompletionChart from './CompletionChart.vue';
import Top3Chart from './Top3Chart.vue';
import FlashRecordChart from './FlashRecordChart.vue';

</script>

<template>
  <div style="display: flex">
    <CompletionChart></CompletionChart>
    <FlashRecordChart></FlashRecordChart>
  </div>
  <Top3Chart></Top3Chart>
</template>

<style lang="less" scoped>
</style>
