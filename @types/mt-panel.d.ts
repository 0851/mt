import EventBus from './event.d'
export as namespace MtPanel
export = MtPanel

declare class MtPanel extends EventBus implements Mt.Plugin {
  constructor(fps?: MtFps)
  apply(monitor: Mt): void
}
