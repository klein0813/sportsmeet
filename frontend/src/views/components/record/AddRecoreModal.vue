<script setup>
import { ref, watch, toRaw } from 'vue';
import { addRecords } from '@/api';
import { EVENT_RECORE_MODAL_CLOSE, GROUP_LEVEL_MAPPING, GENDER_MAPPING, PROJECT_ROUND_MAPPING } from '@/utils/constant';
import { levelNumber2String } from '@/utils/common';
import RecordForm from './RecordForm.vue';

const props = defineProps(['projects', 'show', 'rounds', 'classes']);
const recordFormRef = ref(null)
const records = ref([]);
const flag = '2026';
const open = ref(false)
const loadingAddBtn = ref(false);

const handleOk = () => {
  loadingAddBtn.value = true;
  const datas = toRaw(records.value);
  const data = {
    flag,
    projectId: datas[0].projectId,
    round: datas[0].round,
    records: datas.map((item) => {
      return {
        athleteId: item.id,
        level: item.level,
      }
    })
  };
  addRecords(data).then(() => {
    open.value = false;
    loadingAddBtn.value = false;
    emits(EVENT_RECORE_MODAL_CLOSE);
  });
};

const addRecord = ({ data, athlete, project }) => {
  console.log('addRecord', data, athlete, project);
  records.value.push({
    key: records.value.length + 1,
    projectId: project.id,
    projectName: project.name,
    projectGroup: project.group,
    round: data.round,
    id: data.id,
    sid: athlete.sid,
    class: project.category ? athlete.name : athlete.class,
    name: project.category ? '' : athlete.name,
    level: data.level,
  });
};

watch(() => props.show, (newVal) => {
  open.value = newVal;
});

const emits = defineEmits([EVENT_RECORE_MODAL_CLOSE]);

const closeModal= () => {
  records.value = [];
  emits(EVENT_RECORE_MODAL_CLOSE);
  recordFormRef.value.reset();
}

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
    customRender: ({ text }) => PROJECT_ROUND_MAPPING[text],
  },
  {
    title: '号码',
    dataIndex: 'sid',
    key: 'sid',
  },
  {
    title: '班级',
    dataIndex: 'class',
    key: 'class',
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
]);
</script>

<template>
  <a-modal
    v-model:open="open"
    title="添加成绩"
    cancelText="取消"
    okText="提交"
    @afterClose="closeModal"
    @ok="handleOk"
    @cancel="closeModal"
    :maskClosable="false"
    :confirmLoading="loadingAddBtn"
  >
    <RecordForm
      ref="recordFormRef"
      :projects="props.projects"
      :classes="props.classes"
      :rounds="rounds"
      @record-add="addRecord"
    >
    </RecordForm>
    <a-table :dataSource="records" :pagination="false" :columns="columns" bordered>
    </a-table>
  </a-modal>
</template>
<style lang="less" scoped>
:deep(.ant-table-thead > tr > th) {
  text-align: center;
}
:deep(.ant-table-tbody > tr > td) {
  text-align: center;
}
.label {
  display: inline-block;
  width: 100px;
  text-align: right;
}
</style>
