<script setup>
import { ref, watch } from 'vue';
import { getTopRecords } from '@/api';
import { RANKING_MAPPING, SHOW_TOP } from '@/utils/constant'
const props = defineProps(['grade']);

const data = ref([]);
const initData = Array(12).fill(0).map((item, index) => {
  return {
    key: index,
    ranking: Math.floor(index / 2) + 1,
    projectGroup: index % 2,
  }
})
getPageTopRecords(1)

function handerCustomCell(record, rowIndex) {
  if (rowIndex % 2 === 0) {
    return { rowSpan: 2 }
  }
  if (rowIndex % 2 === 1) {
    return { rowSpan: 0 }
  }
  return {}
}
const columns = [
  {
    title: '名次',
    dataIndex: 'ranking',
    // 只负责显示内容
    customRender: ({ text }) => RANKING_MAPPING[text],
    // 负责单元格属性（rowSpan）
    customCell: handerCustomCell,
  },
  {
    title: '性别',
    key: 'projectGroup',
    dataIndex: 'projectGroup',
    customRender: ({ text }) => `${text == 0 ? '男' : '女'}`,
  },
  {
    title: '100米',
    dataIndex: '100M',
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
    customCell: handerCustomCell,
  },
  {
    title: '跳绳',
    dataIndex: 'ropeJump',
    customCell: handerCustomCell,
  },
  {
    title: '30*50接力',
    dataIndex: '30×50MRelay',
    customCell: handerCustomCell,
  },
];

watch(() => props.grade, async (newVal) => {
  getPageTopRecords(newVal)
  // await nextTick()
});

async function getPageTopRecords(grade) {
  const datas = initData.map(item => ({ ...item }))
  const { data: { ganderTop, classTop } } = await getTopRecords(grade, SHOW_TOP);
  ganderTop.forEach((item) => {
    Object.assign(datas[(item.ranking - 1) * 2 + item.projectGroup], item)
  })
  classTop.forEach((item) => {
    Object.assign(datas[(item.ranking - 1) * 2], item)
  })
  data.value = datas;
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
