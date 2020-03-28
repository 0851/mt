import EventBus from '../src/event'

export as namespace MonitorPanel
export = MonitorPanel

declare class MonitorPanel extends EventBus {
  apply(monitor: Monitor): void
}
