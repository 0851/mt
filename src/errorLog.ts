import { debounce } from './util'

const EventsKey = ['Document', 'Element', 'Node', 'FileReader', 'XMLHttpRequest']
// 重写事件绑定
const EventTarget = (window.EventTarget || {}).prototype || {}
const oldEventTargetAddListener = EventTarget.addEventListener
const oldEvents: any = EventsKey.reduce((res: any, key: string) => {
  res[key] = (window as any)[key].prototype.addEventListener
  return res
}, {})
const FnKeys = ['setTimeout', 'setInterval', 'requestAnimationFrame']
const oldFns: any = FnKeys.reduce((res: any, key: string) => {
  res[key] = (window as any)[key]
  return res
}, {})

export interface ITack {
  // 收集时间
  time: number
  // 用户代理
  userAgent: string
  // 网络状态
  online: boolean
  // 平台
  platform: string
  // 语言
  language: string
  // 鼠标所在位置
  x: number
  y: number
  // 页面宽度
  pageWidth: number
  // 页面高度
  pageHeight: number
  // 屏幕宽度
  screenWidth: number
  // 屏幕高度
  screenHeight: number
  // 所在页面地址
  uri: string
  // 来源地址
  referer?: string
  target: {
    tag: string
    className?: string
    id?: string
    attr?: string
  }
  paths: []
}
export class ErrorLog {
  tracks: ITack[]
  isAddition: boolean
  uid: string
  trackId: string

  constructor (uid: string, hasTrack: boolean = true) {
    this.tracks = []
    this.uid = uid
    this.trackId = this.trackIdGenerator()
    this.isAddition = false
    this.addition()
    if (hasTrack === true) {
      this.recordTrack()
    }
  }
  trackIdGenerator () {
    let d = new Date().getTime()
    if (window.performance && typeof window.performance.now === 'function') {
      d += performance.now()
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    return uuid
  }
  setUid (uid: string) {
    this.uid = uid
  }
  recordTrack () {
    window.addEventListener(
      'mousemove',
      debounce(function (e) {
        console.log('==mousemove==', e)
      })
    )
    window.addEventListener(
      'click',
      debounce(function (e) {
        console.log('==click==', e)
      })
    )
    window.addEventListener(
      'touchmove',
      debounce(function (e) {
        console.log('==touchmove==', e)
      })
    )
  }
  reAddition () {
    if (this.isAddition !== true) {
      return
    }
    if (window.EventTarget) {
      window.EventTarget.prototype.addEventListener = oldEventTargetAddListener
    } else {
      EventsKey.forEach(function (key: string) {
        let win: any = window
        win[key].prototype.addEventListener = oldEvents[key]
      })
      FnKeys.forEach(function (key: string) {
        let win: any = window
        win[key] = oldFns[key]
      })
    }
  }
  addition () {
    if (this.isAddition === true) {
      return
    }
    if (window.EventTarget) {
      window.EventTarget.prototype.addEventListener = function (type: string, ...arg) {
        try {
          return oldEventTargetAddListener.call(this, type, ...arg)
        } catch (error) {
          let stack = new Error(`Event ${type}`).stack
          error.stack = error.stack + '\n' + stack
          throw error
        }
      }
    } else {
      EventsKey.forEach(function (key: string) {
        let win: any = window
        win[key].prototype.addEventListener = function (type: string, ...arg: any) {
          try {
            return oldEvents[key].call(this, type, ...arg)
          } catch (error) {
            let stack = new Error(`Event ${type}`).stack
            error.stack = error.stack + '\n' + stack
            throw error
          }
        }
      })
    }
    FnKeys.forEach(function (key: string) {
      let win: any = window
      win[key] = function (...arg: any) {
        try {
          return oldFns[key].call(this, ...arg)
        } catch (error) {
          let stack = new Error(`re Fn ${key}`).stack
          error.stack = error.stack + '\n' + stack
          throw error
        }
      }
    })
    window.addEventListener('unhandledrejection', function () {
      // --
    })
    window.addEventListener('error', function () {
      // --
    })
    this.isAddition = true
  }
}
