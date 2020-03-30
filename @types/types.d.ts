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
