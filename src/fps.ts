import { getTime } from './util'
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

export class Fps {
  lists: number[] = []
  lastTime: number
  lastFameTime: number
  frame: number
  count: number
  timer?: number
  stoped: boolean
  constructor (count: number) {
    this.lastTime = getTime()
    this.frame = 0
    this.lastFameTime = getTime()
    this.lists = []
    this.count = count
    this.stoped = false
    this.start()
  }
  start () {
    try {
      if (this.stoped === true) {
        if (this.timer) {
          cancelAnimationFrame(this.timer)
        }
        return
      }
      let now = getTime()
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
