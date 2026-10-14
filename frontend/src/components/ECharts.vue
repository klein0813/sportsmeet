<script>
import * as echarts from 'echarts';

export default {
  name: 'ECharts',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart);
    this.chart.setOption(this.options);
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
  <div ref="chart" style="width: 100%; height: 370px;"></div>
</template>
