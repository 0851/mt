import 'core-js/es6/weak-map'
import 'core-js/es6/map'
import EventBus from './event'
import { debounce, domPaths, getEl, makeWorker, request, isFunction } from './src/util'

class MtError extends EventBus implements Mt.Plugin {
  tracks: ITack[] = []
  brokeTimeout: number
  hasTrack: boolean
  logs: {
    high: IReport[]
    medium: IReport[]
    low: IReport[]
    requestTime: IReport[]
  } = {
    high: [],
    medium: [],
    low: [],
    requestTime: []
  }
  tracksCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  requestTimeCount: number
  native: any
  worker?: Worker
  monitor?: Mt
  config: MtError.IConfig
  consoleErr: boolean
  constructor (config: MtError.IConfig) {
    super()
    this.tracks = []
    this.highCount = config.highCount === undefined ? 10 : config.highCount
    this.mediumCount = config.mediumCount === undefined ? 100 : config.mediumCount
    this.lowCount = config.lowCount === undefined ? 500 : config.lowCount
    this.requestTimeCount = config.requestTimeCount === undefined ? 500 : config.requestTimeCount
    this.hasTrack = config.hasTrack === undefined ? true : config.hasTrack
    this.brokeTimeout = config.brokeTimeout === undefined ? 5000 : config.brokeTimeout
    this.tracksCount = config.tracksCount === undefined ? 2000 : config.tracksCount
    this.consoleErr = config.consoleErr === undefined ? true : config.consoleErr
    this.config = config
    this.native = this.native || {}
  }
  apply (monitor: Mt): void {
    this.monitor = monitor
    try {
      this.hijack()
      this.broke()
      if (this.hasTrack === true) {
        this.recordTrack()
      }
    } catch (error) {
      console.error(`error log`, error)
    }
  }
  broke () {
    let self = this
    if (!self.monitor) return
    if (self.worker) return
    self.worker = makeWorker(
      function (
        this: Worker,
        obj: {
          brokeTime: any
          url: string
          uid: string
          product: string
          href: string
          trackId: string
        }
      ) {
        let pongTimeout: any
        let tracks: any = []
        let pongTimeoutFn = () => {
          return setTimeout(function () {
            request(
              'post',
              `${obj.url}?d=${Math.random()}`,
              {
                type: 'crash',
                uid: obj.uid,
                product: obj.product,
                data: JSON.stringify({
                  href: obj.href,
                  trackId: obj.trackId,
                  tracks: tracks
                })
              },
              3
            )
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
        brokeTime: this.brokeTimeout,
        url: this.monitor?.reportUrl,
        uid: this.monitor?.uid,
        product: this.monitor?.product,
        trackId: this.monitor?.trackId,
        href: window.location.href
      }
    )
    if (!self.worker) return
    self.worker.addEventListener('message', e => {
      try {
        if (!self.worker) return
        let data = e.data || {}
        if (data.type === 'ping') {
          let tracks = self.tracks.slice(
            Math.max(0, self.tracks.length - 50),
            self.tracks.length
          )
          // console.log('获取ping, 返回pong')
          self.worker.postMessage({
            type: 'pong',
            tracks: tracks
          })
        }
      } catch (error) {
        console.error('worker message error', error)
      }
    })
  }
  addTrack (item: ITack) {
    if (this.tracks.length >= this.tracksCount) {
      this.tracks.splice(0, 1)
    }
    this.tracks.push(item)
  }
  limitReport (
    key: 'high' | 'medium' | 'low' | 'requestTime',
    countKey: 'highCount' | 'mediumCount' | 'lowCount' | 'requestTimeCount',
    type: IReportType,
    payload: IErrorReport | IRequestTime
  ) {
    if (!this.monitor) return
    this.logs[key] = Array.isArray(this.logs[key]) ? this.logs[key] : []
    if (this.logs[key].length <= this[countKey]) {
      this.logs[key].push({
        type: type,
        payload: payload
      })
    } else {
      this.monitor?.report(this.logs[key])
      this.logs[key] = []
    }
  }
  reportError (
    type: IReportType,
    level: number,
    time: number,
    error: Error,
    source?: IErrorReportSource
  ) {
    if (!this.monitor) return
    let tracks = this.tracks.slice(
      Math.max(0, this.tracks.length - 50),
      this.tracks.length
    )
    let e: IErrorReport = {
      level,
      time,
      message: error.message,
      stack: error.stack,
      tracks,
      source
    }
    this.emit('err:logs', e)
    switch (level) {
      // 严重
      case 0:
        this.monitor?.report({
          type: type,
          payload: e
        })
        break
      // 高
      case 1:
        this.limitReport('high', 'highCount', type, e)
        break
      // 中
      case 2:
        this.limitReport('medium', 'mediumCount', type, e)
        break
      // 低
      case 3:
        this.limitReport('low', 'lowCount', type, e)
        break
    }
  }
  recordTrack () {
    let self = this
    if (!self.monitor) return
    function mouseEventHandler (type: string) {
      return function (e: MouseEvent) {
        try {
          if (!self.monitor) return
          let target = (e.srcElement || e.target) as Node
          if (!target) {
            return
          }
          let time = self.monitor.getTime()
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
        } catch (error) {
          console.error(`mouseEventHandler ${type} error`, error)
        }
      }
    }
    window.addEventListener('mousemove', debounce(mouseEventHandler('mousemove')))
    window.addEventListener('click', debounce(mouseEventHandler('click')))
  }
  unHijack () {
    if (this.native) {
      return
    }
    this.unHijackGlobalError()
    this.unHijackEvent()
    this.unHijackFn()
    this.unHijackXmlHttpRequest()
    this.unHijackFetch()
    this.unHijackConsoleError()
    this.unHijackVueError()
  }
  hijack () {
    if (!this.native) {
      return
    }
    this.hijackGlobalError()
    this.hijackEvent()
    this.hijackFn()
    this.hijackXmlHttpRequest()
    this.hijackFetch()
    this.hijackConsoleError()
    this.hijackVueError()
  }
  unHijackConsoleError () {
    let self = this
    setTimeout(function () {
      if (!self.native.consoleError) {
        return
      }
      console.error = self.native.consoleError
    }, 1)
  }
  hijackConsoleError () {
    let self = this
    setTimeout(function () {
      self.native.consoleError = console.error
      console.error = function (...arg: any[]) {
        self.native.consoleError.call(this, ...arg)
      }
    }, 0)
  }
  unHijackVueError () {
    let self = this
    setTimeout(function () {
      if (!self.native.vueErrorHandler || self.config.vue === undefined) {
        return
      }
    }, 1)
  }
  hijackVueError () {
    let self = this
    if (self.config.vue === undefined) return
    setTimeout(function () {
      if (self.config.vue === undefined) return
      self.native.vueErrorHandler = self.config.vue.config.errorHandler
      self.config.vue.config.errorHandler = function (err: Error, vm: Vue, info: string) {
        console.log(err)
      }
    }, 0)
  }
  private addEventListenerFn (old: any, weakmap: WeakMap<any, any>) {
    let self = this
    return function (this: any, type: string, listener: any, options: any) {
      let eventListenerProxyFn = function (fn: any) {
        return function (...arg: any) {
          try {
            if (!fn) {
              return
            }
            return fn(...arg)
          } catch (error) {
            if (!self.monitor) return
            let time = self.monitor.getTime()
            let stack = new Error(`Event ${type} ${time}`).stack
            error.stack = stack + '\n' + error.stack
            throw error
          }
        }
      }
      if (!listener) {
        return old.call(this, type, listener, options)
      }
      let nListener
      if (listener.handleEvent) {
        nListener = {
          handleEvent: eventListenerProxyFn(listener.handleEvent)
        }
      }
      if (isFunction(listener)) {
        nListener = eventListenerProxyFn(listener)
      }
      if (nListener) {
        weakmap.set(listener, nListener)
        return old.call(this, type, nListener, options)
      } else {
        return old.call(this, type, listener, options)
      }
    }
  }
  private removeEventListenerFn (old: any, weakmap: WeakMap<any, any>) {
    return function (this: any, type: string, listener: any, options: any) {
      let nListener = weakmap.get(listener)
      if (!nListener) {
        return old.call(this, type, listener, options)
      }
      return old.call(this, type, nListener, options)
    }
  }
  unHijackEvent () {
    let self = this
    if (window.EventTarget) {
      if (!self.native.eventTarget) return
      window.EventTarget.prototype.addEventListener = self.native.eventTarget.get(
        'addEventListener'
      )
      window.EventTarget.prototype.removeEventListener = self.native.eventTarget.get(
        'removeEventListener'
      )
    } else {
      if (!self.native.events) return
      self.native.events.forEach(function (value: any, key: string) {
        (window as any)[key].prototype.addEventListener = value.addEventListener
        ;(window as any)[key].prototype.removeEventListener = value.removeEventListener
      })
      if (!self.native.winEvent) return
      self.native.winEvent.forEach(function (value: any, key: string) {
        (window as any)[key] = value
      })
    }
  }
  hijackEvent () {
    let self = this
    self.native.eventListeners = self.native.eventListeners || new WeakMap()
    if (window.EventTarget) {
      if (self.native.eventTarget) return
      self.native.eventTarget = new Map()
      self.native.eventTarget.set(
        'addEventListener',
        window.EventTarget.prototype.addEventListener
      )
      self.native.eventTarget.set(
        'removeEventListener',
        window.EventTarget.prototype.removeEventListener
      )
      window.EventTarget.prototype.addEventListener = self.addEventListenerFn(
        window.EventTarget.prototype.addEventListener,
        self.native.eventListeners
      )
      window.EventTarget.prototype.removeEventListener = self.removeEventListenerFn(
        window.EventTarget.prototype.removeEventListener,
        self.native.eventListeners
      )
    } else {
      let eventsKeys: string[] = ['Document', 'Element', 'Node', 'FileReader']
      if (self.native.events) return
      self.native.events = new Map()
      eventsKeys.forEach(function (key: string) {
        if (!(window as any)[key]) return
        self.native.events.set(key, {
          addEventListener: (window as any)[key].prototype.addEventListener,
          removeEventListener: (window as any)[key].prototype.removeEventListener
        })
        ;(window as any)[key].prototype.addEventListener = self.addEventListenerFn(
          (window as any)[key].prototype.addEventListener,
          self.native.eventListeners
        )
        ;(window as any)[key].prototype.removeEventListener = self.removeEventListenerFn(
          (window as any)[key].prototype.removeEventListener,
          self.native.eventListeners
        )
      })
      if (self.native.winEvent) return
      self.native.winEvent = new Map()
      self.native.winEvent.set('addEventListener', window.addEventListener)
      self.native.winEvent.set('removeEventListener', window.removeEventListener)

      window.addEventListener = self.addEventListenerFn(
        window.addEventListener,
        self.native.eventListeners
      )
      window.removeEventListener = self.removeEventListenerFn(
        window.removeEventListener,
        self.native.eventListeners
      )
    }
  }
  unHijackFn () {
    let self = this
    if (!self.native.fns) return
    self.native.fns.forEach(function (value: any, key: string) {
      (window as any)[key] = value
    })
  }
  hijackFn () {
    let self = this
    if (self.native.fns) return
    let fnKeys = ['setTimeout', 'setInterval', 'requestAnimationFrame']
    self.native.fns = new Map()
    fnKeys.forEach(function (key: string) {
      let fn = (window as any)[key]
      if (!fn) return
      self.native.fns.set(key, fn)
      ;(window as any)[key] = function (...arg: any) {
        try {
          return fn.call(this, ...arg)
        } catch (error) {
          if (!self.monitor) return
          let time = self.monitor.getTime()
          let stack = new Error(`ReFnError ${key} ${time}`).stack
          error.stack = stack + '\n' + error.stack
          throw error
        }
      }
    })
  }
  unHijackGlobalError () {
    let self = this
    if (!self.native.globalErrorListeners) {
      return
    }
    window.removeEventListener(
      'rejectionhandled',
      self.native.globalErrorListeners.get('rejectionhandled'),
      true
    )
    window.removeEventListener(
      'unhandledrejection',
      self.native.globalErrorListeners.get('unhandledrejection'),
      true
    )
    setTimeout(function () {
      let onerror = self.native.globalErrorListeners.get('onerror')
      window.onerror = onerror
    }, 1)
  }
  hijackGlobalError () {
    let self = this
    if (self.native.globalErrorListeners) {
      return
    }
    self.native.globalErrorListeners = self.native.globalErrorListeners || new Map()
    self.native.globalErrorListeners.set('rejectionhandled', function (
      e: PromiseRejectionEvent
    ) {
      if (!self.monitor) return
      let time = self.monitor.getTime()
      self.report('RejectionhandledError', {
        time: time,
        error: e.reason
      })
    })
    self.native.globalErrorListeners.set('unhandledrejection', function (
      e: PromiseRejectionEvent
    ) {
      if (!self.monitor) return

      let time = self.monitor.getTime()
      self.report('UnhandledrejectionError', {
        time: time,
        error: e.reason
      })
    })

    window.addEventListener(
      'rejectionhandled',
      self.native.globalErrorListeners.get('rejectionhandled'),
      true
    )
    window.addEventListener(
      'unhandledrejection',
      self.native.globalErrorListeners.get('unhandledrejection'),
      true
    )
    setTimeout(function () {
      self.native.globalErrorListeners.set('onerror', window.onerror)
      window.onerror = function (
        event: Event | string,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error
      ) {
        if (!self.monitor) return
        let time = self.monitor.getTime()
        let message: any = event || error?.message
        let stack: any = error?.stack || ''
        try {
          let onerror = self.native.globalErrorListeners.get('onerror')
          if (isFunction(onerror)) {
            onerror(event, source, lineno, colno, error)
          }
        } catch (e) {
          if (e.stack) {
            stack = e.stack + '\n' + stack
          }
        }
        self.report('WindowError', {
          time: time,
          data: {
            source: source,
            colno: colno,
            lineno: lineno,
            message: message,
            stack: stack
          }
        })
      }
    }, 0)
  }
  unHijackXmlHttpRequest () {
    let self = this
    if (!self.native.xhr) {
      return
    }
    XMLHttpRequest.prototype.open = self.native.xhr.get('open')
    XMLHttpRequest.prototype.send = self.native.xhr.get('send')
  }
  hijackXmlHttpRequest () {
    let self = this
    if (!XMLHttpRequest) {
      return
    }
    if (self.native.xhr) return
    self.native.xhr = new Map()
    let XMLHttpRequestPrototype = XMLHttpRequest.prototype as any
    self.native.xhr.set('open', XMLHttpRequest.prototype.open)
    self.native.xhr.set('send', XMLHttpRequest.prototype.send)

    XMLHttpRequestPrototype.stopLog = function () {
      const xhrInstance: any = this
      xhrInstance._stopLog = true
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
      return self.native.xhr
        .get('open')
        .call(xhrInstance, mothod, url, async as any, username, password)
    }

    XMLHttpRequest.prototype.send = function (...args) {
      const oldCb = this.onreadystatechange
      const xhrInstance: any = this

      xhrInstance.addEventListener('error', function (e: any) {
        if (xhrInstance._stopLog === true) return
        if (!self.monitor) return
        let time = self.monitor.getTime()
        self.report('XMLHttpRequestCatchError', {
          time: time,
          error: {
            status: xhrInstance.status,
            statusText: xhrInstance.statusText,
            native: xhrInstance
          }
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
            if (xhrInstance._stopLog === true) return
            if (!self.monitor) return
            let time = self.monitor.getTime()
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
      return self.native.xhr.get('send').apply(this, args)
    }
  }
  unHijackFetch () {
    let self = this
    if (!self.native.fetch) {
      return
    }
    window.fetch = self.native.fetch
  }
  hijackFetch () {
    let self = this
    if (!window.fetch) return
    if (self.native.fetch) return
    self.native.fetch = window.fetch
    window.fetch = function (...arg) {
      return self.native.fetch
        .call(this, ...arg)
        .then((res: any) => {
          if (!res.ok) {
            // True if status is HTTP 2xx
            // 上报错误
            if (!self.monitor) return
            let time = self.monitor.getTime()
            self.report('FetchError', {
              time: time,
              error: res
            })
          }
          return res
        })
        .catch((error: any) => {
          // 上报错误
          if (!self.monitor) return
          let time = self.monitor.getTime()
          let stack = new Error(`FetchCatchError ${time}`).stack
          error.stack = stack + '\n' + error.stack
          throw error
        })
    }
  }
}
export { MtError }
export default MtError
