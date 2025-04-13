import { HttpClient } from '../index'
import { RequestConfig, Response, ResponseConfig } from '../types'

describe('HttpClient', () => {
  let client: HttpClient

  beforeEach(() => {
    client = new HttpClient({
      baseURL: 'https://api.example.com',
      timeout: 1000
    })
  })

  describe('request method', () => {
    it('should make request with config', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      const config: RequestConfig = {
        url: '/test',
        method: 'GET'
      }

      await client.request(config)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })
  })

  describe('request interceptors', () => {
    it('should modify request config', async () => {
      client.useRequestInterceptor({
        onRequest: (config) => {
          config.headers = {
            ...config.headers,
            'X-Test': 'test'
          }
          return config
        }
      })

      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Test': 'test'
          })
        })
      )
    })

    it('should handle request error', async () => {
      const errorHandler = jest.fn()
      client.useRequestInterceptor({
        onRequestError: errorHandler
      })

      const mockFetch = jest.fn().mockRejectedValue(new Error('Request Error'))
      global.fetch = mockFetch

      await expect(client.get('/test')).rejects.toThrow('Request Error')
      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('response interceptors', () => {
    it('should handle response with new interface', async () => {
      const mockResponse = {
        data: 'test',
        status: 200,
        statusText: 'OK',
        headers: {}
      }

      client.useResponseInterceptor({
        onResponse: (value: ResponseConfig) => {
          const { response, config } = value
          expect(config.url).toBe('/test')
          return response
        }
      })

      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve(mockResponse)
      })
      global.fetch = mockFetch

      const response = await client.get('/test')
      expect(response.data).toBe('test')
    })

    it('should handle response error', async () => {
      const errorHandler = jest.fn()
      client.useResponseInterceptor({
        onResponseError: errorHandler
      })

      const mockFetch = jest.fn().mockRejectedValue(new Error('Response Error'))
      global.fetch = mockFetch

      await expect(client.get('/test')).rejects.toThrow('Response Error')
      expect(errorHandler).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network Error'))
      global.fetch = mockFetch

      await expect(client.get('/test')).rejects.toThrow('Network Error')
    })

    it('should handle timeout', async () => {
      const mockFetch = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 2000)
        })
      })
      global.fetch = mockFetch

      await expect(client.get('/test')).rejects.toThrow('Timeout')
    })

    it('should handle non-200 status codes', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
        json: () => Promise.resolve({ error: 'Not Found' })
      })
      global.fetch = mockFetch

      const response = await client.get('/test')
      expect(response.status).toBe(404)
      expect(response.statusText).toBe('Not Found')
    })
  })

  describe('request methods', () => {
    it('should make GET request', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      await client.get('/test')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'GET' })
      )
    })

    it('should make POST request with data', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      const data = { name: 'test' }
      await client.post('/test', data)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      )
    })

    it('should make PUT request', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      await client.put('/test')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('should make DELETE request', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        json: () => Promise.resolve({ data: 'test' })
      })
      global.fetch = mockFetch

      await client.delete('/test')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'DELETE' })
      )
    })
  })
}) 