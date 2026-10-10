<script setup>
import { ref, toRaw } from 'vue';
import { getProjects, getRecords, getSclasses, exportRecord } from '@/api';
import { levelNumber2String } from '@/utils/common';
import AddRecoreModal from './AddRecoreModal.vue';
import { GROUP_LEVEL_MAPPING, PROJECT_ROUND, PROJECT_ROUND_MAPPING, GRADE_MAPPDING, GENDER_MAPPING } from '@/utils/constant'
import SearchForm from './SearchForm.vue';

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: (total) => `共 ${total} 条`,
});
getPageRecords(toRaw(pagination.value));

const records = ref([]);
const openAddRecoreModal = ref(false);
const showModal = () => {
  openAddRecoreModal.value = true;
};

const projects = ref([]);
getProjects(0).then((res) => {
  projects.value = res.data.map((item) => ({
    id: item._id,
    name: item.name,
    group: item.group,
    category: item.category,
  }));
});

const classInfos = ref([]);
getSclasses().then((res) => {
  classInfos.value = res.data.map((item) => ({
    value: item._id,
    label: `${item.name}`,
    name: `${item.name}`,
  }));
});
const columns = ref([
  {
    title: '项目',
    dataIndex: 'projectName',
    key: 'projectName',
    customRender: ({ text }) => GROUP_LEVEL_MAPPING[text],
  },
  {
    title: '组别',
    dataIndex: 'projectGroup',
    key: 'projectGroup',
    customRender: ({ text }) => GENDER_MAPPING[text],
  },
  {
    title: '轮次',
    dataIndex: 'round',
    key: 'round',
  },
  {
    title: '班级',
    dataIndex: 'class',
    key: 'class',
  },
  {
    title: '年级',
    dataIndex: 'grade',
    key: 'grade',
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
    customRender: ({ text, record }) => levelNumber2String(record.projectName, text),
  },
  {
    title: '名次',
    dataIndex: 'ranking',
    key: 'ranking',
  },
  {
    title: '分数',
    dataIndex: 'score',
    key: 'score',
    customRender: ({ text }) => text ? text : '-',
  },
]);

const exportData = () => {
  exportRecord();
};

const onPaginationChange = (pagination) => {
  getPageRecords(pagination);
}
function getPageRecords(cpagination, query={}) {
  const { current, pageSize } = cpagination;
  getRecords({ current, pageSize, ...query }).then(({ data: { page, size, total, list }}) => {
    pagination.value.current = page;
    pagination.value.pageSize = size;
    pagination.value.total = total;
    records.value = list.map((item) => {
      return {
        projectName: item.projectName,
        projectGroup: item.projectGroup,
        round: PROJECT_ROUND_MAPPING[item.round],
        sid: item.athleteSid,
        name: item.athleteName,
        class: item.athleteClass,
        grade: GRADE_MAPPDING[item.athleteGrade],
        level: item.level,
        ranking: item.ranking,
        score: item.score,
      }
    });
  });
}

const onSearch = (data) => {
  pagination.value.current = 1;
  pagination.value.pageSize = 10;
  getPageRecords(toRaw(pagination.value), data);
}
</script>

<template>
  <div class="record-view">
    <div class="header">
      <SearchForm @search="onSearch"></SearchForm>
      <div class="operation">
        <a-button type="primary" @click="showModal">添加成绩</a-button>
        <a-button class="export-btn" type="primary" @click="exportData">导出成绩</a-button>
      </div>
    </div>
    <AddRecoreModal
      :show="openAddRecoreModal"
      @modal-close="openAddRecoreModal = false"
      :projects="projects"
      :classes="classInfos"
      :rounds="PROJECT_ROUND"
    >
    </AddRecoreModal>
    <a-table
      :dataSource="records"
      :columns="columns"
      :pagination="pagination"
      @change="onPaginationChange" bordered>
    </a-table>
  </div>
</template>

<style lang="less" scoped>
:deep(.ant-table-thead > tr > th) {
  text-align: center;
}
:deep(.ant-table-tbody > tr > td) {
  text-align: center;
}

.record-view {
  position: relative;

  .header {
    margin-bottom: 10px;
  }

  .operation {
    position: absolute;
    top: 0;
    right: 0;
    margin-bottom: 10px;

    .export-btn {
      margin-left: 10px;
    }
  }
}
</style>
