import EventBus from './event.d'
export as namespace MonitorError
export = MonitorError

declare class MonitorError extends EventBus {
  tracks: ITack[]
  brokeTimeout: number
  hasTrack: boolean
  logs: any[]
  tracksMax: number
  logsMergeMax: number
  native: any
  worker?: Worker
  monitor?: Monitor
  constructor(
    brokeTimeout: number,
    tracksMax: number,
    logsMergeMax: number,
    hasTrack?: boolean
  )
  apply(monitor: Monitor): void
  broke(): void
  addTrack(item: ITack): void
  report(type: string, data: any, force?: boolean): void
  recordTrack(): void
  unHijack(): void
  hijack(): void
  unHijackEvent(): void
  hijackEvent(): void
  unHijackFn(): void
  hijackFn(): void
  unHijackGlobalError(): void
  hijackGlobalError(): void
  unHijackXmlHttpRequest(): void
  hijackXmlHttpRequest(): void
  unHijackFetch(): void
  hijackFetch(): void
}
