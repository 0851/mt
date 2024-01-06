import EventBus from './event'
import { performancenow, isReady } from './src/util'

function requestAnimation (): (callback: FrameRequestCallback) => number {
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
}

function cancelAnimation (): (handle: number) => void {
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
}

class MtFps extends EventBus implements Mt.Plugin {
  lists: number[] = []
  lastTime: number = 0
  lastFameTime: number = 0
  frame: number = 0
  count: number
  timer?: number
  stoped: boolean = false
  reportTime: number
  sampleTime: number
  monitor?: Mt
  constructor (count?: number, reportTime?: number, sampleTime?: number) {
    super()
    this.count = count || 10
    this.reportTime = reportTime || 60 * 1000
    this.sampleTime = sampleTime || 5000
  }
  apply (monitor: Mt): void {
    let self = this
    self.monitor = monitor
    self.lastTime = performancenow()
    self.frame = 0
    self.lastFameTime = performancenow()
    self.lists = []
    self.stoped = false
    self.timer = requestAnimation()(() => {
      self.start()
    })
    self.reportFps()
    self.emitFps()
  }
  emitFps (): void {
    if (!this.monitor) return
    setTimeout(() => {
      this.emit('fps:logs', this.lists)
      this.emitFps()
    }, this.sampleTime)
  }
  reportFps (): void {
    if (!this.monitor) return
    setTimeout(() => {
      this.monitor?.report({
        type: 'fps',
        payload: {
          fps: this.lists
        }
      })
      this.reportFps()
    }, this.reportTime)
  }
  start () {
    if (!this.monitor) return
    try {
      if (this.stoped === true) {
        if (this.timer) {
          cancelAnimation()(this.timer)
        }
        return
      }
      let now = performancenow()
      this.frame++
      if (now - this.lastTime > 1000) {
        this.lists.push(this.frame)
        this.frame = 0
        this.lastTime = now
      }
      if (this.lists.length > this.count) {
        this.lists.splice(0, 1)
      }
      if (this.timer) {
        cancelAnimation()(this.timer)
      }
      this.timer = requestAnimation()(() => {
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
export { MtFps }
export default MtFps
