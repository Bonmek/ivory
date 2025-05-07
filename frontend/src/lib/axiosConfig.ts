import axios from 'axios'

const axiosConfig = {
  baseURL: process.env.REACT_APP_SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}

const apiClient = axios.create(axiosConfig)

export default apiClient
