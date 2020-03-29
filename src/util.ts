export function subtraction (item: any, key1: string, key2: string): number {
  if (
    item[key1] &&
    item[key2] &&
    typeof item[key1] === 'number' &&
    typeof item[key2] === 'number'
  ) {
    return item[key1] - item[key2]
  }
  return 0
}
export function debounce (
  func: (...args: any) => any,
  wait: number = 150,
  immediate: boolean = true
) {
  let timeout: number | null
  let result: any
  let stop = false

  let debounced: any = function (this: any, ...args: any) {
    let context = this
    if (timeout) {
      window.clearTimeout(timeout)
    }
    if (stop === true) {
      return
    }
    if (immediate) {
      // 如果已经执行过，不再执行
      let callNow = !timeout
      timeout = window.setTimeout(function () {
        if (timeout) {
          window.clearTimeout(timeout)
        }
        timeout = null
      }, wait)
      if (callNow) {
        result = func.call(context, ...args)
      }
    } else {
      timeout = window.setTimeout(function () {
        func.call(context, ...args)
      }, wait)
    }
    return result
  }

  debounced.cancel = function () {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = null
  }
  debounced.stop = function () {
    if (timeout) {
      window.clearTimeout(timeout)
    }
    timeout = null
    stop = true
  }
  return debounced
}

export function domPaths (dom: Node): IElement[] {
  let stack = [dom]
  let res: IElement[] = []
  while (stack.length > 0) {
    let d = stack.shift()
    if (!d) {
      break
    }
    let el = d as Element
    let tag = el.tagName || el.nodeName
    let id = el.id
    let className = el.className
    let attr = Object.keys(el.attributes || {}).reduce((res: any, key: any) => {
      let item = el.attributes[key]
      res.push(`${item.name}:${item.value}`)
      return res
    }, [])
    res.push({
      tag: tag,
      className: className,
      id: id,
      attr: attr.join(';')
    })
    if (d.parentNode) {
      stack.push(d.parentNode)
    }
  }
  return res
}
