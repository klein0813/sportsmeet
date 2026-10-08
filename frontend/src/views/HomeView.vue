<script setup>
import { ref } from 'vue';
import { getProjects } from '@/api';
import AddRecoreModal from './components/AddRecoreModal.vue';
import RecodeTable from './components/RecodeTable.vue';

const records = ref([
  {
    key: '1',
    projectName: '400M',
    roundNumber: '预赛',
    sid: '0967',
    name: '胡彦斌',
    level: 123,
  },
  {
    key: '2',
    projectName: '200M',
    roundNumber: '预赛',
    sid: '0968',
    name: '胡彦祖',
    level: 456,
  },
]);

const openAddRecoreModal = ref(false);

const showModal = () => {
  openAddRecoreModal.value = true;
};

const projects = ref([]);
getProjects().then((res) => {
  console.log(res);
  projects.value = res.data.map((item) => ({
    // value: item.name,
    // label: `${item.name} (${item.group === 0 ? '男子' : '女子'})`,
    id: item._id,
    name: item.name,
    group: item.group,
  }));
  // projects.value = res.data;
});

// onMounted(() => {
// });
</script>

<template>
  <div>
    <a-button type="primary" @click="showModal">添加成绩</a-button>
    <AddRecoreModal
      :show="openAddRecoreModal"
      @modal-close="openAddRecoreModal = false"
      :projects="projects"
    >
    </AddRecoreModal>
    <RecodeTable :dataSource="records" bordered></RecodeTable>
  </div>
</template>

<style lang="less" scoped>

</style>
