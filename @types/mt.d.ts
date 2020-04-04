import EventBus from './event.d'
export as namespace Mt
export = Mt

declare class Mt extends EventBus {
  constructor(config: Mt.IConfig)
  product: string
  uid: string
  reportUrl?: string
  performance?: Mt.IPerformance
  getEntriesPerformance(item: PerformanceResourceTiming): Mt.IPerformanceEntry
  getPerformance(): void
  plugin(plugin: Mt.Plugin): Mt
  getTime(): number
  run(): void
  trackId: string
  trackIdGenerator(): void
  report(type: string, data: any): void
  [key: string]: any
}
declare namespace Mt {
  export interface IConfig {
    reportUrl?: string
    product: string
    uid: string
  }
  export interface Plugin extends EventBus {
    apply(monitor: Mt): void
  }
  export interface PluginConstructable {
    new (): Plugin
  }
  export interface INetworkPerformance {
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
    // 跳转耗时
    redirect: number
  }
  export interface IPerformance extends INetworkPerformance {
    // 解析dom树消耗时间
    domcompiletime: number
    // 完全白屏时间
    whitetime: number
    // dom树ready的时间
    domreadytime: number
    // onload 的时间
    onloadtime: number
    // cache 耗时
    appcachetime: number
    // 重定向次数
    redirectCount?: number
    // 静态资源性能
    entries: IPerformanceEntry[]
    // 原始新能指标对象
    timing: PerformanceTiming
  }

  export interface IPerformanceEntry extends INetworkPerformance {
    size: number
    name: string
    // 原始性能指标
    timing: PerformanceEntry
  }
}
