<script setup>
import { ref, watch, toRaw } from 'vue';
import { addRecords, getProjectRecords, revokeProjectRecords } from '@/api';
import { levelNumber2String } from '@/utils/common';
import RecordForm from './RecordForm.vue';
import { message } from 'ant-design-vue';
import {
  EVENT_RECORE_MODAL_CLOSE,
  GROUP_LEVEL_MAPPING,
  GENDER_MAPPING,
  PROJECT_ROUND_MAPPING,
  EVENT_RECORE_ADD_SUCCESS,
} from '@/utils/constant';

const props = defineProps(['show', 'rounds', 'classes', 'revoke']);
const recordFormRef = ref(null)
const records = ref([]);
const flag = '2026';
const open = ref(false)
const loadingAddBtn = ref(false);

const submitBtnText = ref('提交');
const modalTitle = ref('添加成绩');

const handleOk = () => {
  loadingAddBtn.value = true;
  const datas = toRaw(records.value);
  if (props.revoke) {
    revokeProjectRecords({
      grade: datas[0].grade,
      projectId: datas[0].projectId,
      round: datas[0].round,
    }).then(({ data }) => {
      if (data) {
        message.success('赛事记录撤销成功');
        emits(EVENT_RECORE_ADD_SUCCESS);
        closeModal();
      } else {
        message.error('赛事记录撤销失败');
      }
    })
    return;
  }
  const data = {
    flag,
    grade: datas[0].grade,
    projectId: datas[0].projectId,
    round: datas[0].round,
    records: datas.map((item) => {
      return {
        athleteId: item.id,
        level: item.level,
      }
    })
  };
  addRecords(data).then(({ data }) => {
    if (data) {
      open.value = false;
      loadingAddBtn.value = false;
      emits(EVENT_RECORE_ADD_SUCCESS);
      message.success('成绩添加成功');
      closeModal();
    }
  });
};

const addRecord = ({ data, athlete, project }) => {
  if (props.revoke) {
    getProjectRecords(project.id, data.grade, data.round).then(({ data }) => {
      if (data.length == 0) {
        message.warning('查找的赛事记录不存在');
        return;
      }
      records.value = data.map((record, index) => ({
        key: index + 1,
        projectId: record.projectId,
        projectName: record.projectName,
        projectGroup: record.projectGroup,
        grade: record.athleteGrade,
        round: record.round,
        id: record.athleteSid,
        sid: record.athleteSid,
        class: record.category ? record.athleteName : record.athleteClass,
        name: record.category ? '' : record.athleteName,
        level: record.level,
      }));
    });
  } else {
    records.value.push({
      key: records.value.length + 1,
      projectId: project.id,
      projectName: project.name,
      projectGroup: project.group,
      grade: data.grade,
      round: data.round,
      id: data.id,
      sid: athlete.sid,
      class: project.category ? athlete.name : athlete.class,
      name: project.category ? '' : athlete.name,
      level: data.level,
    });
  }
};

watch(() => props.show, (newVal) => {
  open.value = newVal;
});

watch(() => props.revoke, (newVal) => {
  submitBtnText.value = newVal ? '撤销上述成绩' : '提交';
  modalTitle.value = newVal ? '撤销项目成绩' : '添加成绩';
});

const emits = defineEmits([EVENT_RECORE_MODAL_CLOSE, EVENT_RECORE_ADD_SUCCESS]);

const closeModal = () => {
  records.value = [];
  emits(EVENT_RECORE_MODAL_CLOSE);
  recordFormRef.value.reset();
  loadingAddBtn.value = false;
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
    :title="modalTitle"
    width="567px"
    cancelText="取消"
    :okText="submitBtnText"
    @afterClose="closeModal"
    @ok="handleOk"
    @cancel="closeModal"
    :maskClosable="false"
    :confirmLoading="loadingAddBtn"
    :okButtonProps="{ disabled: records.length < 1 }"
  >
    <RecordForm
      ref="recordFormRef"
      :classes="props.classes"
      :rounds="rounds"
      :revoke="props.revoke"
      @record-add="addRecord"
    >
    </RecordForm>
    <a-table
      :dataSource="records"
      :pagination="false"
      :columns="columns"
      :locale="{ emptyText: '暂无数据' }"
      bordered
    >
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
