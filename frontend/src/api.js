import axios from 'axios';
import { HOST, PORT } from './utils/constant';

const instance = axios.create({
  baseURL: `${HOST}:${PORT}/`,
  timeout: 10000,
  headers: {}
})

// 评分系统
export async function getJudgeCount(activityId) {
  try {
    return instance.get(`comps/judge/count/${activityId}`);
  } catch (error) {
    console.error(error);
  }
}
