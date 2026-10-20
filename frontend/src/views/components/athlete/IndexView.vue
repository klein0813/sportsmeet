<script setup>
import { ref } from 'vue';
import { getAthletes } from '@/api';
import { GROUP_LEVEL_MAPPING } from '@/utils/constant';
import { hashColor } from '@/utils/common';

const data = ref([]);

getAthletes().then((res) => {
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
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :locale="{ emptyText: '暂无数据' }"
    bordered
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'projects'">
        <a-tag
          v-for="project in record.projects"
          :key="project"
          :color="hashColor(project)"
        >
          {{ GROUP_LEVEL_MAPPING[project] }}
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
