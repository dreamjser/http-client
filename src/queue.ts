import { RequestConfig, Response } from './types'
import { XHRAdapter } from './adapters/xhr'
import { FetchAdapter } from './adapters/fetch'

interface QueueItem {
  config: RequestConfig
  resolve: (value: Response<any>) => void
  reject: (reason?: any) => void
  adapter: XHRAdapter | FetchAdapter
}

export class RequestQueue {
  private queue: QueueItem[] = []
  private running = 0
  private maxConcurrent: number

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent
  }

  async enqueue<T>(config: RequestConfig, adapter: XHRAdapter | FetchAdapter): Promise<Response<T>> {
    return new Promise((resolve, reject) => {
      this.queue.push({ config, resolve, reject, adapter })
      this.process()
    })
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    this.running++
    const item = this.queue.shift()!

    try {
      const response = await item.adapter.request(item.config)
      item.resolve(response)
    } catch (error) {
      item.reject(error)
    } finally {
      this.running--
      this.process()
    }
  }

  clear() {
    this.queue = []
    this.running = 0
  }
} 