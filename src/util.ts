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

  let debounced: any = function (this: any, ...args: any) {
    let context = this
    if (timeout) {
      window.clearTimeout(timeout)
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
        return func.call(context, ...args)
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

  return debounced
}
