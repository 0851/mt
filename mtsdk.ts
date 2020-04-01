import 'core-js/es6/weak-map'
import 'core-js/es6/map'

import { subtraction, makeWorker, report } from './src/util'
import { Fps } from './src/fps'
import { setLocalStore } from './src/store'
import EventBus from './src/event'
import { ErrorLog } from './src/errorLog'

const PLUGIN_START = 'plugin:mount'
const PLUGIN_END = 'plugin:mounted'

class Monitor extends EventBus {
  interval: number
  errorRecord: boolean
  fpsRecord: boolean
  performances?: Monitor.IPerformance[]
  plugins: Monitor.MonitorPlugin[]
  fps?: Fps
  uid: string
  report?: string
  errorLog?: ErrorLog
  logsMax: number
  fpsCount: number
  tracksMax: number
  errorDelay: number
  logs: any[]
  constructor (config: Monitor.IConfig) {
    super()
    this.interval = config.interval || 10
    this.errorRecord = config.errorRecord !== undefined ? config.errorRecord : true
    this.fpsRecord = config.fpsRecord !== undefined ? config.fpsRecord : true
    this.report = config.report
    this.plugins = []
    this.logs = []
    this.uid = config.uid
    this.errorDelay = config.errorDelay
    this.tracksMax = config.tracksMax
    this.fpsCount = config.fpsCount
    this.logsMax = config.logsMax
    try {
      this.getPerformance()
      if (this.fpsRecord === true) {
        this.fps = new Fps(config.fpsCount)
      }
      if (this.errorRecord === true) {
        this.errorLog = new ErrorLog(
          config.uid,
          config.report,
          config.errorDelay,
          config.tracksMax,
          config.logsMax
        )
      }
    } catch (error) {
      console.error('monitor error', error)
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
  reportFps () {
    setTimeout(() => {
      if (!this.fps || !this.report) {
        return
      }
      report(this.report, this.uid, 'fps', this.fps.lists)
      this.reportFps()
    }, 10000)
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
      if (!this.report) {
        return
      }
      report(this.report, this.uid, 'performance', perf)
    }
  }
}
export { Monitor }
export default Monitor
