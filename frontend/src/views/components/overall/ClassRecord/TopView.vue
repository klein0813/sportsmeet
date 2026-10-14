<script setup>
import { ref, watch } from 'vue';
import { getTopRecords } from '@/api';
import { RANKING_MAPPING, SHOW_TOP } from '@/utils/constant'
import { levelNumber2String } from '@/utils/common'
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
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '200米',
    dataIndex: '200M',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '400米',
    dataIndex: '400M',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '800米',
    dataIndex: '800M',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '1500米',
    dataIndex: '1500M',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '跳高',
    dataIndex: 'highJump',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '跳远',
    dataIndex: 'longJump',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '铅球',
    dataIndex: 'shotPut',
    customRender: ({ text }) => formatRecord(text),
  },
  {
    title: '4*100米',
    dataIndex: '4X100M',
    customRender: ({ text }) => {
      if (!text) return '';
      const arr = text.split(' ');
      const suffix = arr.length === 4 ? arr[3] : '';
      return `${levelNumber2String('4X100M', text.split(' ')[0])} ${suffix}`;
    },
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

function formatRecord(text) {
  if (!text) return '';
  const arr = text.split(' ');
  const suffix = arr.length === 4 ? arr[3] : '';
  return ([arr[0], arr[1], levelNumber2String('4X100M', arr[2]), suffix]).join(' ');
}
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :pagination="false"
    :locale="{ emptyText: '暂无数据' }"
    bordered
  >
  </a-table>
</template>

<style lang="less" scoped>
:deep(.ant-table-thead > tr > th) {
  text-align: center;
}
:deep(.ant-table-tbody > tr > td) {
  text-align: center;
  max-width: 10vw;
}
</style>
