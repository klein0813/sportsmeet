import { LEVEL_TYPE_MAPPING } from 'src/utils/constants';

export default class CopmsUtil {
  static levelNumber2String(projectName, numStr) {
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
}
