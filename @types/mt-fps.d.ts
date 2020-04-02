import EventBus from './event.d'
export as namespace MtFps
export = MtFps

declare class MtFps extends EventBus implements Mt.Plugin {
  lists: number[]
  lastTime: number
  lastFameTime: number
  frame: number
  count: number
  timer?: number
  timeout?: number
  stoped: boolean
  monitor?: Mt
  constructor(count: number, timeout: number)
  apply(monitor: Mt): void
  reportFps(): void
  start(): void
  stop(): void
}
