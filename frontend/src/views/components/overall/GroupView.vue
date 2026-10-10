<script setup>
import { ref, watch } from 'vue';
import { getGroupRecords } from '@/api';
const props = defineProps(['grade']);

const data = ref([]);

getPageGroupRecords(1)
const columns = [
  {
    title: '班级',
    dataIndex: 'name',
    align: 'center',
  },
  {
    title: '100米',
    dataIndex: '100M',
    align: 'center',
  },
  {
    title: '200米',
    dataIndex: '200M',
  },
  {
    title: '400米',
    dataIndex: '400M',
  },
  {
    title: '800米',
    dataIndex: '800M',
  },
  {
    title: '1500米',
    dataIndex: '1500M',
  },
  {
    title: '跳高',
    dataIndex: 'highJump',
  },
  {
    title: '跳远',
    dataIndex: 'longJump',
  },
  {
    title: '铅球',
    dataIndex: 'shotPut',
  },
  {
    title: '4*100米',
    dataIndex: '4X100M',
    customRender: ({ text }) => text?.split(' ')[0],
  },
  {
    title: '拔河',
    dataIndex: 'tugOfWar',
  },
  {
    title: '跳绳',
    dataIndex: 'ropeJump',
  },
  {
    title: '30*50接力',
    dataIndex: '30×50MRelay',
  },
  {
    title: '总分',
    dataIndex: 'score',
    customRender: ({ text }) => `${text == 0 ? '' : text}`,
  },
  {
    title: '排名',
    dataIndex: 'ranking',
    customRender: ({ text, record: { score } }) => `${score == 0 ? '' : text}`,
  },
];

watch(() => props.grade, async (newVal) => {
  getPageGroupRecords(newVal);
});

async function getPageGroupRecords(grade) {
  const res = await getGroupRecords(grade);
  data.value = res.data;
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" :pagination="false" bordered>
  </a-table>
</template>

<style lang="less" scoped>
:deep(.ant-table-thead > tr > th) {
  text-align: center;
}
:deep(.ant-table-tbody > tr > td) {
  text-align: center;
}
</style>
