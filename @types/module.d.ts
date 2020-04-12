declare module '*.pug'
declare module '*.styl'

interface IElement {
  tag: string
  className?: string
  id?: string
  attr?: string
}
interface ITack {
  eventType: string
  // 收集时间
  time: number
  // 用户代理
  userAgent: string
  // 网络状态
  online: boolean
  // 平台
  platform: string
  // 语言
  language: string
  // 鼠标所在位置
  offsetX: number
  offsetY: number
  screenX: number
  screenY: number
  scrollX: number
  scrollY: number
  // 页面宽度
  pageWidth: number
  // 页面高度
  pageHeight: number
  windowWidth: number
  windowHeight: number
  // 屏幕宽度
  screenWidth: number
  // 屏幕高度
  screenHeight: number
  // 所在页面地址
  uri: string
  // 来源地址
  referer?: string
  target: IElement
  paths: IElement[]
}

type IReportType =
  | 'fps'
  | 'performance'
  | 'windowError'
  | 'rejectionError'
  | 'unHandledRejectionError'
  | 'xhrError'
  | 'xhrCatchError'
  | 'fetchError'
  | 'fetchCatchError'
  | 'consoleError'
  | 'vueError'
  | 'requestTime'
  | 'custom'

interface IFpsReport {
  fps: number[]
}
interface IPerformanceReport extends Mt.IPerformance {}
interface IErrorReportSource {
  filename?: string
  colno: number
  lineno: number
}
interface IErrorReport {
  // 0-3, 0为严重,1高,2中,3低
  level: number
  time: number
  message: string
  stack?: string
  tracks?: ITack[]
  source?: IErrorReportSource
}

interface IWindowErrorReport extends IErrorReport {}
interface IRejectionErrorReport extends IErrorReport {}
interface IUnHandledRejectionErrorReport extends IErrorReport {}
interface IXhrCatchErrorReport extends IErrorReport {}
interface IVueErrorReport extends IErrorReport {}
interface IConsoleErrorReport extends IErrorReport {}
interface IFetchCatchErrorReport extends IErrorReport {}
interface IXhrErrorReport extends IErrorReport {}
interface IFetchErrorReport extends IErrorReport {}

interface IRequestTime {
  startTime: number
  endTime: number
  time: number
  path: string
}

type IReportPayload =
  | IFpsReport
  | IPerformanceReport
  | IWindowErrorReport
  | IRejectionErrorReport
  | IUnHandledRejectionErrorReport
  | IXhrErrorReport
  | IXhrCatchErrorReport
  | IFetchErrorReport
  | IFetchCatchErrorReport
  | IConsoleErrorReport
  | IVueErrorReport
  | IRequestTime
  | any

interface IReport {
  type: IReportType
  payload: IReportPayload
}
