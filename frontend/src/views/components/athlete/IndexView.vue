<script setup>
import { ref } from 'vue';
import { getAthletes } from '@/api';

const data = ref([]);

getAthletes().then((res) => {
  console.log(res);
  data.value = res.data;
});
const columns = [
  {
    title: '年级',
    dataIndex: 'grade',
    customRender: ({ text }) => ({ 1:'高一',2:'高二',3:'高三' }[text]),
  },
  {
    title: '班级',
    dataIndex: 'class',
  },
  {
    title: '号码',
    dataIndex: 'sid',
  },
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '性别',
    dataIndex: 'gender',
    customRender: ({ text }) => ['男', '女'][text],
  },
  {
    title: '项目',
    key: 'projects',
    dataIndex: 'projects',
  },
];

const projectColors = [
  '#1677ff', // 1  蓝
  '#13c2c2', // 2  青
  '#52c41a', // 3  绿
  '#a0d911', // 4  黄绿
  '#faad14', // 5  金
  '#fa8c16', // 6  橙
  '#fa541c', // 7  火山
  '#f5222d', // 8  红
  '#eb2f96', // 9  品红
  '#722ed1', // 10 紫
  '#2f54eb', // 11 深蓝
  '#08979c', // 12 深青
  '#389e0d', // 13 深绿
  '#7cb305', // 14 深黄绿
  '#d48806', // 15 深金
  '#d46b08', // 16 深橙
  '#d4380d', // 17 深火山
  '#cf1322', // 18 深红
  '#c41d7f', // 19 深品红
  '#531dab', // 20 深紫
]
function hashColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return projectColors[Math.abs(hash) % projectColors.length]
}
</script>

<template>
  <a-table :columns="columns" :data-source="data" bordered>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'projects'">
        <a-tag
          v-for="project in record.projects"
          :key="project"
          :color="hashColor(project)"
        >
          {{ project }}
        </a-tag>
      </template>
    </template>
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
