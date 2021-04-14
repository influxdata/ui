import {AutoRefresh} from 'src/types'

type func = (...args: any[]) => any

export class AutoRefresher {
  public subscribers: func[] = []

  private intervalID: NodeJS.Timer

  public subscribe(fn: func) {
    this.subscribers = [...this.subscribers, fn]
  }

  public unsubscribe(fn: func) {
    this.subscribers = this.subscribers.filter(f => f !== fn)
  }

  public poll(autoRefresh: AutoRefresh, stopFunc) {
    this.clearInterval()
    this.intervalID = setInterval(() => {
      this.refresh(true, stopFunc)
    }, autoRefresh.interval)
  }

  public stopPolling() {
    this.clearInterval()
  }

  private clearInterval() {
    if (!this.intervalID) {
      return
    }

    clearInterval(this.intervalID)
    this.intervalID = null
  }

  private refresh = (isAutoRefresh?: boolean, stopFunc?: () => void) => {
    if (isAutoRefresh) {
      stopFunc()
    }
    this.subscribers.forEach(fn => fn())
  }
}

export const GlobalAutoRefresher = new AutoRefresher()
