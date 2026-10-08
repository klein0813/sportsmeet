<script setup>
// import { computed } from 'vue'
const props = defineProps(['dataSource', 'pagination']);

const columns = [
  {
    title: '项目',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: '组别',
    dataIndex: 'projectGroup',
    key: 'projectGroup',
  },
  {
    title: '轮次',
    dataIndex: 'roundNumber',
    key: 'roundNumber',
  },
  {
    title: '号码',
    dataIndex: 'sid',
    key: 'sid',
  },
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
    {
    title: '成绩',
    dataIndex: 'level',
    key: 'level',
  },
];

// const columns = computed(() => {
//   return props.showGroup ? [...initColumns] : initColumns.filter((item) => item.dataIndex !== 'group');
// })
</script>

<template>
  <div>
    <a-table :dataSource="props.dataSource" :pagination="props.pagination" :columns="columns" bordered>
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'projectGroup'">
          {{  record.projectGroup === 0 ? '男子' : '女子' }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<style lang="less" scoped>

</style>
