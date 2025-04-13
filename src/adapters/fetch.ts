import { RequestConfig, Response } from '../types'

export class FetchAdapter {
  async request<T>(config: RequestConfig): Promise<Response<T>> {
    let { url, method = 'GET', headers = {}, data, timeout, withCredentials } = config

    // 创建 AbortController 用于超时控制
    const controller = new AbortController()
    const signal = controller.signal

    // 设置超时
    if (timeout) {
      setTimeout(() => controller.abort(), timeout)
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers,
      credentials: withCredentials ? 'include' : 'same-origin',
      signal
    }

    // 添加请求体
    if (data) {
      if(method === 'GET') {
        url = `${url}?${new URLSearchParams(data).toString()}`
      }else {
        requestConfig.body = data instanceof FormData ? data : JSON.stringify(data)
      }
    }

    try {
      const response = await fetch(url, requestConfig)
      const responseHeaders: Record<string, string> = {}
      
      // 获取响应头
      response.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value
      })

      // 获取响应数据
      const responseData = await response.json()

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout')
        }
      }
      throw error
    }
  }
} 