import './src/panel/temp.styl'
import temp from './src/panel/temp.pug'
import EventBus from './event'
import { isFunction, autoUnit } from './src/util'
import {
  LineChart,
  RadarChart,
  ChartLineConfigFactory,
  randomRgbaColors
} from './src/panel/chart'

interface IMtPanel {
  performanceContent? (dom: HTMLElement): void
  fpsContent? (dom: HTMLElement): void
  errContent? (dom: HTMLElement): void
  performanceCanvas? (dom: HTMLCanvasElement): void
  fpsCanvas? (dom: HTMLCanvasElement): void
  errCanvas? (dom: HTMLCanvasElement): void
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
    let canvasKey = `${key}Canvas`
    this.dom[contentKey] = dom.querySelector<HTMLElement>('.mt-panel-content')
    this.dom[canvasKey] = dom.querySelector<HTMLCanvasElement>('.mt-panel-canvas canvas')
    if (this.dom[contentKey] && contentKey in this && isFunction(this[contentKey])) {
      this[contentKey](this.dom[contentKey])
    }
    if (this.dom[canvasKey] && canvasKey in this && isFunction(this[canvasKey])) {
      this[canvasKey](this.dom[canvasKey])
    }
  }
  performanceCanvas (dom: HTMLCanvasElement): void {
    if (!this.monitor) return
    let performance: any = Object.assign({}, this.monitor?.performance)
    let entries: any[] = performance.entries
    delete performance.entries
    delete performance.timing
    let labels: any[] = []
    let datas: any[] = []
    let tips: any[] = []
    Object.keys(performance).forEach((key: string) => {
      labels.push(key)
      datas.push(performance[key])
      tips.push(`[${key}]: ${performance[key]}ms`)
    })
    entries.forEach(function (item) {
      labels.push(`${item.name}`)
      datas.push(item.responsetime)
      tips.push([
        `[name]: ${item.name}`,
        `[size]: ${autoUnit(item.size)}`,
        `[dnstime]: ${item.dnstime}ms`,
        `[requesttime]: ${item.requesttime}ms`,
        `[responsetime]: ${item.responsetime}ms`
      ])
    })
    let colors = randomRgbaColors()
    let charter = RadarChart(dom, {
      data: {
        datasets: [
          {
            label: '启动性能数据',
            data: datas,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            spanGaps: false,
            tips: tips
          } as any
        ],
        labels: labels
      },
      options: {
        legend: {
          display: false
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData) => {
              let index = tooltipItem?.index
              if (!index) {
                return ''
              }
              let res: any = (data.datasets || [])[0] || {}
              let tips: string[] = res.tips || []
              return tips[index]
            },
            title: (tooltipItems: Chart.ChartTooltipItem[], data: Chart.ChartData) => {
              return ''
            }
          }
        },
        scale: {
          gridLines: {
            display: false
          },
          ticks: {
            min: 0,
            backdropColor: 'rgb(100,100,100,0)',
            fontColor: 'rgb(245,245,245,0.7)'
          }
        }
      }
    })
  }
  fpsCanvas (dom: HTMLCanvasElement): void {
    let self = this
    if (!self.fps) return
    let charter = LineChart(
      dom,
      ChartLineConfigFactory({
        data: {
          datasets: [
            {
              label: 'FPS 帧数',
              data: []
            }
          ]
        }
      })
    )
    self.fps.on('fps:logs', function (logs: number[]) {
      if (!charter) {
        return
      }
      setTimeout(() => {
        let enableUpdated = (charter as any)?.enableUpdated
        if (enableUpdated === false) {
          return
        }
        (charter?.data.datasets || []).forEach(dataset => {
          let len = dataset.data?.length || 0
          if (len > 0) {
            dataset.data?.splice(0, self.fps?.count)
            charter?.data.labels?.splice(0, self.fps?.count)
          }
          logs.forEach(function (log, i) {
            dataset.data?.push(log)
            charter?.data.labels?.push(i + 1)
          })
        })
        charter?.update()
      }, 0)
    })
  }
  errCanvas (dom: HTMLCanvasElement): void {
    if (!this.err) return
    console.log(this.err.logs, 'this.err.logs')
    this.err.on('err:logs', function (logs: any) {
      console.log(logs, 'changed this.err.logs')
    })
    console.log('===errContent==')
  }
  private toggleTitle (): void {
    let box = document.querySelector<HTMLElement>('.mt-monitor-box')
    let title = document.querySelector<HTMLElement>('.mt-monitor-title')
    let content = document.querySelector<HTMLElement>('.mt-monitor-content')
    let isOpen = false
    if (title === null || content === null) {
      return
    }
    let className = content.className
    title.addEventListener('click', () => {
      if (title === null || content === null) {
        return
      }
      title.innerHTML = isOpen === true ? '缩小' : '展开'
      content.className = isOpen === true ? className : `${content.className} hide`
      isOpen = !isOpen
    })
  }
}
export { MtPanel }
export default MtPanel
