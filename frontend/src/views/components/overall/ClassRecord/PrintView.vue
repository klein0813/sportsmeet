<script setup>
import PrintImage from './PrintImage.vue'; // 调整为你实际的路径
import { ref, nextTick } from 'vue';
import { toPng } from 'html-to-image'; // 或者使用 html2canvas

const targetArea = ref(null);
const printImgData = ref('');
const showPrint = ref(false);

const handleGenerateAndPrint = async () => {
  if (!targetArea.value) return;

  try {
    // 1. 将 DOM 转换为 Base64
    const dataUrl = await toPng(targetArea.value, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    // 2. 赋值给组件
    printImgData.value = dataUrl;
    
    // 3. 触发打印（关键：先设为 false 再设为 true，确保 watch 能监听到变化）
    showPrint.value = false;
    await nextTick();
    showPrint.value = true;

  } catch (error) {
    console.error('生成图片失败', error);
  }
};

const onPrintSuccess = () => {
  console.log('打印弹窗已调起');
  // 重置状态，方便下次打印
  setTimeout(() => {
    showPrint.value = false;
  }, 500);
};

const onPrintError = (err) => {
  console.error('打印失败', err);
};
</script>

<template>
  <div style="position: relative;"><a-button class="print-btn" type="primary" @click="handleGenerateAndPrint">打印</a-button></div>
  <!-- 引入打印组件 -->
  <PrintImage 
    :imgData="printImgData" 
    :visible="showPrint" 
    orientation="landscape" 
    @success="onPrintSuccess"
    @error="onPrintError"
  />
  <div ref="targetArea">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.print-btn {
  position: absolute;
  top: 22px;
  right: 24px;
  z-index: 1;
}
</style>
