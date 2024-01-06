import EventBus from './event.d'
import { VueConstructor } from 'vue'
export as namespace MtError
export = MtError

declare class MtError extends EventBus implements Mt.Plugin {
  tracks: ITack[]
  brokeTimeout: number
  hasTrack: boolean
  logs: {
    top: IReport[]
    high: IReport[]
    medium: IReport[]
    low: IReport[]
    requestTime: IReport[]
  }
  tracksCount: number
  highCount: number
  mediumCount: number
  lowCount?: number
  requestTimeCount?: number
  native: any
  worker?: Worker
  monitor?: Mt
  config: MtError.IConfig
  consoleErr: boolean
  constructor(config?: MtError.IConfig)
  apply(monitor: Mt): void
  broke(): void
  limitReport (
    key: MtError.logType,
    countKey: MtError.logCountType,
    type: IReportType,
    payload: IErrorReport | IRequestTime
  ): void 
  forceReport (type?: MtError.logType): void 
  reportError (
    type: IReportType,
    level: number,
    time: number,
    error: Error,
    source?: IErrorReportSource
  ): void
  addTrack(item: ITack): void
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
declare namespace MtError {
  export interface IConfig {
    brokeTimeout?: number
    tracksCount?: number
    highCount?: number
    mediumCount?: number
    requestTimeCount?: number
    lowCount?: number
    hasTrack?: boolean
    consoleErr?: boolean
    vue?: VueConstructor
  }
  export type logType = 'high' | 'medium' | 'low' | 'requestTime'
  export type logCountType = 'highCount' | 'mediumCount' | 'lowCount' | 'requestTimeCount'
}
