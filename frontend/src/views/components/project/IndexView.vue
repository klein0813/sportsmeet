<script setup>
import { ref, h } from 'vue';
import { Tag } from 'ant-design-vue'
import { getProjects } from '@/api';
import { GROUP_LEVEL_MAPPING } from '@/utils/constant'

const data = ref([]);

getProjects().then((res) => {
  console.log(res);
  data.value = res.data;
});
const columns = [
  {
    title: '项目名',
    dataIndex: 'name',
    customRender: ({ text }) => GROUP_LEVEL_MAPPING[text],
  },
  {
    title: '形式',
    dataIndex: 'category',
    customRender: ({ text }) => h(Tag, { color: ['blue', 'cyan', 'cyan'][text] }, () => (['个体赛', '团体赛', '团体赛'][text])),
  },
  {
    title: '组别',
    dataIndex: 'group',
    customRender: ({ text }) => h(Tag, { color: ['purple', 'pink', 'green'][text] }, () => (['男子', '女子', '团体'][text])),
  },
  {
    title: '记录',
    dataIndex: 'record',
    customRender: ({ text }) => text == -1 ? '-' : text,
  },
  {
    title: '状态',
    dataIndex: 'finish',
    customRender: ({ text }) => {
      if (text == true) {
        return h(Tag, { color: 'success' }, () => '已完赛'); 
      }
      return h(Tag, { color: 'error' }, () => '未完赛'); 
    },
  },
];
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
