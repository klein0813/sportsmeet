import { LEVEL_TYPE_MAPPING } from './constant';

export function levelNumber2String(projectName, numStr) {
  if (!numStr) return numStr;
  switch (LEVEL_TYPE_MAPPING[projectName]) {
    case 0: {
      const ms = numStr.slice(-2).padStart(2, '0');
      const sec = numStr.slice(-4, -2);
      const min = numStr.slice(0, -4);
      return min ? `${min}'${sec}"${ms}` : `${sec || 0}"${ms}`;
    }
    case 1: {
      const cm = numStr.slice(-2);
      const m = numStr.slice(0, -2);
      return `${m || 0}.${cm}m`;
    }
    case 2: {
      return `第${numStr}名`;
    }
    default:
      return numStr;
  }
}

export function hashColor(str) {
  let hash = 0
  const colors = [
    '#1677ff', // 1  蓝
    '#13c2c2', // 2  青
    '#52c41a', // 3  绿
    '#a0d911', // 4  黄绿
    '#faad14', // 5  金
    '#fa8c16', // 6  橙
    '#fa541c', // 7  火山
    '#f5222d', // 8  红
    '#eb2f96', // 9  品红
    '#722ed1', // 10 紫
    '#2f54eb', // 11 深蓝
    '#08979c', // 12 深青
    '#389e0d', // 13 深绿
    '#7cb305', // 14 深黄绿
    '#d48806', // 15 深金
    '#d46b08', // 16 深橙
    '#d4380d', // 17 深火山
    '#cf1322', // 18 深红
    '#c41d7f', // 19 深品红
    '#531dab', // 20 深紫
  ]
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}
