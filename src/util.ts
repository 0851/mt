export function subtraction (item: any, key1: string, key2: string): number {
  if (
    item[key1] &&
    item[key2] &&
    typeof item[key1] === 'number' &&
    typeof item[key2] === 'number'
  ) {
    return item[key1] - item[key2]
  }
  return 0
}

let EventsKey = ['Document', 'Element', 'Node', 'FileReader', 'XMLHttpRequest']
// 重写事件绑定
let EventTarget = (window.EventTarget || {}).prototype || {}
let oldEventTargetAddListener = EventTarget.addEventListener
let oldEvents: any = EventsKey.reduce((res: any, key: string) => {
  res[key] = (window as any)[key].prototype.addEventListener
  return res
}, {})
let FnKeys = ['setTimeout', 'setInterval', 'requestAnimationFrame']
let oldFn: any = FnKeys.reduce((res: any, key: string) => {
  res[key] = (window as any)[key]
  return res
}, {})
export function addition () {
  if (window.EventTarget) {
    window.EventTarget.prototype.addEventListener = function (type: string, ...arg) {
      let stack = new Error(`Event ${type}`).stack
      try {
        return oldEventTargetAddListener.call(this, type, ...arg)
      } catch (error) {
        error.stack = error.stack + '\n' + stack
        throw error
      }
    }
  } else {
    EventsKey.forEach(function (key: string) {
      let win: any = window
      win[key].prototype.addEventListener = function (type: string, ...arg: any) {
        let stack = new Error(`Event ${type}`).stack

        try {
          return oldEvents[key].call(this, type, ...arg)
        } catch (error) {
          error.stack = error.stack + '\n' + stack
          throw error
        }
      }
    })
  }
  FnKeys.forEach(function (key: string) {
    let win: any = window
    win[key] = function (...arg: any) {
      let stack = new Error(`re Fn ${key}`).stack
      try {
        return oldFn[key].call(this, ...arg)
      } catch (error) {
        error.stack = error.stack + '\n' + stack
        throw error
      }
    }
  })
}

const LocalStoreKey = '__perf_monitor__'

export function getLocalStore (): Monitor.IPerformance[] {
  if (!localStorage) {
    return []
  }
  let res = localStorage.getItem(LocalStoreKey)
  if (!res) {
    return []
  }
  let items: Monitor.IPerformance[]
  try {
    items = JSON.parse(res)
  } catch (error) {
    items = []
  }
  return items
}

export function setLocalStore (
  item: Monitor.IPerformance,
  count: number
): Monitor.IPerformance[] {
  if (!localStorage) {
    return []
  }
  let items = getLocalStore()
  if (!items) {
    items = []
  }
  if (items.length >= count) {
    items.splice(0, 1)
  }
  items.push(item)
  localStorage.setItem(LocalStoreKey, JSON.stringify(items))
  return items
}

export class Fps {
  lists: number[]
  constructor (count: number) {
    let lastTime = performance.now()
    let frame = 0
    let lastFameTime = performance.now()
    this.lists = []
    const loop = () => {
      let now = performance.now()
      let fs = now - lastFameTime
      lastFameTime = now
      let fps = Math.round(1000 / fs)
      frame++
      if (now > 1000 + lastTime) {
        fps = Math.round((frame * 1000) / (now - lastTime))
        frame = 0
        lastTime = now
      }
      if (this.lists.length >= count) {
        this.lists.splice(0, 1)
      }
      this.lists.push(fps)
      window.requestAnimationFrame(loop)
    }
    loop()
  }
}
