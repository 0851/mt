class EventBus {
  private events: {
    [key: string]: any
  }
  constructor () {
    this.events = {}
  }

  on (type: string, handler: any, once?: boolean) {
    if (!handler) {
      throw new ReferenceError('handler not defined')
    }

    if (!this.events[type]) {
      this.events[type] = []
    }

    if (once) {
      handler.once = once
    }

    this.events[type].push(handler)
    return this
  }

  once (type: string, handler: any) {
    return this.on(type, handler, true)
  }

  off (type: string, handler: any) {
    if (!this.events[type]) {
      return this
    }

    if (!handler) {
      throw new ReferenceError('handler not defined')
    }

    if (handler === '*') {
      delete this.events[type]
      return this
    }

    const handlers = this.events[type]

    while (handlers.includes(handler)) {
      handlers.splice(handlers.indexOf(handler), 1)
    }

    if (handlers.length < 1) {
      delete this.events[type]
    }

    return this
  }

  emit (type: string, ...args: any) {
    let emit = (type: string, ...args: any) => {
      if (!this.events['*']) {
        return this
      }

      const catchAll = this.events['*']

      for (let handler of catchAll) {
        handler.call(this, type, ...args)
      }

      return this
    }
    if (!this.events[type]) {
      return emit(type, ...args)
    }

    const handlers = this.events[type]
    const onceHandled = []

    for (let handler of handlers) {
      handler.apply(this, args)
      if (handler.once) {
        onceHandled.push(handler)
      }
    }

    for (let handler of onceHandled) {
      this.off(type, handler)
    }

    return emit(type, ...args)
  }
}

export { EventBus }
export default EventBus
