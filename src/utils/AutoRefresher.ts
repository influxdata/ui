import {AutoRefresh} from 'src/types'

type func = (...args: any[]) => any

export class AutoRefresher {
  public subscribers: func[] = []

  private intervalID: NodeJS.Timer
  private timerID: NodeJS.Timer

  public onConnect() {
    this.registerListeners()
  }

  public onDisconnect() {
    this.unregisterListeners()
  }

  private registerListeners() {
    window.addEventListener('load', this.registerListeners.bind(this))
    document.addEventListener('mousemove', this.registerListeners.bind(this))
    document.addEventListener('keypress', this.registerListeners.bind(this))
  }

  private unregisterListeners() {
    window.removeEventListener('load', this.registerListeners.bind(this))
    document.removeEventListener('mousemove', this.registerListeners.bind(this))
    document.removeEventListener('keypress', this.registerListeners.bind(this))
  }

  public subscribe(fn: func) {
    this.subscribers = [...this.subscribers, fn]
  }

  public unsubscribe(fn: func) {
    this.subscribers = this.subscribers.filter(f => f !== fn)
  }

  public poll(autoRefresh: AutoRefresh, stopFunc?: () => void) {
    this.clearInterval()
    this.intervalID = setInterval(() => {
      this.refresh(true, stopFunc)
    }, autoRefresh.interval)
  }

  public startTimeout(startFunc: () => void, time: number) {
    this.timerID = setTimeout(() => {
      startFunc()
      this.stopPolling()
    }, time)
  }

  public stopPolling() {
    this.clearTimeout()
    this.clearInterval()
  }

  private clearInterval() {
    if (!this.intervalID) {
      return
    }

    clearInterval(this.intervalID)
    this.intervalID = null
  }

  private clearTimeout() {
    if (!this.timerID) {
      return
    }

    clearTimeout(this.timerID)
    this.timerID = null
  }

  private refresh = (isAutoRefresh = false, stopFunc?: () => void) => {
    if (isAutoRefresh && stopFunc) {
      stopFunc()
    }
    this.subscribers.forEach(fn => fn())
  }
}

export const GlobalAutoRefresher = new AutoRefresher()
