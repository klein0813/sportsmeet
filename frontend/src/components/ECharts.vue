<script>
import * as echarts from 'echarts';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons-vue'

export default {
  name: 'ECharts',
  props: {
    options: {
      type: Object,
      required: true
    },
    showExportChart: {
      type: Boolean,
      required: false
    },
    exportChartBtnText: {
      type: String,
      required: false,
      default: '导出图表',
    },
    showExportAll: {
      type: Boolean,
      required: false
    },
    exportAllBtnText: {
      type: String,
      required: false,
      default: '导出全部',
    },
  },
  emits: ['export-chart', 'export-all'],
    // 2. 注册组件
  components: {
    DownloadOutlined,
    FileExcelOutlined,
  },
  methods: {
    exportChart() {
      this.$emit('export-chart');
    },
    exportAll() {
      this.$emit('export-all');
    },
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart);
    this.chart.setOption(this.options);
    window.addEventListener('resize', () => this.chart?.resize())
  },
  beforeUnmount() {
    this.chart?.dispose()
  },
  watch: {
    options: {
      deep: true,
      handler(newOptions) {
        this.chart.setOption(newOptions);
      }
    }
  }
};
</script>

<template>
  <div class="chart-wrapper">
    <div class="chart-actions">
      <a-button v-show="showExportChart" size="small" @click="exportChart">
        <template #icon><DownloadOutlined /></template>
        {{ exportChartBtnText }}
      </a-button>
      <a-button v-show="showExportAll" size="small" type="primary" @click="exportAll">
        <template #icon><FileExcelOutlined /></template>
        {{ exportAllBtnText }}
      </a-button>
    </div>

    <div ref="chart" class="chart"></div>
  </div>
</template>
<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 370px;
  /* 450 */
}
.chart {
  width: 100%;
  height: 100%;
}
.chart-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 8px;
}
</style>
