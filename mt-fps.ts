import EventBus from './event'

let requestAnimFrame = (function (): (callback: FrameRequestCallback) => number {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    (window as any).mozRequestAnimationFrame ||
    (window as any).oRequestAnimationFrame ||
    (window as any).msRequestAnimationFrame ||
    function (cb: Function) {
      return window.setTimeout(cb, 1000 / 60)
    }
  )
})()

let cancelAnimationFrame = (function (): (handle: number) => void {
  return (
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    (window as any).mozCancelAnimationFrame ||
    (window as any).oCancelAnimationFrame ||
    (window as any).msCancelAnimationFrame ||
    function (handle: number) {
      return window.clearTimeout(handle)
    }
  )
})()

class MonitorFps extends EventBus implements Monitor.MonitorPlugin {
  lists: number[] = []
  lastTime: number = 0
  lastFameTime: number = 0
  frame: number = 0
  count: number
  timer?: number
  stoped: boolean = false
  timeout: number
  monitor?: Monitor
  constructor (count: number, timeout: number) {
    super()
    this.count = count
    this.timeout = timeout || 100000
  }
  apply (monitor: Monitor): void {
    this.monitor = monitor
    this.lastTime = monitor.getTime()
    this.frame = 0
    this.lastFameTime = monitor.getTime()
    this.lists = []
    this.stoped = false
    this.start()
    this.reportFps()
  }
  reportFps () {
    if (!this.monitor) return
    setTimeout(() => {
      if (!this.monitor?.reportUrl) {
        return
      }
      this.monitor?.report('fps', this.lists)
      this.reportFps()
    }, this.timeout)
  }
  start () {
    if (!this.monitor) return
    try {
      if (this.stoped === true) {
        if (this.timer) {
          cancelAnimationFrame(this.timer)
        }
        return
      }
      let now = this.monitor.getTime()
      let fs = now - this.lastFameTime
      this.lastFameTime = now
      let fps = Math.round(1000 / fs)
      this.frame++
      if (now > 1000 + this.lastTime) {
        fps = Math.round((this.frame * 1000) / (now - this.lastTime))
        this.frame = 0
        this.lastTime = now
      }
      if (this.lists.length >= this.count) {
        this.lists.splice(0, 1)
      }
      this.lists.push(fps)
      if (this.timer) {
        cancelAnimationFrame(this.timer)
      }
      this.timer = requestAnimFrame(() => {
        this.start()
      })
    } catch (error) {
      console.error(`fps error`, error)
    }
  }
  stop () {
    this.stoped = true
  }
}
export { MonitorFps }
export default MonitorFps
