import { LEVEL_TYPE_MAPPING } from './constant';

export function levelNumber2String(projectName, numStr) {
  if (!numStr) return numStr;
  switch (LEVEL_TYPE_MAPPING[projectName]) {
    case 0: {
      const ms = numStr.slice(-2);
      const sec = numStr.slice(-4, -2);
      const min = numStr.slice(0, -4);
      return min ? `${min}'${sec}"${ms}` : `${sec || 0}"${ms}`;
    }
    case 1: {
      const cm = numStr.slice(-2);
      const m = numStr.slice(0, -2);
      return `${m || 0}.${cm}`;
    }
    case 2: {
      return `第${numStr}名`;
    }
    default:
      return numStr;
  }
}
