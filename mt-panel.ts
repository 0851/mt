import './src/panel/temp.styl'
import temp from './src/panel/temp.pug'
import EventBus from './event'

class MtPanel extends EventBus implements Mt.Plugin {
  fps?: MtFps
  err?: MtError
  constructor (fps?: MtFps, err?: MtError) {
    super()
    // --
  }
  apply (monitor: Mt): void {
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
export { MtPanel }
export default MtPanel
