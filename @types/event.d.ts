export as namespace EventBus
export = EventBus

declare class EventBus {
  on(type: string, handler: any, once?: boolean): void
  once(type: string, handler: any): void
  off(type: string, handler: any): void
  emit(type: string, ...args: any): void
}
