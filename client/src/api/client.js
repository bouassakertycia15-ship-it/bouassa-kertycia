import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach token
const token = localStorage.getItem('echo_token')
if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export function setAuthToken(t) {
  if (t) {
    localStorage.setItem('echo_token', t)
    api.defaults.headers.common.Authorization = `Bearer ${t}`
  } else {
    localStorage.removeItem('echo_token')
    delete api.defaults.headers.common.Authorization
  }
}

export default api
