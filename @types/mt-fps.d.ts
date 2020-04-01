import EventBus from './event.d'
export as namespace MonitorFps
export = MonitorFps

declare class MonitorFps extends EventBus {
  lists: number[]
  lastTime: number
  lastFameTime: number
  frame: number
  count: number
  timer?: number
  timeout?: number
  stoped: boolean
  monitor?: Monitor
  constructor(count: number, timeout: number)
  apply(monitor: Monitor): void
  reportFps(): void
  start(): void
  stop(): void
}
