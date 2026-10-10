// export const HOST = 'http://8.162.10.15';
// export const PORT = 35431;
export const HOST = 'http://172.16.50.65';
export const PORT = 31245;;

export const EVENT_RECORE_MODAL_CLOSE = 'modal-close'
export const EVENT_RECORE_ADD = 'record-add';
export const EVENT_RECORE_SEARCN = 'search';

export const GROUP_LEVEL_MAPPING = {
  '100M': '100米',
  '200M': '200米',
  '400M': '400米',
  '800M': '800米',
  '1500M': '1500米',
  highJump: '跳高',
  longJump: '跳远',
  shotPut: '铅球',
  tugOfWar: '拔河',
  ropeJump: '跳绳',
  '4X100M': '4*100米',
  '30×50MRelay': '30*50接力',
};
export const SHOW_TOP = 6;
export const GENDER_MAPPING = {
  0: '男子',
  1: '女子',
  2: '团体',
};
export const RANKING_MAPPING = {
  1: '第一名',
  2: '第二名',
  3: '第三名',
  4: '第四名',
  5: '第五名',
  6: '第六名',
};
export const PROJECT_ROUND = [
  {
    value: 1,
    label: '预赛',
  },
  {
    value: 2,
    label: '预决赛',
  },
  {
    value: 3,
    label: '决赛',
  },
];
export const PROJECT_ROUND_MAPPING = {
  1: '预赛',
  2: '预决赛',
  3: '决赛',
};
export const GRADE_MAPPDING = {
  1: '高一',
  2: '高二',
  3: '高三',
};
export const LEVEL_TYPE_MAPPING = {
  // 0，时间；1，距离、高度；2，名次；3，个数
  '100M': 0,
  '200M': 0,
  '400M': 0,
  '800M': 0,
  '1500M': 0,
  highJump: 1,
  longJump: 1,
  shotPut: 1,
  tugOfWar: 2, // 成绩是名次
  ropeJump: 3,
  '4X100M': 0,
  '30×50MRelay': 0,
}
