<template>
  <span style="display: none;"></span>
</template>

<script setup>
import { watch, nextTick } from 'vue';

const props = defineProps({
  imgData: { type: String, default: '' },
  visible: { type: Boolean, default: false },
  orientation: { type: String, default: 'portrait' },
  margin: { type: String, default: '10mm' }
});

const emit = defineEmits(['success', 'error']);

const handlePrint = () => {
  if (!props.imgData) return;

  // 1. 生成打印时间
  const now = new Date();
  const printTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  
  doc.write(`
    <html>
      <head>
        <title>打印</title>
        <style>
          @page { 
            size: A4 ${props.orientation}; 
            margin: ${props.margin}; 
          }
          
          /* 使用 Flex 纵向布局：顶部时间、中间图片、底部版权 */
          body { 
            margin: 0; 
            padding: 0; 
            display: flex; 
            flex-direction: column; 
            height: 100vh; 
            overflow: hidden; 
            background-color: #fff;
            -webkit-print-color-adjust: exact; 
            font-family: sans-serif;
            box-sizing: border-box;
          }

          /* 顶部：打印时间 */
          .print-header {
            width: 100%;
            text-align: right;
            font-size: 12px;
            color: #666;
            padding-bottom: 8px;
            flex-shrink: 0; /* 防止被压缩 */
          }

          /* 中间：图片容器（占据所有剩余空间） */
          .img-container {
            flex: 1; 
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }

          img { 
            max-width: 100%; 
            max-height: 100%; 
            object-fit: contain; 
          }

          /* 底部：版权文字 */
          .print-footer {
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #999;
            padding-top: 8px;
            flex-shrink: 0; /* 防止被压缩 */
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <!-- 顶部时间 -->
        <div class="print-header">打印时间：${printTime}</div>
        
        <!-- 中间图片 -->
        <div class="img-container">
          <img src="${props.imgData}" id="print-img" />
        </div>

        <!-- 底部版权 -->
        <div class="print-footer">运动会成绩管理系统 ©2026 Klein</div>
      </body>
    </html>
  `);
  doc.close();

  const img = doc.getElementById('print-img');
  
  const doPrint = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    emit('success');

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };

  img.onload = doPrint;
  if (img.complete) doPrint();
};

watch(() => props.visible, (val) => {
  if (val) nextTick(handlePrint);
});
</script>
