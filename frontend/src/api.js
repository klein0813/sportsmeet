import axios from 'axios';
import { HOST, PORT } from './utils/constant';

const instance = axios.create({
  baseURL: `${HOST}:${PORT}/`,
  timeout: 10000,
  headers: {}
})

export async function getProjects(finish) {
  try {
    return instance.get(`/project?finish=${finish}`);
  } catch (error) {
    console.error(error);
  }
}


export async function getRecords(query) {
  try {
    return instance.get('/record', {
      params: {
        ...query
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getTopRecords(grade, top) {
  try {
    return instance.get(`/record/get-top?top=${top}&grade=${grade}`);
  } catch (error) {
    console.error(error);
  }
}

export async function getGroupRecords(grade) {
  try {
    return instance.get(`/sclass?grade=${grade}`);
  } catch (error) {
    console.error(error);
  }
}

export async function exportRecord() {
  try {
    // const link = document.createElement('a')
    // link.href = '/record/exproda'
    // link.download = '运动会项目数据.xlsx'
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
    window.open('/record/exproda')
    // return instance.get('/record/exproda');
  } catch (error) {
    console.error(error);
  }
}

export async function getSclasses() {
  try {
    return instance.get('/sclass');
  } catch (error) {
    console.error(error);
  }
}

export async function getAthletesByKeyword(keyword, callback) {
  try {
    const response = await instance.get(`/athlete/sid?keyword=${keyword}`);
    const data = await response.data.map(athlete => ({
      value: athlete._id,
      label: `${athlete.name} (${athlete.sid})`,
      name: athlete.name,
      sid: athlete.sid,
      class: athlete.class,
    }));
    if (callback && typeof callback === 'function') {
      callback(data);
    }
    return data;
  } catch (error) {
    console.error(error);
  }
}

export async function addRecords(data) {
  try {
    return instance.post(`/record/batch`, { data });
  } catch (error) {
    console.error(error);
  }
}

export async function getAthletes() {
  try {
    return instance.get('/athlete');
  } catch (error) {
    console.error(error);
  }
}
