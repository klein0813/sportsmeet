<script setup>
import { ref, reactive, h } from 'vue';
import { Tag } from 'ant-design-vue'
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue';
import { getProjects, updateRecord } from '@/api';
import { GROUP_LEVEL_MAPPING, REWARD_SCORE } from '@/utils/constant'
import { levelNumber2String } from '@/utils/common';
{/* <EditOutlined /> */}
const data = ref([]);

const columns = [
  {
    title: '项目名',
    dataIndex: 'name',
    customRender: ({ text }) => GROUP_LEVEL_MAPPING[text],
  },
  {
    title: '形式',
    dataIndex: 'category',
    customRender: ({ text }) => h(Tag, { color: ['blue', 'cyan', 'cyan'][text] }, () => (['个体赛', '团体赛', '团体赛'][text])),
  },
  {
    title: '组别',
    dataIndex: 'group',
    customRender: ({ text }) => h(Tag, { color: ['purple', 'pink', 'green'][text] }, () => (['男子', '女子', '团体'][text])),
  },
  {
    title: '记录',
    key: 'record',
    dataIndex: 'record',
    slots: {
      customRender: 'record',
    },
  },
  {
    title: '新记录',
    key: 'newRecord',
    dataIndex: 'newRecord',
    customRender: ({ text, record }) => text ? h(Tag, { color: '#f50' }, () => levelNumber2String(record.name, `${text}`)) : '',
  },
  {
    title: '奖励得分',
    dataIndex: 'rewardScore',
    customRender: ({ record }) => (record.category == 0 && record.record > 0) ? REWARD_SCORE[record.category] : '-',
  },
  {
    title: '状态',
    dataIndex: 'status',
    customRender: ({ record }) => {
      if (record['grade1Done'] && record['grade2Done'] && record['grade3Done']) {
        return h(Tag, { color: 'success' }, () => '已完赛'); 
      }
      return h(Tag, { color: 'error' }, () => '未完赛'); 
    },
  },
];
getPageProjects()

const editableData = reactive({});
const edit = key => {
  editableData[key] = (data.value.filter(item => key === item._id)[0]).record;
};
const save = key => {
  console.log('save', key, editableData[key]);
  const t = data.value.filter(item => key === item._id)[0];
  t.record = editableData[key];
  updateRecord(t._id, t.record).then(({ data }) => {
    if (data) {
      delete editableData[key];
      message.success('更新记录成功');
    } else {
      message.success('更新记录失败');
    }
  });

};

function getPageProjects() {
  getProjects().then((res) => {
    console.log(res);
    data.value = res.data;
  });
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
    <template #record="{ text, record }">
      <div class="editable-cell">
        <div v-if="editableData[record._id]" class="editable-cell-input-wrapper">
          <a-input-number :min="1" :precision="0" v-model:value="editableData[record._id]" @pressEnter="save(record._id)" />
          <check-outlined class="editable-cell-icon-check" @click="save(record._id)" />
        </div>
        <div v-else class="editable-cell-text-wrapper">
          <a-tag>{{ text == -1 ? '-' : levelNumber2String(record.name, `${text}`) }}</a-tag>
          <edit-outlined
            v-if="!(record['grade1Done'] && record['grade2Done'] && record['grade3Done'])"
            class="editable-cell-icon"
            @click="edit(record._id)"
          />
        </div>
      </div>
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
.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>
