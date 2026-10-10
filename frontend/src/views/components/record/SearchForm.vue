<script setup>
import { reactive, toRaw } from 'vue';
import { GROUP_LEVEL_MAPPING, GENDER_MAPPING, PROJECT_ROUND, EVENT_RECORE_SEARCN } from '@/utils/constant';

const emits = defineEmits([EVENT_RECORE_SEARCN]);
const formState = reactive({
  projectName: undefined,
  group: undefined,
  round: undefined,
  class: undefined,
  sid: undefined,
});

const onSubmit = () => {
  console.log('onSubmit', toRaw(formState))
  emits(EVENT_RECORE_SEARCN, toRaw(formState));
};

const onReset = () => {
  formState.projectName = undefined;
  formState.group = undefined;
  formState.round = undefined;
  formState.class = undefined;
  formState.sid = undefined;
}

const projectOptions = Object.entries(GROUP_LEVEL_MAPPING).map(([k, v]) => ({ label: v, value: k }));
const groupOptions = Object.entries(GENDER_MAPPING).map(([k, v]) => ({ label: v, value: k }));

</script>
<template>
  <a-form
    layout="inline"
    :model="formState"
  >
    <a-form-item class="form-item" label="项目">
      <a-select v-model:value="formState.projectName" :options="projectOptions" placeholder="项目"></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="组别">
      <a-select v-model:value="formState.group" :options="groupOptions" placeholder="组别"></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="轮次">
      <a-select v-model:value="formState.round" :options="PROJECT_ROUND" placeholder="轮次"></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="班级">
      <a-input v-model:value="formState.class" style="width: 80px" placeholder="班级"></a-input>
    </a-form-item>
    <a-form-item class="form-item" label="号码">
      <a-input v-model:value="formState.sid" style="width: 80px" placeholder="号码"></a-input>
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        @click.prevent="onSubmit"
      >
      <!-- :loading="iconLoading" -->
        搜索
      </a-button>
      <a-button
        class="reset-btn"
        type="primary"
        @click.prevent="onReset"
      >
      <!-- :loading="iconLoading" -->
        重置
      </a-button>
    </a-form-item>
  </a-form>
</template>
<style lang="less" scoped>
:deep(.ant-form-row) {
  flex-flow: initial;
}
.reset-btn {
  margin-left: 10px;
}

.form-item {
  width: 120px;
  text-align: left;
}
</style>

