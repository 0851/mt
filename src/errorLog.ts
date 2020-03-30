import {
  debounce,
  domPaths,
  getEl,
  makeWorker,
  report,
  request,
  isFunction
} from './util'

const EventsKey = ['Document', 'Element', 'Node', 'FileReader']
// 重写事件绑定
const EventTargetPrototype = (window.EventTarget || {}).prototype || {}
const oldEventTargetAddListener = EventTargetPrototype.addEventListener
const oldEventTargetRemoveEventListener = EventTargetPrototype.removeEventListener

const oldEvents: any = EventsKey.reduce((res: any, key: string) => {
  let win = (window as any)[key]
  res[key] = {
    addEventListener: win.prototype.addEventListener,
    removeEventListener: win.prototype.removeEventListener
  }
  return res
}, {})

let oldWinEvents = {
  addEventListener: window.addEventListener,
  removeEventListener: window.removeEventListener
}

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
  tracksMax: number
  logs: any[]
  logsMax: number
  url: string | undefined
  addEventListeners?: {
    [key in string]: any
  }
  eventWeakMap: WeakMap<any, any>
  constructor (
    uid: string,
    url: string | undefined,
    brokeTime: number,
    tracksMax: number,
    logsMax: number,
    hasTrack: boolean = true
  ) {
    this.tracks = []
    this.logs = []
    this.logsMax = logsMax
    this.uid = uid
    this.url = url
    this.trackId = this.trackIdGenerator()
    this.isAddition = false
    this.brokeTime = brokeTime
    this.tracksMax = tracksMax
    this.eventWeakMap = new WeakMap()
    this.hijack()
    this.broke()
    if (hasTrack === true) {
      this.recordTrack()
    }
  }
  getTime () {
    let d = new Date().getTime()
    return d
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
  addTrack (item: ITack) {
    if (this.tracks.length >= this.tracksMax) {
      this.tracks.splice(0, 1)
    }
    this.tracks.push(item)
  }
  report (type: string, data: any, force: boolean = true) {
    if (!this.url) {
      return
    }
    let tracks = this.tracks.slice(
      Math.max(0, this.tracks.length - 50),
      this.tracks.length
    )
    let re = {
      tracks,
      data
    }
    this.logs.push(re)
    if (force === true) {
      report(this.url, this.uid, type, {
        trackId: this.trackId,
        logs: this.logs
      })
    } else if (this.logs.length >= this.logsMax) {
      report(this.url, this.uid, type, {
        trackId: this.trackId,
        logs: this.logs
      })
    }
    this.logs = []
  }
  recordTrack () {
    let self = this
    function mouseEventHandler (type: string) {
      return function (e: MouseEvent) {
        let target = (e.srcElement || e.target) as Node
        if (!target) {
          return
        }
        let time = self.getTime()
        self.addTrack({
          eventType: type,
          time: time,
          userAgent: navigator.userAgent,
          online: navigator.onLine,
          platform: navigator.platform,
          language: navigator.language,
          offsetX: e.offsetX,
          offsetY: e.offsetY,
          screenX: e.screenX,
          screenY: e.screenY,
          scrollX: window.scrollX,
          scrollY: window.screenY,
          pageWidth: document.body.clientWidth,
          pageHeight: document.body.clientHeight,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          uri: location.href,
          referer: document.referrer,
          target: getEl(target),
          paths: domPaths(target)
        })
      }
    }
    window.addEventListener('mousemove', debounce(mouseEventHandler('mousemove')))
    window.addEventListener('click', debounce(mouseEventHandler('click')))
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
      window.addEventListener = oldWinEvents.addEventListener
      window.removeEventListener = oldWinEvents.removeEventListener
    }
  }
  hijackEvent () {
    let self = this
    function addEventListenerFn (old: any) {
      return function (this: any, type: string, listener: any, options: any) {
        if (!listener) {
          return old.call(this, type, listener, options)
        }
        let proxyFn = function (fn: any) {
          return function (...arg: any) {
            try {
              if (!fn) {
                return
              }
              return fn(...arg)
            } catch (error) {
              let time = self.getTime()
              let stack = new Error(`Event ${type} ${time}`).stack
              error.stack = error.stack + '\n' + stack
              self.report('EventError', {
                time: time,
                error: error,
                message: error.message,
                stack: error.stack
              })
            }
          }
        }
        let nListener
        if (listener.handleEvent) {
          nListener = {
            handleEvent: proxyFn(listener.handleEvent)
          }
        }
        if (isFunction(listener)) {
          nListener = proxyFn(listener)
        }

        self.eventWeakMap.set(listener, nListener)

        return old.call(this, type, nListener, options)
      }
    }
    function removeEventListenerFn (old: any) {
      return function (this: any, type: string, listener: any, options: any) {
        if (!listener) {
          return old.call(this, type, listener, options)
        }
        let nListener = self.eventWeakMap.get(listener)
        return old.call(this, type, nListener, options)
      }
    }
    if (window.EventTarget) {
      window.EventTarget.prototype.addEventListener = addEventListenerFn(
        oldEventTargetAddListener
      )
      window.EventTarget.prototype.removeEventListener = removeEventListenerFn(
        oldEventTargetRemoveEventListener
      )
    } else {
      EventsKey.forEach(function (key: string) {
        let win: any = window
        win[key].prototype.addEventListener = addEventListenerFn(
          oldEvents[key].addEventListener
        )
        win[key].prototype.removeEventListener = removeEventListenerFn(
          oldEvents[key].removeEventListener
        )
      })
      window.addEventListener = addEventListenerFn(oldWinEvents.addEventListener)
      window.removeEventListener = removeEventListenerFn(oldWinEvents.removeEventListener)
    }
  }
  broke () {
    let worker = makeWorker(
      function (
        this: Worker,
        obj: { brokeTime: any; url: string; uid: string; href: string; trackId: string }
      ) {
        let pongTimeout: any
        let tracks: any = []
        let pongTimeoutFn = () => {
          return setTimeout(function () {
            request('post', `${obj.url}?d=${Math.random()}`, {
              type: 'crash',
              uid: obj.uid,
              data: JSON.stringify({
                href: obj.href,
                trackId: obj.trackId,
                tracks: tracks
              })
            })
          }, obj.brokeTime)
        }
        let sendPing = () => {
          return setTimeout(() => {
            this.postMessage({
              type: 'ping'
            })
          }, 2000)
        }
        addEventListener('message', e => {
          let data = e.data || {}
          if (data.type === 'pong') {
            tracks = data.tracks
            // console.log('获取pong, 清除超时')
            clearTimeout(pongTimeout)
            sendPing()
            pongTimeout = pongTimeoutFn()
          }
        })
        sendPing()
        pongTimeout = pongTimeoutFn()
      },
      {
        brokeTime: this.brokeTime,
        url: this.url,
        uid: this.uid,
        trackId: this.trackId,
        href: window.location.href
      }
    )

    if (!worker) {
      return
    }
    worker.addEventListener('message', e => {
      if (!worker) return
      let data = e.data || {}
      if (data.type === 'ping') {
        let tracks = this.tracks.slice(
          Math.max(0, this.tracks.length - 50),
          this.tracks.length
        )
        // console.log('获取ping, 返回pong')
        worker.postMessage({
          type: 'pong',
          tracks: tracks
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
    let self = this
    FnKeys.forEach(function (key: string) {
      let win: any = window
      win[key] = function (...arg: any) {
        try {
          return oldFns[key].call(this, ...arg)
        } catch (error) {
          let time = self.getTime()
          let stack = new Error(`ReFn ${key} ${time}`).stack
          error.stack = error.stack + '\n' + stack
          self.report('ReFnError', {
            time: time,
            key: key,
            error: error,
            message: error.message,
            stack: error.stack
          })
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
    let self = this
    this.addEventListeners = this.addEventListeners || {}
    this.addEventListeners['rejectionhandled'] = function (e: PromiseRejectionEvent) {
      let time = self.getTime()
      self.report('RejectionhandledError', {
        time: time,
        error: e.reason
      })
    }
    this.addEventListeners['unhandledrejection'] = function (e: PromiseRejectionEvent) {
      let time = self.getTime()
      self.report('UnhandledrejectionError', {
        time: time,
        error: e.reason
      })
    }
    this.addEventListeners['error'] = function (e: ErrorEvent) {
      let time = self.getTime()
      self.report('WindowError', {
        time: time,
        data: {
          filename: e.filename,
          colno: e.colno,
          lineno: e.lineno,
          message: e.message,
          stack: e.error.stack
        }
      })
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
    let self = this
    window.fetch = function (...arg) {
      return oldFetch
        .call(this, ...arg)
        .then(res => {
          if (!res.ok) {
            // True if status is HTTP 2xx
            // 上报错误
            let time = self.getTime()
            self.report('FetchError', {
              time: time,
              error: res
            })
          }
          return res
        })
        .catch(error => {
          // 上报错误
          let time = self.getTime()
          self.report('FetchCatchError', {
            time: time,
            error: error,
            message: error.message,
            stack: error.stack
          })
          throw error
        })
    }
  }
  hijackXmlHttpRequest () {
    if (!XMLHttpRequest) {
      return
    }
    let self = this
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
        let time = self.getTime()
        self.report('XMLHttpRequestCatchError', {
          time: time,
          error: {
            status: e.target.status,
            statusText: e.target.statusText,
            native: e
          },
          message: e.message,
          stack: e.stack
        })
      })

      xhrInstance.addEventListener('abort', function (e: any) {
        if (e.type === 'abort') {
          xhrInstance._isAbort = true
        }
      })

      this.onreadystatechange = function (...innerArgs) {
        if (xhrInstance.readyState === 4) {
          if (!xhrInstance._isAbort && xhrInstance.status !== 200) {
            let time = self.getTime()
            self.report('XMLHttpRequestError', {
              time: time,
              error: {
                status: xhrInstance.status,
                statusText: xhrInstance.statusText,
                native: xhrInstance
              }
            })
          }
        }
        oldCb && oldCb.apply(this, innerArgs)
      }
      return nativeAjaxSend.apply(this, args)
    }
  }
}
