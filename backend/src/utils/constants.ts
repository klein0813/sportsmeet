export const EVENT_HOME = 'home';
export const API_PROJECT = 'project';
export const API_INIT = 'init';
export const API_ID = ':id';
export const API_BATCH = 'batch';
export const API_FIND = 'find';
export const API_COUNT = 'count';
export const API_COUNT_ID = 'count/:id';
export const API_ATHLETE = 'athlete';
export const API_SID = 'sid';
export const API_RECORD = 'record';
export const API_GET_TOP = 'get-top';
export const API_SCLASS = 'sclass';
export const API_EXPORT_PROJECT_RECORD_DATA = 'exproda';

export const FLAG = '2026';
export const SHOW_TOP = 6;

export const SCORE_RULE = {
  0: [7, 5, 4, 3, 2, 1],
  1: [14, 10, 8, 6, 4, 2],
  2: [14, 10, 8, 6, 4, 2],
};
export const GRADE_MAPPING = {
  1: '高一',
  2: '高二',
  3: '高三',
};
export const GENDER_MAPPING = {
  0: '男',
  1: '女',
};
export const RANKING_MAPPING = {
  1: '第一名',
  2: '第二名',
  3: '第三名',
  4: '第四名',
  5: '第五名',
  6: '第六名',
};
export const PROJECTS = [
  '100M',
  '200M',
  '400M',
  '800M',
  '1500M',
  'highJump',
  'longJump',
  'shotPut',
  'tugOfWar',
  'ropeJump',
  '4X100M',
  '30×50MRelay',
  // 'overallScore',
  // 'ranking',
];
export const STR_GROUPS = ['0', '1', '2'];
export const STR_ROUNDS = ['0', '1', '2'];
export const PROJECT_DATA = {
  '100M': {
    type: 1, // 0, 田赛，1，竞赛
    category: 0, // 0, 单项；1，团体赛, 2, 班级赛
    record: -1, // 记录
  },
  '200M': {
    type: 1,
    category: 0,
    record: -1,
  },
  '400M': {
    type: 1,
    category: 0,
    record: -1,
  },
  '800M': {
    type: 1,
    category: 0,
    record: -1,
  },
  '1500M': {
    type: 1,
    category: 0,
    record: -1,
  },
  highJump: {
    type: 0,
    category: 0,
    record: -1,
  },
  longJump: {
    type: 0,
    category: 0,
    record: -1,
  },
  shotPut: {
    type: 0,
    category: 0,
    record: -1,
  },
  tugOfWar: {
    type: 0,
    category: 2,
    record: -1,
  },
  ropeJump: {
    type: 1,
    category: 2,
    record: -1,
  },
  '4X100M': {
    type: 1,
    category: 1,
    record: -1,
  },
  '30×50MRelay': {
    type: 1,
    category: 2,
    record: -1,
  },
};
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
  overallScore: '总分',
  ranking: '排名',
};
export const PROJECT_NAME_MAPPING = {
  '100米': '100M',
  '200米': '200M',
  '400米': '400M',
  '800米': '800M',
  '1500米': '1500M',
  跳高: 'highJump',
  跳远: 'longJump',
  铅球: 'shotPut',
  拔河: 'tugOfWar',
  跳绳: 'ropeJump',
};
export const SCLASS = {
  1: [
    '101',
    '102',
    '103',
    '104',
    '105',
    '106',
    '107',
    '108',
    '109',
    '110',
    '111',
    '112',
    '113',
    '114',
    '115',
    '116',
    '117',
    '118',
    '119',
    '120',
  ],
  2: [
    '201',
    '202',
    '203',
    '204',
    '205',
    '206',
    '207',
    '208',
    '209',
    '210',
    '211',
    '212',
    '213',
    '214',
    '215',
    '216',
    '217',
    '218',
  ],
  3: [
    '301',
    '302',
    '303',
    '304',
    '305',
    '306',
    '307',
    '308',
    '309',
    '310',
    '311',
    '312',
    '313',
    '314',
    '315',
    '316',
    '317',
    '318',
  ],
};
