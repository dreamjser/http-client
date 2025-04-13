import { HttpClient } from '../src'

// 创建 HTTP 客户端实例
const client = new HttpClient({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000,
  maxConcurrent: 2
})

// 添加请求拦截器
client.useRequestInterceptor({
  onRequest: (config) => {
    console.log('请求拦截器:', config)
    return config
  }
})

// 添加响应拦截器
client.useResponseInterceptor({
  onResponse: ({ response , config, resolve, reject}) => {
    console.log('响应拦截器:', response)
    resolve(response)
    return response
  }
})

// 声明全局函数
declare global {
  interface Window {
    testGet: () => Promise<void>
    testPost: () => Promise<void>
    testUpload: () => Promise<void>
    testConcurrent: () => Promise<void>
    testInterceptor: () => Promise<void>
  }
}

// 测试 GET 请求
window.testGet = async () => {
  try {
    const response = await client.get('/posts/1')
    document.getElementById('basicResponse')!.textContent = JSON.stringify(response, null, 2)
  } catch (error) {
    document.getElementById('basicResponse')!.textContent = `Error: ${error}`
  }
}

// 测试 POST 请求
window.testPost = async () => {
  try {
    const response = await client.post('/posts', {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    })
    document.getElementById('basicResponse')!.textContent = JSON.stringify(response, null, 2)
  } catch (error) {
    document.getElementById('basicResponse')!.textContent = `Error: ${error}`
  }
}

// 测试文件上传
window.testUpload = async () => {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  const file = fileInput.files?.[0]
  
  if (!file) {
    alert('请选择文件')
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await client.post('/upload', formData, {
      onUploadProgress: (progress) => {
        const progressBar = document.getElementById('uploadProgress')!
        progressBar.style.width = `${progress}%`
      }
    })
    document.getElementById('uploadResponse')!.textContent = JSON.stringify(response, null, 2)
  } catch (error) {
    document.getElementById('uploadResponse')!.textContent = `Error: ${error}`
  }
}

// 测试并发请求
window.testConcurrent = async () => {
  try {
    const responses = await Promise.all([
      client.get('/posts/1'),
      client.get('/posts/2'),
      client.get('/posts/3'),
      client.get('/posts/11'),
      client.get('/posts/22'),
      client.get('/posts/33')
    ])
    document.getElementById('concurrentResponse')!.textContent = JSON.stringify(responses, null, 2)
  } catch (error) {
    document.getElementById('concurrentResponse')!.textContent = `Error: ${error}`
  }
}

// 测试拦截器
window.testInterceptor = async () => {
  try {
    const response = await client.get('/posts/1')
    document.getElementById('interceptorResponse')!.textContent = JSON.stringify(response, null, 2)
  } catch (error) {
    document.getElementById('interceptorResponse')!.textContent = `Error: ${error}`
  }
} 