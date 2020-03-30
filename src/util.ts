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
export function getEl (d: Node): IElement {
  let el = d as Element
  let tag = el.tagName || el.nodeName
  let id = el.id
  let className = el.className
  let attr = Object.keys(el.attributes || {}).reduce((res: any, key: any) => {
    let item = el.attributes[key]
    res.push(`${item.name}:${item.value}`)
    return res
  }, [])
  return {
    tag: tag,
    className: className,
    id: id,
    attr: attr.join(';')
  }
}
export function domPaths (dom: Node): IElement[] {
  let stack = [dom]
  let res: IElement[] = []
  while (stack.length > 0) {
    let d = stack.shift()
    if (!d) {
      break
    }
    res.push(getEl(d))
    if (d.parentNode) {
      stack.push(d.parentNode)
    }
  }
  return res
}

export function request (
  method: string,
  url: string,
  data: any,
  callback?: any,
  failed?: any
) {
  function createCORSRequest (method: string, url: string): XMLHttpRequest | null {
    let xhr2: XMLHttpRequest | null = new XMLHttpRequest()
    if ('withCredentials' in xhr2) {
      xhr2.open(method, url, false)
    } else if (typeof (window as any).XDomainRequest !== 'undefined') {
      xhr2 = new (window as any).XDomainRequest() as XMLHttpRequest
      xhr2.open(method, url)
    } else {
      xhr2 = null
    }
    return xhr2
  }
  let xhr = new XMLHttpRequest()
  // let xhr = createCORSRequest(method, url)
  xhr.open(method, url, true)
  xhr.withCredentials = false
  if (!xhr) {
    throw new Error('CORS not supported')
  }
  xhr.onreadystatechange = () => {
    try {
      if (!xhr) {
        return
      }
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.responseText)
          callback && callback(res)
        } else {
          failed && failed(xhr.status)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
  // xhr.setRequestHeader('Access-Control-Allow-Origin', '*')
  if (method.toLowerCase() === 'get') {
    xhr.send(null)
  }
  if (method.toLowerCase() === 'post') {
    xhr.send(JSON.stringify(data))
  }
}

export function fn2workerURL (fn: Function, obj?: object) {
  let args = obj ? JSON.stringify(obj) : ''
  let fns = `
  try{
    ${request.toString()};
    (${fn.toString()})(${args});
  } catch(e) {
    console.log('worker exec error', e)
  }
  `
  let blob = new Blob([fns], {
    type: 'application/javascript'
  })
  return URL.createObjectURL(blob)
}
export function makeWorker (fn: Function, obj?: object): Worker | undefined {
  if (!window.Worker) {
    return
  }
  let blob = fn2workerURL(fn, obj)
  try {
    let worker = new window.Worker(blob)
    worker.addEventListener('error', function (event) {
      event.preventDefault()
      console.error(`worker error`, event)
    })
    return worker
  } catch (error) {
    console.error(error)
  }
}

export function makeIframe (fn: Function, ...arg: string[]): Window | null {
  let iframe = document.createElement('iframe')
  iframe.width = '0'
  iframe.height = '0'
  iframe.style.display = 'none'
  iframe.style.visibility = 'hidden'
  document.body.appendChild(iframe)
  let args = arg.join(',')
  iframe.src = `javascript:try{;(${fn.toString()})(${args})}catch(e){console.log('iframe exec error', e)}`
  let global = iframe.contentWindow
  if (!iframe) {
    return null
  }
  return global
}

let worker = makeWorker(function () {
  addEventListener('message', function (e) {
    let data = e.data || {}
    request('post', data.url, data)
  })
})
export function report (url: string, uid: string, type: string, data: any) {
  if (!worker) {
    return
  }
  worker.postMessage({
    type: type,
    uid: uid,
    url: url,
    data: JSON.stringify(data)
  })
}
export function isFunction (f: any): f is Function {
  return f instanceof Function
}
