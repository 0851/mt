import './src/panel/temp.styl'
import temp from './src/panel/temp.pug'
import EventBus from './event'
import { isFunction } from './src/util'

interface IMtPanel {
  performanceContent (dom: HTMLElement): void
  fpsContent (dom: HTMLElement): void
  errContent (dom: HTMLElement): void
}

class MtPanel extends EventBus implements Mt.Plugin, IMtPanel {
  fps?: MtFps
  err?: MtError
  monitor?: Mt
  dom: { [key: string]: HTMLElement | null }
  [key: string]: any
  constructor (fps?: MtFps, err?: MtError) {
    super()
    this.dom = {}
    this.fps = fps
    this.err = err
  }
  apply (monitor: Mt): void {
    this.monitor = monitor
    this.render()
    this.toggleTitle()
  }
  private render (): void {
    this.initBox()
    this.initDomShow('performance', '.mt-performance', 'monitor')
    this.initDomShow('fps', '.mt-fps', 'fps')
    this.initDomShow('err', '.mt-error', 'fps')
  }
  private initBox () {
    let content = document.createElement('div')
    content.className = 'mt-monitor-box'
    content.innerHTML = temp
    document.body.appendChild(content)
    this.dom.box = content
  }
  private initDomShow (key: string, className: string, objkey: keyof this) {
    if (!this.dom.box) return
    let dom = this.dom.box.querySelector<HTMLElement>(className)
    if (!dom) return
    if (!this[objkey]) return
    dom.className = `${dom.className} show`
    this.dom[key] = dom
    let contentKey = `${key}Content`
    this.dom[contentKey] = dom.querySelector<HTMLElement>('.mt-panel-content')
    if (this.dom[contentKey] && contentKey in this && isFunction(this[contentKey])) {
      this[contentKey](this.dom[contentKey])
    }
  }
  performanceContent (dom: HTMLElement): void {
    if (!this.monitor) return
    console.log(this.monitor?.performances)
    console.log('===performanceContent==')
  }
  fpsContent (dom: HTMLElement): void {
    if (!this.fps) return
    console.log(this.fps.lists, 'this.fps.lists')
    this.fps.on('fps:logs', function (logs: any) {
      console.log(logs, 'changed this.fps.lists')
    })
    console.log('===fpsContent==')
  }
  errContent (dom: HTMLElement): void {
    if (!this.err) return
    console.log(this.err.logs, 'this.err.logs')
    this.err.on('err:logs', function (logs: any) {
      console.log(logs, 'changed this.err.logs')
    })
    console.log('===errContent==')
  }
  private toggleTitle (): void {
    let title = document.querySelector<HTMLElement>('.mt-monitor-title')
    let content = document.querySelector<HTMLElement>('.mt-monitor-content')
    let isOpen = false
    if (title === null || content === null) {
      return
    }
    let contentSourceClassName = content.className
    title.addEventListener('click', () => {
      if (title === null || content === null) {
        return
      }
      title.innerHTML = isOpen === true ? '缩小' : '展开'
      content.className =
        isOpen === true ? contentSourceClassName : `${content.className} hide`
      isOpen = !isOpen
    })
  }
}
export { MtPanel }
export default MtPanel
