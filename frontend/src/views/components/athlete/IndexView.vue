<script setup>
import { ref, reactive } from 'vue';
import { getAthletes } from '@/api';
import { SearchOutlined } from '@ant-design/icons-vue';
import { GROUP_LEVEL_MAPPING } from '@/utils/constant';
import { hashColor } from '@/utils/common';

const data = ref([]);
const searchInput = ref();
const state = reactive({
  searchText: '',
  searchedColumn: '',
});

getAthletes().then((res) => {
  data.value = res.data;
});

function onFilterDropdownOpenChange(visible) {
  if (visible) {
    setTimeout(() => {
      searchInput.value.focus();
    }, 100);
  }
};

const columns = [
  {
    title: '年级',
    dataIndex: 'grade',
    customRender: ({ text }) => ({ 1:'高一',2:'高二',3:'高三' }[text]),
  },
  {
    title: '班级',
    dataIndex: 'class',
    slots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
    },
    onFilter: (value, record) =>
      record.class.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange,
  },
  {
    title: '号码',
    dataIndex: 'sid',
    slots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
    },
    onFilter: (value, record) =>
      record.sid.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange,
  },
  {
    title: '姓名',
    dataIndex: 'name',
    slots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
    },
    onFilter: (value, record) =>
      record.name.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange,
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
    slots: {
      filterDropdown: 'filterDropdown',
      filterIcon: 'filterIcon',
    },
    onFilter: (value, record) =>
      record.projects.map(p => GROUP_LEVEL_MAPPING[p]).join(' ').toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange,
  },
];

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handleReset = clearFilters => {
  clearFilters();
  state.searchText = '';
};
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="data"
    :locale="{ emptyText: '暂无数据' }"
    bordered
  >
    <template #filterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
      <div style="padding: 8px">
        <a-input
          ref="searchInput"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
        />
        <a-button
          type="primary"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          <template #icon><SearchOutlined /></template>
          搜索
        </a-button>
        <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
          重置
        </a-button>
      </div>
    </template>
    <template #filterIcon="filtered">
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
    </template>
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
