export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

export interface RequestConfig {
  url: string
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  timeout?: number
  withCredentials?: boolean
  responseType?: XMLHttpRequestResponseType
  onUploadProgress?: (progress: number) => void
  onDownloadProgress?: (progress: number) => void
}

export interface Response<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onRequestError?: (error: any) => any
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: Response<T>, config: RequestConfig) => Response<T> | Promise<Response<T>>
  onResponseError?: (error: any) => any
}

export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  maxConcurrent?: number
  withCredentials?: boolean
  headers?: Record<string, string>
} 