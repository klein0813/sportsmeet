<script setup>
import { ref, computed, watch, toRaw } from 'vue';
import RecodeTable from './RecodeTable.vue';
import { getAthletesByKeyword } from '@/api';
import { EVENT_RECORE_MODAL_CLOSE } from '@/utils/constant'

const props = defineProps(['projects', 'show']);

const records = ref([]);

const open = ref(false)

const handleOk = (e) => {
  console.log(e, toRaw(records.value));
  open.value = false;
  emits(EVENT_RECORE_MODAL_CLOSE);
};

const roundNumbers = [
  {
    value: 0,
    label: '预赛',
  },
  {
    value: 1,
    label: '预决赛',
  },
  {
    value: 2,
    label: '决赛',
  },
];

const record = ref({
  projectName: '',
  roundNumber: '',
  sid: '',
  name: '',
  level: '',
});

const athletes = ref([]);

// let timeout;
// let currentValue = '';

const handleSearch = (val) => {
  console.log(val);
  if (!val) {
    athletes.value = [];
    return;
  }
  getAthletesByKeyword(val, (d) => (athletes.value = d));
};

const handleChange = (val) => {
  console.log('handleChange', val);
  record.value.sid = val
  record.value.name = athletes.value.find((item) => item.value === val)?.name || '';
  getAthletesByKeyword(val, (d) => (athletes.value = d));
};

const addRecord = () => {
  console.log('addRecord', record.value, props.projects);
  const project = props.projects.find((item) => item.id === record.value.projectId);
  console.log('addRecord', project);
  records.value.push({
    key: records.value.length + 1,
    projectId: project.id,
    projectName: project.name,
    projectGroup: project.group,
    roundNumber: roundNumbers.find((item) => item.value === record.value.roundNumber)?.label || '',
    sid: record.value.sid,
    name: record.value.name,
    level: record.value.level,
  });
  // 清空输入框
  record.value.sid = '';
  record.value.name = '';
  record.value.level = '';
};

const projects = computed(() => {
  return props.projects.map((item) => ({
    value: item.id,
    label: `${item.name} (${item.group === 0 ? '男子' : '女子'})`,
  }));
})

watch(() => props.show, (newVal) => {
  open.value = newVal;
});

const emits = defineEmits([EVENT_RECORE_MODAL_CLOSE]);

const closeModal= () => {
  records.value = [];
  record.value.projectId = '';
  record.value.roundNumber = '';
  record.value.sid = '';
  record.value.name = '';
  record.value.level = '';
  emits(EVENT_RECORE_MODAL_CLOSE);
}

// onMounted(() => {
// });
</script>

<template>
  <a-modal v-model:open="open" title="添加成绩" @afterClose="closeModal" @ok="handleOk" @cancel="closeModal" :maskClosable="false">
    <div>
      <span>项目：</span>
      <a-select placeholder="选择项目" v-model:value="record.projectId" style="width: 120px" :options="projects"></a-select>
      </div>
      <div>
      <span>轮次：</span>
      <a-select placeholder="选择轮次" v-model:value="record.roundNumber" style="width: 120px" :options="roundNumbers"></a-select>
      </div>
      <div>
      <span>运动员：</span>
      <a-select
          v-model:value="record.sid"
          show-search
          placeholder="输入编号"
          style="width: 200px"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          :options="athletes"
          @search="handleSearch"
          @change="handleChange"
      ></a-select>
      <div>
          <span>成绩：</span>
          <a-input v-model:value="record.level" style="width: 200px" placeholder="输入成绩"></a-input>
      </div>
      <a-button type="primary" @click="addRecord">添加</a-button>
    </div>
    <RecodeTable :pagination="false" :dataSource="records"></RecodeTable>
  </a-modal>
</template>

<style lang="less" scoped>

</style>
