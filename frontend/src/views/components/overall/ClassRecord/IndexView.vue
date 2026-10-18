<script setup>
import { ref } from 'vue';
import TopView from './TopView.vue';
import GroupView from './GroupView.vue';
import { GRADE_MAPPDING } from '@/utils/constant';
import PrintView from './PrintView.vue';

const gradeOptions = Object.entries(GRADE_MAPPDING).map(([k, v]) => ({ tab: v, key: k }));

const grade = ref('1');
</script>

<template>
  <a-card
    :tab-list="gradeOptions"
    @tabChange="key => grade = key"
    style="margin-top: 10px"
  >
    <PrintView>
      <a-card
        :title="`${GRADE_MAPPDING[grade]}单项前六名成绩表`"
        :headStyle="{ textAlign: 'center' }"
        style="margin-top: 10px"
      >
        <TopView :grade="grade"></TopView>
      </a-card>
    </PrintView>
    <PrintView>
      <a-card
        :title="`${GRADE_MAPPDING[grade]}团体总分成绩表`"
        :headStyle="{ textAlign: 'center' }"
        style="margin-top: 10px"
      >
        <GroupView :grade="grade"></GroupView>
      </a-card>
    </PrintView>
  </a-card>
</template>

<style lang="less" scoped>
</style>
