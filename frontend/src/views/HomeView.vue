<script setup>
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  // TeamOutlined,
  // FileOutlined,
} from '@ant-design/icons-vue';
import { ref, computed } from 'vue';
import OverView from './components/overall/IndexView.vue';
import RecordView from './components/record/IndexView.vue';
import ProjectView from './components/project/IndexView.vue';
import AthleteView from './components/athlete/IndexView.vue';

const collapsed = ref(false);
const selectedKeys = ref(['1']);
const viewKey = ref('1');
// const breadcrumbs = ref(['汇总', '高一'])

const onMenuClick = (key) => {
  console.log(key);
  viewKey.value = key;
};

const breadcrumbs = computed(() => {
  switch (viewKey.value) {
    case '1':
      return ['汇总', '高一'];
    case '2':
      return ['汇总', '高二'];
    case '3':
      return  ['汇总', '高三'];
    case '4':
      return  ['成绩'];
    case '5':
      return  ['项目'];
    // case '6':
    //   return  ['班级'];
    case '6':
      return  ['运动员'];
    default:
      return ['汇总', '高一'];
  }
});

</script>
<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">运动会成绩管理系统</div>
      <a-menu theme="dark" v-model:selectedKeys="selectedKeys" mode="inline">
        <a-sub-menu key="overview">
          <template #title>
            <span>
              <pie-chart-outlined />
              <span>汇总</span>
            </span>
          </template>
          <a-menu-item key="1" @click="onMenuClick('1')">高一</a-menu-item>
          <a-menu-item key="2" @click="onMenuClick('2')">高二</a-menu-item>
          <a-menu-item key="3" @click="onMenuClick('3')">高三</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="4" @click="onMenuClick('4')">
          <pie-chart-outlined />
          <span>成绩</span>
        </a-menu-item>
        <a-menu-item key="5" @click="onMenuClick('5')">
          <desktop-outlined />
          <span>项目</span>
        </a-menu-item>
        <!-- <a-menu-item key="6" @click="onMenuClick('6')">
          <team-outlined />
          <span>班级</span>
        </a-menu-item> -->
        <a-menu-item key="6" @click="onMenuClick('6')">
          <user-outlined />
          <span>运动员</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <!-- <a-layout-header class="header" style="background: #fff; padding: 0">
        运动会成绩管理系统
      </a-layout-header> -->
      <a-layout-content style="margin: 0 16px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="breadcrumb in breadcrumbs" v-bind:key="breadcrumb">{{ breadcrumb }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="main-content">
          <template v-if="['1', '2', '3'].includes(viewKey)">
            <OverView :grade="viewKey"></OverView>
          </template>
          <template v-else-if="viewKey == '4'">
            <RecordView></RecordView>
          </template>
          <template v-else-if="viewKey == '5'">
            <ProjectView></ProjectView>
          </template>
          <template v-else-if="viewKey == '6'">
            <AthleteView></AthleteView>
          </template>
          <template v-else>
            ELSE
          </template>
        </div>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Sports Meeting Performance Management ©2026 Created by Klein
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<style>
.logo {
  height: 32px;
  margin: 16px;
  text-align: center;
  line-height: 32px;
  color: #fff;
}

.site-layout .site-layout-background {
  background: #fff;
}

.header {
  text-align: center;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}

.main-content {
  padding: 24px;
  background: rgb(255, 255, 255);
  height: calc(100vh - 124px);
  overflow-y: scroll;
}
</style>
