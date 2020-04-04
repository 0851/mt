import 'core-js/es6/array'
import './src/panel/temp.styl'
import temp from './src/panel/temp.pug'
import EventBus from './event'
import { isFunction, autoUnitSize, autoUnitMs } from './src/util'
import {
  ChartRender,
  ChartLineConfigFactory,
  customTooltips,
  randomRgbaColors
} from './src/panel/chart'
import N from 'number-precision'

interface IMtPanel {
  performanceContent? (dom: HTMLElement): void
  fpsContent? (dom: HTMLElement): void
  performanceCanvas? (dom: HTMLCanvasElement): void
  fpsCanvas? (dom: HTMLCanvasElement): void
}

class MtPanel extends EventBus implements Mt.Plugin, IMtPanel {
  fps?: MtFps
  monitor?: Mt
  dom: { [key: string]: HTMLElement | null }
  canvas: { [key: string]: HTMLCanvasElement }
  [key: string]: any
  constructor (fps?: MtFps) {
    super()
    this.dom = {}
    this.canvas = {}
    this.fps = fps
    this.render()
    this.toggleTitle()
  }
  apply (monitor: Mt): void {
    this.monitor = monitor
    Object.keys(this.canvas).forEach(key => {
      if (this[key]) {
        this[key](this.canvas[key])
      }
    })
  }
  private render (): void {
    this.initBox()
    this.initDomShow('performance', '.mt-performance', 'monitor')
    this.initDomShow('fps', '.mt-fps', 'fps')
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
    dom.className = `${dom.className} show`
    this.dom[key] = dom
    let canvasKey = `${key}Canvas`
    let canvasDom = dom.querySelector<HTMLCanvasElement>('.mt-panel-canvas canvas')
    if (canvasDom) {
      this.canvas[canvasKey] = canvasDom
    }
  }
  performanceCanvas (dom: HTMLCanvasElement): void {
    if (!this.monitor) return
    let performance: Mt.IPerformance = { ...this.monitor?.performance } as any
    let entries = performance.entries
    type OmitIPerformance = Omit<Mt.IPerformance, 'redirectCount' | 'timing' | 'entries'>
    let networkItemGenerator = (key: keyof Mt.INetworkPerformance) => {
      let total =
        performance[key] +
        entries.reduce((res, item) => {
          res = N.plus(Number(res.toFixed(3)), Number(item[key].toFixed(3)))
          return res
        }, 0)
      return {
        total,
        items: [
          `[总耗时]: ${autoUnitMs(total)}`,
          `[入口]: ${autoUnitMs(performance[key])}`,
          ...entries.reduce((res: any[], item: any) => {
            res.push(`--------`)
            res.push(`[${item.name}]`)
            res.push(`size: ${autoUnitSize(item.size)}`)
            res.push(`time: ${autoUnitMs(item[key])}`)
            return res
          }, [])
        ]
      }
    }
    let dnsItem = networkItemGenerator('dnstime')
    let tcptracetimeItem = networkItemGenerator('tcptracetime')
    let allnetworktimeItem = networkItemGenerator('allnetworktime')
    let performances = [
      {
        key: 'tcptracetime',
        label: '总网络耗时',
        value: allnetworktimeItem.total,
        tips: allnetworktimeItem.items
      },
      {
        key: 'domreadytime',
        label: 'DOM完成耗时',
        value: performance.domreadytime,
        tips: autoUnitMs(performance.domreadytime)
      },
      {
        key: 'whitetime',
        label: '完全白屏时间',
        value: performance.whitetime,
        tips: autoUnitMs(performance.whitetime)
      },
      {
        key: 'dnstime',
        label: '总DNS耗时',
        value: dnsItem.total,
        tips: dnsItem.items
      },
      {
        key: 'tcptracetime',
        label: '总TCP链路耗时',
        value: tcptracetimeItem.total,
        tips: tcptracetimeItem.items
      },
      {
        key: 'domcompiletime',
        label: '解析DOM树耗时',
        value: performance.domcompiletime,
        tips: autoUnitMs(performance.domcompiletime)
      }
    ]

    let labels = performances.map(item => item.label)
    let datas: number[] = performances.map(item => item.value)

    let charter = ChartRender(dom, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: [],
            fill: false,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 205, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 159, 64)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(153, 102, 255)'
            ]
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        tooltips: {
          enabled: false,
          mode: 'index',
          position: 'nearest',
          custom: customTooltips(performances)
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                display: true,
                color: 'rgb(100,100,100,0.5)',
                zeroLineColor: 'rgb(100,100,100,0.5)'
              },
              ticks: {
                beginAtZero: true,
                min: 0,
                suggestedMin: 0
              }
            }
          ]
        }
      }
    })
    setTimeout(() => {
      datas.forEach((item: any, i) => {
        if (!charter?.data.datasets) return
        charter?.data.datasets[0].data?.push(item)
      })
      charter?.update()
    })
  }
  fpsCanvas (dom: HTMLCanvasElement): void {
    let self = this
    if (!self.fps) return
    let charter = ChartRender(
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
