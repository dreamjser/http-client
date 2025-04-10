# HTTP Client

一个轻量级的 HTTP 客户端，支持 XHR 和 Fetch API，具有请求队列、拦截器、进度监控等功能。

## 特性

- 支持 XHR 和 Fetch API（自动选择）
- 基于 Promise 的异步请求
- TypeScript 支持
- 请求和响应拦截器
- 请求队列和并发控制
- 上传和下载进度监控
- 请求超时处理
- 跨域凭证支持
- 自定义请求头
- 简单易用的 API

## 安装

```bash
npm install http-client
# 或
yarn add http-client
# 或
pnpm add http-client
```

## 使用方法

### 基本使用

```typescript
import { HttpClient } from 'http-client'

// 创建实例
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  maxConcurrent: 3,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

// GET 请求
const getData = async () => {
  try {
    const response = await client.get('/users')
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}

// POST 请求
const createData = async () => {
  try {
    const response = await client.post('/users', {
      name: 'John Doe',
      email: 'john@example.com'
    })
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}
```

### 文件上传（带进度监控）

```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await client.post('/upload', formData, {
      onUploadProgress: (progress) => {
        console.log(`上传进度: ${progress}%`)
      }
    })
    console.log(response.data)
  } catch (error) {
    console.error(error)
  }
}
```

### 并发请求

```typescript
const fetchMultipleData = async () => {
  try {
    const [user, posts, comments] = await Promise.all([
      client.get('/users/1'),
      client.get('/posts?userId=1'),
      client.get('/comments?postId=1')
    ])
    console.log(user.data, posts.data, comments.data)
  } catch (error) {
    console.error(error)
  }
}
```

### 使用拦截器

```typescript
// 添加请求拦截器
client.useRequestInterceptor({
  onRequest: (config) => {
    // 添加认证信息
    config.headers = {
      ...config.headers,
      'Authorization': 'Bearer token'
    }
    return config
  },
  onRequestError: (error) => {
    console.error('请求错误:', error)
    return error
  }
})

// 添加响应拦截器
client.useResponseInterceptor({
  onResponse: (response) => {
    // 处理响应数据
    if (response.status === 200) {
      return response
    }
    throw new Error('请求失败')
  },
  onResponseError: (error) => {
    console.error('响应错误:', error)
    return error
  }
})
```

## API

### HttpClient

#### 构造函数

```typescript
new HttpClient(config?: HttpClientConfig)
```

#### 配置选项

```typescript
interface HttpClientConfig {
  baseURL?: string          // 基础 URL
  timeout?: number          // 请求超时时间（毫秒）
  maxConcurrent?: number    // 最大并发请求数
  withCredentials?: boolean // 是否发送跨域凭证
  headers?: Record<string, string> // 默认请求头
}
```

#### 请求方法

- `get<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>`
- `post<T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<Response<T>>`
- `put<T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<Response<T>>`
- `delete<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<Response<T>>`
- `patch<T>(url: string, data?: any, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<Response<T>>`

#### 请求配置

```typescript
interface RequestConfig {
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
```

#### 响应格式

```typescript
interface Response<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}
```

#### 拦截器

```typescript
interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onRequestError?: (error: any) => any
}

interface ResponseInterceptor {
  onResponse?: <T>(response: Response<T>) => Response<T> | Promise<Response<T>>
  onResponseError?: (error: any) => any
}
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式运行示例
pnpm example:dev

# 构建
pnpm build

# 运行测试
pnpm test

# 监视模式运行测试
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage

# 代码检查
pnpm lint
```

## 示例

项目包含一个完整的示例应用，展示了 HTTP 客户端的主要功能：

1. 基本请求（GET/POST）
2. 文件上传（带进度条）
3. 并发请求
4. 拦截器

运行示例：

```bash
# 开发模式
pnpm example:dev

# 构建
pnpm example:build

# 预览
pnpm example:preview
```

## License

MIT 