import EventBus from './event.d'
export as namespace MonitorPanel
export = MonitorPanel

declare class MonitorPanel extends EventBus {
  constructor(fps?: MonitorFps, err?: MonitorError)
  apply(monitor: Monitor): void
}
