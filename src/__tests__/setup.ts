import '@testing-library/jest-dom'

// 模拟 XMLHttpRequest
class MockXMLHttpRequest {
  open() {}
  send() {}
  setRequestHeader() {}
  getAllResponseHeaders() { return '' }
  getResponseHeader() { return null }
  abort() {}
}

// 模拟 FormData
class MockFormData {
  append() {}
}

// 设置全局变量
global.XMLHttpRequest = MockXMLHttpRequest as any
global.FormData = MockFormData as any

// 模拟 fetch
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    json: () => Promise.resolve({ data: 'test' })
  })
) 