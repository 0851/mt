import EventBus from './event.d'
export as namespace MtError
export = MtError

declare class MtError extends EventBus implements Mt.Plugin {
  tracks: ITack[]
  brokeTimeout: number
  hasTrack: boolean
  logs: any[]
  tracksMax: number
  logsMergeMax: number
  native: any
  worker?: Worker
  monitor?: Mt
  constructor(
    brokeTimeout: number,
    tracksMax: number,
    logsMergeMax: number,
    hasTrack?: boolean
  )
  apply(monitor: Mt): void
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
