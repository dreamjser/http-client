import { HttpClientConfig, RequestConfig, RequestInterceptor, ResponseInterceptor, Response } from './types'
import { XHRAdapter } from './adapters/xhr'
import { FetchAdapter } from './adapters/fetch'
import { RequestQueue } from './queue'

export * from './types'

export class HttpClient {
  private config: HttpClientConfig
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private queue: RequestQueue
  private xhrAdapter: XHRAdapter
  private fetchAdapter: FetchAdapter

  constructor(config: HttpClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 10000,
      maxConcurrent: 5,
      withCredentials: false,
      headers: {},
      ...config
    }

    this.queue = new RequestQueue(this.config.maxConcurrent)
    this.xhrAdapter = new XHRAdapter()
    this.fetchAdapter = new FetchAdapter()
  }

  useRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
    return this
  }

  useResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
    return this
  }

  private async processRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let finalConfig = { ...config }

    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        finalConfig = await interceptor.onRequest(finalConfig)
      }
    }

    return finalConfig
  }

  private async processResponseInterceptors<T>(response: Response<T>, config: RequestConfig): Promise<Response<T>> {
    let finalResponse = { ...response }

    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onResponse) {
        finalResponse = await interceptor.onResponse(finalResponse, config)
      }
    }

    return finalResponse
  }

  async request<T>(config: RequestConfig): Promise<Response<T>> {
    try {
      // 处理请求拦截器
      const requestConfig = await this.processRequestInterceptors({
        ...this.config,
        ...config,
        url: this.config.baseURL ? `${this.config.baseURL}${config.url}` : config.url
      })

      // 根据是否有进度监控需求选择适配器
      const adapter = requestConfig.onUploadProgress || requestConfig.onDownloadProgress
        ? this.xhrAdapter
        : this.fetchAdapter

      // 执行请求
      const response = await this.queue.enqueue<T>(requestConfig, adapter)

      // 处理响应拦截器
      return this.processResponseInterceptors(response, requestConfig)
    } catch (error) {
      // 处理请求错误拦截器
      for (const interceptor of this.requestInterceptors) {
        if (interceptor.onRequestError) {
          error = await interceptor.onRequestError(error)
        }
      }

      // 处理响应错误拦截器
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onResponseError) {
          error = await interceptor.onResponseError(error)
        }
      }

      throw error
    }
  }

  async get<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  async post<T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  async put<T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  async delete<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  async patch<T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<Response<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }
} 