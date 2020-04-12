import { subtraction, report, getTime, isReady } from './src/util'
// import { setLocalStore } from './src/store'
import EventBus from './event'

const PLUGIN_START = 'plugin:mount'
const PLUGIN_END = 'plugin:mounted'

class Mt extends EventBus {
  performance?: Mt.IPerformance
  plugins: Mt.Plugin[]
  uid: string
  product: string
  trackId: string
  reportUrl?: string
  constructor (config: Mt.IConfig) {
    super()
    this.reportUrl = config.reportUrl
    this.plugins = []
    this.uid = config.uid
    this.product = config.product
    this.trackId = this.trackIdGenerator()
  }
  trackIdGenerator () {
    let d = this.getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0
      d = Math.floor(d / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    return uuid
  }
  plugin (plugin: Mt.Plugin): Mt {
    this.plugins.push(plugin)
    return this
  }
  getTime = getTime
  report (data: IReport | IReport[]) {
    if (!this.reportUrl) return
    report(this.reportUrl, this.product, this.uid, data)
  }
  run () {
    isReady(() => {
      let plugins = this.plugins
      try {
        this.getPerformance()
      } catch (error) {
        console.error('monitor error', error)
      }
      plugins.forEach(plugin => {
        plugin.emit(PLUGIN_START, this)
        plugin.apply(this)
        plugin.emit(PLUGIN_END, this)
      })
    })
  }
  getEntriesPerformance (item: PerformanceResourceTiming): Mt.IPerformanceEntry {
    return {
      name: item.name,
      dnstime: subtraction(item, 'domainLookupEnd', 'domainLookupStart'),
      tcptracetime: subtraction(item, 'connectEnd', 'connectStart'),
      requesttime: subtraction(item, 'responseStart', 'requestStart'),
      responsetime: subtraction(item, 'responseEnd', 'responseStart'),
      allnetworktime: subtraction(item, 'responseEnd', 'fetchStart'),
      redirect: subtraction(item, 'redirectEnd', 'redirectStart'),
      size: item.transferSize,
      timing: item
    }
  }
  getPerformance (): void {
    let performance = window.performance
    if (performance) {
      let timing = performance.timing
      let navigation = performance.navigation
      let entriesItems = performance.getEntries()
      let entries: Mt.IPerformanceEntry[] = entriesItems
        .filter(item => {
          return item.entryType === 'resource'
        })
        .map(item => {
          return this.getEntriesPerformance(item as PerformanceResourceTiming)
        })
      let perf: Mt.IPerformance = {
        dnstime: subtraction(timing, 'domainLookupEnd', 'domainLookupStart'),
        tcptracetime: subtraction(timing, 'connectEnd', 'connectStart'),
        requesttime: subtraction(timing, 'responseStart', 'requestStart'),
        responsetime: subtraction(timing, 'responseEnd', 'responseStart'),
        allnetworktime: subtraction(timing, 'responseEnd', 'fetchStart'),
        redirect: subtraction(timing, 'redirectEnd', 'redirectStart'),
        domcompiletime: subtraction(timing, 'domComplete', 'domInteractive'),
        whitetime: subtraction(timing, 'domLoading', 'navigationStart'),
        domreadytime: subtraction(timing, 'domContentLoadedEventEnd', 'fetchStart'),
        onloadtime: subtraction(timing, 'loadEventEnd', 'navigationStart'),
        appcachetime: subtraction(timing, 'domainLookupStart', 'fetchStart'),
        redirectCount: navigation && navigation.redirectCount,
        entries: entries,
        timing: timing
      }
      this.performance = perf
      this.report({
        type: 'performance',
        payload: perf
      })
    }
  }
}
export { Mt }
export default Mt
