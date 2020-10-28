import { Plugin } from '@nuxt/types'
import axios from 'axios'

const plugin: Plugin = ({ error }) => {
  axios.defaults.baseURL = `${process.env.apiUrl}/api`
  axios.defaults.withCredentials = true

  axios.interceptors.response.use(
    response => response,
    ({ response }) => {
      const params = {
        statusCode: response.status,
        message: response.statusText
      }
      if (response.status !== 401) {
        error(params)
      } else {
        return Promise.reject(params)
      }
    }
  )
}

export default plugin
