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
  reportTime: number
  sampleTime: number
  stoped: boolean
  monitor?: Mt
  constructor(count?: number, reportTime?: number, sampleTime?: number)
  apply(monitor: Mt): void
  emitFps (): void 
  reportFps(): void
  start(): void
  stop(): void
}
