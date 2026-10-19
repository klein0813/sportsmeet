<script setup>
import { reactive, ref, computed, toRaw } from 'vue';
import { Form } from 'ant-design-vue';
import { getAthletesByKeyword, getProjects } from '@/api';
import { GENDER_MAPPING, EVENT_RECORE_ADD, GRADE_MAPPDING, GROUP_LEVEL_MAPPING } from '@/utils/constant';
const props = defineProps(['projects', 'rounds', 'classes']);
const emits = defineEmits([EVENT_RECORE_ADD]);
let addedAthletes = ref([]);

const useForm = Form.useForm;
const modelRef = reactive({
  grade: undefined,
  projectId: undefined,
  round: undefined,
  id: undefined,
  level: undefined,
});
const curProject = ref({});
let curAthlete = undefined;
const athletes = ref([]);
const scls = ref([]);
const projectReadonly = ref(false);
const rulesRef = reactive({
  grade: [
    {
      required: true,
      message: '请选择年级',
    },
  ],
  projectId: [
    {
      required: true,
      message: '请选择项目',
    },
  ],
  round: [
    {
      required: true,
      message: '请选择轮次',
    },
  ],
  id: [
    {
      required: true,
      message: '请选择运动员',
    },
  ],
  level: [
    {
      required: true,
      message: '请输入成绩',
    },
    {
      validator: (rule, value) => {
        // value 是当前字段的值
        if (!value) {
          return Promise.resolve()
        }
        const num = Number(value)
        if (isNaN(num) || !Number.isInteger(num) || num < 1) {
          return Promise.reject('成绩必须是大于0的整数')
        }
        return Promise.resolve()
      },
    },
  ],
});
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef);

const projectOptions = ref([]);

const handleGradeChange = (val) => {
  getProjects(0, val).then((res) => {
    projectOptions.value = res.data.map((item) => {
      const showName = GROUP_LEVEL_MAPPING[item.name];
      return {
        value: item._id,
        label: item.group < 2 ? `${showName} (${GENDER_MAPPING[item.group]})` : showName,
        id: item._id,
        category: item.category,
        name: item.name,
        group: item.group,
      }
    });
  });
}

const handleProjectChange = (val) => {
  curProject.value = toRaw(projectOptions.value).find((item) => item.value === val);
  modelRef.id = undefined;
};

const athleteOptions = computed(() => {
  const options = curProject.value.category ? scls.value : athletes.value;
  return toRaw(options).filter(item => !addedAthletes.value.includes(item.value));
})

const gradeOptions = Object.entries(GRADE_MAPPDING).map(([k, v]) => ({ label: v, value: k }));

const handleSearch = (val) => {
  if (!val) {
    athletes.value = [];
    return;
  }
  if (curProject.value.category) {
    // 团体赛，选择班级
    scls.value = getClassesByKeyword(toRaw(props.classes), val, toRaw(modelRef).grade);
  } else {
    // 个体赛，选择运动员
    getAthletesByKeyword({
      keyword: val,
      grade: toRaw(modelRef).grade,
      group: curProject.value.group,
      project: curProject.value.name,
    }, (d) => (athletes.value = d));
  }
};

const handleChange = (val) => {
  if (curProject.value.category) {
    // 团体赛，选择班级
    curAthlete = toRaw(scls.value).find((item) => item.value === val);
  } else {
    // 个体赛，选择运动员
    curAthlete = toRaw(athletes.value).find((item) => item.value === val);
    getAthletesByKeyword({
      keyword: val,
      grade: toRaw(modelRef).grade,
      group: curProject.value.group,
      project: curProject.value.name,
    }, (d) => (athletes.value = d));
  } 
};

function getClassesByKeyword(arr, keyword, grade) {
  const gradeReg = new RegExp(`^${grade}`);
  const reg = new RegExp(`^${keyword}`);
  return arr.filter(item => gradeReg.test(item.name)).filter(item => reg.test(item.name));
}

const onSubmit = () => {
  validate()
    .then(() => {
      const data = toRaw(modelRef);
      data.level = data.level.replace(/^0+/, '');
      emits(EVENT_RECORE_ADD, { data, athlete: curAthlete, project: toRaw(curProject.value) });
      projectReadonly.value = true
      addedAthletes.value.push(data.id);
      modelRef.id = undefined;
      modelRef.level = undefined;
    })
    .catch(err => {
      console.log('error', err);
    });
};

function reset() {
  resetFields();
  projectReadonly.value = false;
  addedAthletes.value = [];
  scls.value = [];
}

defineExpose({
  reset,
})
</script>
<template>
  <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 14 }">
    <a-form-item class="form-item" label="年级" v-bind="validateInfos.grade">
      <a-select placeholder="选择年级" v-model:value="modelRef.grade" :options="gradeOptions" :disabled="projectReadonly" @change="handleGradeChange"></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="项目" v-bind="validateInfos.projectId">
      <a-select placeholder="选择项目" v-model:value="modelRef.projectId" :options="projectOptions" :disabled="!modelRef.grade || projectReadonly" @change="handleProjectChange"></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="轮次" v-bind="validateInfos.round">
      <a-select placeholder="选择轮次" v-model:value="modelRef.round" :disabled="projectReadonly" :options="props.rounds"></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="运动员" v-bind="validateInfos.id">
      <a-select
        v-model:value="modelRef.id"
        show-search
        placeholder="选择运动员"
        :default-active-first-option="false"
        :show-arrow="false"
        :filter-option="false"
        :not-found-content="null"
        :options="athleteOptions"
        :disabled="!modelRef.projectId"
        @search="handleSearch"
        @change="handleChange"
      ></a-select>
    </a-form-item>
    <a-form-item class="form-item" label="成绩" v-bind="validateInfos.level">
      <a-input v-model:value="modelRef.level" placeholder="每个单位级两位数字"></a-input>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click.prevent="onSubmit">添加</a-button>
    </a-form-item>
  </a-form>
</template>
<style lang="less" scoped>
.form-item {
  margin-bottom: 8px;
}
</style>