import { debounce, domPaths, makeWorker } from './util'

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

const nativeAjaxSend = XMLHttpRequest.prototype.send
const nativeAjaxOpen = XMLHttpRequest.prototype.open
const oldFetch = window.fetch

export class ErrorLog {
  tracks: ITack[]
  isAddition: boolean
  uid: string
  trackId: string
  brokeTime: number
  addEventListeners?: {
    [key in string]: any
  }
  constructor (uid: string, brokeTime: number, hasTrack: boolean = true) {
    this.tracks = []
    this.uid = uid
    this.trackId = this.trackIdGenerator()
    this.isAddition = false
    this.brokeTime = brokeTime
    this.hijack()
    this.broke()
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
      debounce(function (e: Event) {
        let target = (e.srcElement || e.target) as Node
        if (!target) {
          return
        }
        let time = performance.now()
        console.log('==mousemove==', domPaths(target))
      })
    )
    window.addEventListener(
      'click',
      debounce(function (e) {
        let target = (e.srcElement || e.target) as Node
        if (!target) {
          return
        }
        let time = performance.now()
        console.log('==click==', domPaths(target))
      })
    )
    window.addEventListener(
      'touchmove',
      debounce(function (e) {
        let target = (e.srcElement || e.target) as Node
        if (!target) {
          return
        }
        let time = performance.now()
        console.log('==touchmove==', domPaths(target))
      })
    )
  }
  unHijack () {
    if (this.isAddition !== true) {
      return
    }
    this.unHijackError()
    this.unHijackEvent()
    this.unHijackFn()
    this.unHijackXmlHttpRequest()
    this.unHijackFetch()
  }
  hijack () {
    if (this.isAddition === true) {
      return
    }
    this.hijackError()
    this.hijackEvent()
    this.hijackFn()
    this.hijackXmlHttpRequest()
    this.hijackFetch()
    this.isAddition = true
  }
  unHijackEvent () {
    if (window.EventTarget) {
      window.EventTarget.prototype.addEventListener = oldEventTargetAddListener
    } else {
      EventsKey.forEach(function (key: string) {
        let win: any = window
        win[key].prototype.addEventListener = oldEvents[key]
      })
    }
  }
  hijackEvent () {
    if (window.EventTarget) {
      window.EventTarget.prototype.addEventListener = function (type: string, ...arg) {
        try {
          return oldEventTargetAddListener.call(this, type, ...arg)
        } catch (error) {
          let time = performance.now()
          let stack = new Error(`Event ${type} ${time}`).stack
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
            let time = performance.now()
            let stack = new Error(`Event ${type} ${time}`).stack
            error.stack = error.stack + '\n' + stack
            throw error
          }
        }
      })
    }
  }
  broke () {
    let worker = makeWorker(function (this: Worker, brokeTime: any) {
      let pongTimeout: any
      let pongTimeoutFn = () => {
        return setTimeout(function () {
          console.log('timeout')
        }, brokeTime)
      }
      let sendPing = () => {
        return setTimeout(() => {
          this.postMessage({
            type: 'ping'
          })
        }, 1000)
      }
      this.addEventListener('message', e => {
        let data = e.data || {}
        if (data.type === 'pong') {
          // console.log('获取pong,清除超时')
          clearTimeout(pongTimeout)
          sendPing()
          pongTimeout = pongTimeoutFn()
        }
      })
      sendPing()
      pongTimeout = pongTimeoutFn()
    }, `${this.brokeTime}`)
    if (!worker) {
      return
    }
    worker.addEventListener('message', e => {
      if (!worker) return
      let data = e.data || {}
      if (data.type === 'ping') {
        // console.log('获取ping,返回pong')
        worker.postMessage({
          type: 'pong'
        })
      }
    })
  }
  unHijackFn () {
    FnKeys.forEach(function (key: string) {
      let win: any = window
      win[key] = oldFns[key]
    })
  }
  hijackFn () {
    FnKeys.forEach(function (key: string) {
      let win: any = window
      win[key] = function (...arg: any) {
        try {
          return oldFns[key].call(this, ...arg)
        } catch (error) {
          let time = performance.now()
          let stack = new Error(`ReFn ${key} ${time}`).stack
          error.stack = error.stack + '\n' + stack
          throw error
        }
      }
    })
  }
  unHijackError () {
    // --
    if (!this.addEventListeners) {
      return
    }
    window.removeEventListener(
      'rejectionhandled',
      this.addEventListeners['rejectionhandled'],
      true
    )
    window.removeEventListener(
      'unhandledrejection',
      this.addEventListeners['unhandledrejection'],
      true
    )
    window.removeEventListener('error', this.addEventListeners['error'], true)
  }
  hijackError () {
    //  --
    this.addEventListeners = this.addEventListeners || {}
    this.addEventListeners['rejectionhandled'] = function (e: PromiseRejectionEvent) {
      console.log(arguments, '===rejectionhandled===')
    }
    this.addEventListeners['unhandledrejection'] = function (e: PromiseRejectionEvent) {
      console.log(arguments, '===unhandledrejection===')
    }
    this.addEventListeners['error'] = function (e: ErrorEvent) {
      console.log(arguments, '===error===')
    }
    window.addEventListener(
      'rejectionhandled',
      this.addEventListeners['rejectionhandled'],
      true
    )
    window.addEventListener(
      'unhandledrejection',
      this.addEventListeners['unhandledrejection'],
      true
    )
    window.addEventListener('error', this.addEventListeners['error'], true)
    // let a = new Promise(function (res, rj) {
    //   rj('=====rj===')
    // }).catch(function (e) {
    //   console.log(e)
    //   throw e
    // })
    // throw new Error('=====错误====')
  }
  unHijackXmlHttpRequest () {
    XMLHttpRequest.prototype.open = nativeAjaxOpen
    XMLHttpRequest.prototype.send = nativeAjaxSend
  }
  unHijackFetch () {
    if (!oldFetch) {
      return
    }
    window.fetch = oldFetch
  }
  hijackFetch () {
    if (!oldFetch) {
      return
    }
    window.fetch = function (...arg) {
      return oldFetch
        .call(this, ...arg)
        .then(res => {
          if (!res.ok) {
            // True if status is HTTP 2xx
            // 上报错误
          }
          return res
        })
        .catch(error => {
          // 上报错误
          throw error
        })
    }
  }
  hijackXmlHttpRequest () {
    if (!XMLHttpRequest) {
      return
    }
    XMLHttpRequest.prototype.open = function (
      mothod: string,
      url: string,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      const xhrInstance: any = this
      xhrInstance._url = url
      return nativeAjaxOpen.call(this, mothod, url, async as any, username, password)
    }

    XMLHttpRequest.prototype.send = function (...args) {
      const oldCb = this.onreadystatechange
      const xhrInstance: any = this

      xhrInstance.addEventListener('error', function (e: any) {
        const errorObj = {
          ...e,
          error_msg: 'ajax filed',
          error_stack: JSON.stringify({
            status: e.target.status,
            statusText: e.target.statusText
          }),
          error_native: e
        }
      })

      xhrInstance.addEventListener('abort', function (e: any) {
        if (e.type === 'abort') {
          xhrInstance._isAbort = true
        }
      })

      this.onreadystatechange = function (...innerArgs) {
        if (xhrInstance.readyState === 4) {
          if (!xhrInstance._isAbort && xhrInstance.status !== 200) {
            // 请求不成功时，拿到错误信息
            const errorObj = {
              error_msg: JSON.stringify({
                code: xhrInstance.status,
                msg: xhrInstance.statusText,
                url: xhrInstance._url
              }),
              error_stack: '',
              error_native: xhrInstance
            }
          }
        }
        oldCb && oldCb.apply(this, innerArgs)
      }
      return nativeAjaxSend.apply(this, args)
    }
  }
}
