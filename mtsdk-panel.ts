import './src/temp.styl'
import temp from './src/temp.pug'
import EventBus from './src/event'

class MonitorPanel extends EventBus implements Monitor.MonitorPlugin {
  constructor () {
    super()
    // --
  }
  apply (monitor: Monitor): void {
    console.log(monitor.performances,'=====+======')
    this.render()
    this.toggleTitle()
  }
  private render (): void {
    let content = document.createElement('div')
    content.className = 'mt-monitor-box'
    content.innerHTML = temp
    document.body.appendChild(content)
  }
  private toggleTitle (): void {
    let title = document.querySelector('.mt-monitor-title')
    let content = document.querySelector('.mt-monitor-content')
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
export { MonitorPanel }
export default MonitorPanel
