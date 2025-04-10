import { RequestConfig, Response } from '../types'

export class XHRAdapter {
  private xhr: XMLHttpRequest

  constructor() {
    this.xhr = new XMLHttpRequest()
  }

  async request<T>(config: RequestConfig): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      const xhr = this.xhr

      // 设置请求方法
      xhr.open(config.method || 'GET', config.url)

      // 设置请求头
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value)
        })
      }

      // 设置超时
      if (config.timeout) {
        xhr.timeout = config.timeout
      }

      // 设置跨域凭证
      if (config.withCredentials) {
        xhr.withCredentials = true
      }

      // 设置响应类型
      if (config.responseType) {
        xhr.responseType = config.responseType
      }

      // 上传进度
      if (config.onUploadProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            config.onUploadProgress!(progress)
          }
        }
      }

      // 下载进度
      if (config.onDownloadProgress) {
        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100
            config.onDownloadProgress!(progress)
          }
        }
      }

      // 请求完成
      xhr.onload = () => {
        const headers: Record<string, string> = {}
        const headerStr = xhr.getAllResponseHeaders()
        const headerPairs = headerStr.split('\n')
        
        headerPairs.forEach((header) => {
          const [key, value] = header.split(': ')
          if (key && value) {
            headers[key.toLowerCase()] = value.trim()
          }
        })

        const response: Response<T> = {
          data: xhr.response,
          status: xhr.status,
          statusText: xhr.statusText,
          headers
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response)
        } else {
          reject(new Error(`Request failed with status code ${xhr.status}`))
        }
      }

      // 请求错误
      xhr.onerror = () => {
        reject(new Error('Network Error'))
      }

      // 请求超时
      xhr.ontimeout = () => {
        reject(new Error('Timeout'))
      }

      // 发送请求
      xhr.send(config.data)
    })
  }

  abort() {
    this.xhr.abort()
  }
} 