import { subtraction } from './src/util'
import { Fps } from './src/fps'
import { setLocalStore } from './src/store'
import EventBus from './src/event'
import { ErrorLog } from './src/errorLog'

const PLUGIN_START = 'plugin:start'
const PLUGIN_END = 'plugin:end'
const PLUGIN_REMOVE = 'plugin:remove'
const PLUGIN_REMOVED = 'plugin:removed'

class Monitor extends EventBus {
  interval: number
  errorRecord: boolean
  fpsRecord: boolean
  performances?: Monitor.IPerformance[]
  plugins: Monitor.MonitorPlugin[]
  fps?: Fps
  errorLog?: ErrorLog
  constructor (config: Monitor.IConfig) {
    super()
    this.interval = config.interval || 10
    this.errorRecord = config.errorRecord !== undefined ? config.errorRecord : true
    this.fpsRecord = config.fpsRecord !== undefined ? config.fpsRecord : true
    this.plugins = []
    this.getPerformance()
    if (this.fpsRecord === true) {
      this.fps = new Fps(30)
    }
    if (this.errorRecord === true) {
      this.errorLog = new ErrorLog('asd', 5000)
    }
  }
  plugin (plugin: Monitor.MonitorPlugin) {
    this.plugins.push(plugin)
  }
  run () {
    let plugins = this.plugins
    plugins.forEach(plugin => {
      plugin.emit(PLUGIN_START, this)
      plugin.apply(this)
      plugin.emit(PLUGIN_END, this)
    })
  }
  getEntriesPerformance (item: PerformanceResourceTiming): Monitor.IPerformanceEntry {
    return {
      name: item.name,
      dnstime: subtraction(item, 'domainLookupEnd', 'domainLookupStart'),
      requesttime: subtraction(item, 'responseStart', 'requestStart'),
      responsetime: subtraction(item, 'responseEnd', 'responseStart'),
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
      let entries: Monitor.IPerformanceEntry[] = entriesItems
        .filter(item => {
          return item.entryType === 'resource'
        })
        .map(item => {
          return this.getEntriesPerformance(item as PerformanceResourceTiming)
        })
      let perf: Monitor.IPerformance = {
        dnstime: subtraction(timing, 'domainLookupEnd', 'domainLookupStart'),
        tcptracetime: subtraction(timing, 'connectEnd', 'connectStart'),
        requesttime: subtraction(timing, 'responseStart', 'requestStart'),
        responsetime: subtraction(timing, 'responseEnd', 'responseStart'),
        allnetworktime: subtraction(timing, 'responseEnd', 'navigationStart'),
        domcompiletime: subtraction(timing, 'domComplete', 'domInteractive'),
        whitetime: subtraction(timing, 'domLoading', 'navigationStart'),
        domreadytime: subtraction(timing, 'domContentLoadedEventEnd', 'navigationStart'),
        onloadtime: subtraction(timing, 'loadEventEnd', 'navigationStart'),
        appcachetime: subtraction(timing, 'domainLookupStart', 'fetchStart'),
        redirect: subtraction(timing, 'redirectEnd', 'redirectStart'),
        redirectCount: navigation && navigation.redirectCount,
        entries: entries,
        timing: timing
      }
      this.performances = setLocalStore(perf, this.interval)
    }
  }
}
export { Monitor }
export default Monitor
