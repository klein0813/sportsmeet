import axios from 'axios';
import { HOST, PORT } from './utils/constant';

const instance = axios.create({
  baseURL: `${HOST}:${PORT}/`,
  timeout: 10000,
  headers: {}
})

export async function getProjects() {
  try {
    return instance.get(`/project`);
  } catch (error) {
    console.error(error);
  }
}

export async function getAthletesByKeyword(keyword, callback) {
  try {
    const response = await instance.get(`/athlete/sid?keyword=${keyword}`);
    const data = await response.data.map(athlete => ({
      value: athlete.sid,
      label: `${athlete.name} (${athlete.sid})`,
      name: athlete.name,
    }));
    if (callback && typeof callback === 'function') {
      callback(data);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}
