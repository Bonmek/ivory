import axios from 'axios'

const axiosConfig = {
  baseURL: process.env.REACT_APP_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
}

const apiClient = axios.create(axiosConfig)

export default apiClient
