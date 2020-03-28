import EventBus from '../src/event'
export as namespace Monitor
export = Monitor

declare class Monitor extends EventBus {
  constructor(config: Monitor.IConfig)
  interval: number
  errorRecord: boolean
  fpsRecord: boolean
  fps?: {
    lists: number[]
  }
  performances?: Monitor.IPerformance[]
  getEntriesPerformance(item: PerformanceResourceTiming): Monitor.IPerformanceEntry
  getPerformance(): void
}
declare namespace Monitor {
  export interface IConfig {
    interval?: number
    errorRecord?: boolean
    fpsRecord?: boolean
  }
  export interface MonitorPlugin extends EventBus {
    apply(monitor: Monitor): void
  }
  export interface MonitorPluginConstructable {
    new (): MonitorPlugin
  }
  export interface IPerformance {
    // dns 耗时
    dnstime: number
    // tcp链路消耗时间
    tcptracetime: number
    // request 请求时间从服务器到浏览器时间
    requesttime: number
    // response request 结果内容加载时间
    responsetime: number
    // 总体网络耗时
    allnetworktime: number
    // 解析dom树消耗时间
    domcompiletime: number
    // 白屏时间
    whitetime: number
    // dom树ready的时间
    domreadytime: number
    // onload 的时间
    onloadtime: number
    // cache 耗时
    appcachetime: number
    // 跳转耗时
    redirect: number
    // 重定向次数
    redirectCount?: number
    // 静态资源性能
    entries: IPerformanceEntry[]
    // 原始新能指标对象
    timing: PerformanceTiming
  }

  export interface IPerformanceEntry {
    dnstime: number
    // 请求耗时,从服务器到请求结束
    requesttime: number
    // 返回时间
    responsetime: number
    size: number
    name: string
    // 原始性能指标
    timing: PerformanceEntry
  }
}
