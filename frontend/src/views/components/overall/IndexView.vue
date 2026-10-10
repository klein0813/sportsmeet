<script setup>
import { computed } from 'vue';
import TopView from './TopView.vue';
import GroupView from './GroupView.vue';
const props = defineProps(['grade']);

const cgrade = computed(() => {
  switch (props.grade) {
    case '1':
      return '高一'
    case '2':
      return '高二'
    case '3':
      return '高三'
    default:
      return '高一'
  }
});

</script>

<template>
  <a-card :title="`${cgrade}单项前六名成绩表`" :headStyle="{ textAlign: 'center' }">
    <TopView :grade="props.grade"></TopView>
  </a-card>
  <a-card :title="`${cgrade}团体总分成绩表`" :headStyle="{ textAlign: 'center' }" style="margin-top: 10px">
    <GroupView :grade="props.grade"></GroupView>
  </a-card>
</template>

<style lang="less" scoped>
</style>
