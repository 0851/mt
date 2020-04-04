import Chart from 'chart.js'

Chart.defaults.global.defaultFontColor = '#e1e1e1'

export function randomRgbaColor () {
  let r = Math.floor(Math.random() * 256) // 随机生成256以内r值
  let g = Math.floor(Math.random() * 256) // 随机生成256以内g值
  let b = Math.floor(Math.random() * 256) // 随机生成256以内b值
  return {
    bg: `rgba(${r},${g},${b},0.3)`,
    border: `rgb(${r},${g},${b})`
  }
}
export function randomRgbaColors (count: number = 100) {
  let colors = new Array(count).fill(undefined).map(() => randomRgbaColor())
  let backgroundColors = colors.map(item => item.bg)
  let borderColors = colors.map(item => item.border)
  return {
    bg: backgroundColors,
    border: borderColors
  }
}

export function ChartLineConfigFactory (
  config: Partial<Chart.ChartConfiguration>
): Partial<Chart.ChartConfiguration> {
  let datasets = config.data?.datasets || []
  let labels: string[] = []
  // let color = randomRgbaColor()
  // console.log(color.bg)
  // console.log(color.border)
  datasets = datasets.map(function (item) {
    let datas: any[] = item.data || []
    labels = datas.map((d: any) => {
      return d.toString()
    })
    return {
      backgroundColor: 'rgba(248,174,109,0.3)',
      borderColor: 'rgb(248,174,109)',
      borderWidth: 1,
      ...item,
      data: datas
    }
  })

  let res = {
    ...config,
    data: {
      ...config.data,
      datasets: datasets,
      labels: labels
    },
    options: {
      onHover (this: any, event: MouseEvent, activeElements: Array<{}>) {
        if (event.type === 'mouseout') {
          this.enableUpdated = true
        } else {
          this.enableUpdated = false
        }
      },
      elements: {
        point: {
          radius: 3
        }
      },
      layout: {
        padding: {
          left: 2,
          right: 2,
          top: 2,
          bottom: 2
        }
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
              // stepSize: 0.1
            }
          }
        ]
      }
    }
  }
  return res
}
export function customTooltips (tips: any) {
  return function (this: any, tooltip: any) {
    // Tooltip Element
    let pNode = this._chart.canvas.parentNode
    let tooltipEl = pNode.querySelector('.chartjs-tooltip') as any

    if (!tooltipEl) {
      tooltipEl = document.createElement('div') as any
      tooltipEl.classList.add('chartjs-tooltip')
      tooltipEl.innerHTML = '<table></table>'
      this._chart.canvas.parentNode.appendChild(tooltipEl)
    }

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = 0
      tooltipEl.style.display = 'none'
      return
    }

    tooltipEl.style.display = 'block'

    // Set caret Position
    tooltipEl.classList.remove('above', 'below', 'no-transform')
    if (tooltip.yAlign) {
      tooltipEl.classList.add(tooltip.yAlign)
    } else {
      tooltipEl.classList.add('no-transform')
    }

    if (tooltip.dataPoints) {
      let titleLines = tooltip.title || []
      let bodyLines: any[] = tooltip.dataPoints.map((item: any) => {
        let find = tips.find((o: any) => {
          return o.label === item.label
        })
        if (find && find.tips) {
          if (!Array.isArray(find.tips)) {
            find.tips = [find.tips]
          }
          return find.tips.map((t: any) => `<div>${t}<div>`).join('')
        } else {
          return item.value
        }
      })

      let innerHtml = '<thead>'

      titleLines.forEach(function (title: any) {
        innerHtml += '<tr><th>' + title + '</th></tr>'
      })
      innerHtml += '</thead><tbody>'

      bodyLines.forEach(function (body: any, i) {
        let colors = tooltip.labelColors[i]
        let style = 'background:' + colors.backgroundColor
        style += '; border-color:' + colors.borderColor
        style += '; border-width: 2px'
        let span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>'
        innerHtml += '<tr><td>' + span + body + '</td></tr>'
      })
      innerHtml += '</tbody>'

      let tableRoot = tooltipEl.querySelector('table') as any
      tableRoot.innerHTML = innerHtml
    }

    let positionY = this._chart.canvas.offsetTop
    let positionX = this._chart.canvas.offsetLeft

    tooltipEl.style.opacity = 1
    tooltipEl.style.left = positionX + tooltip.caretX + 20 + 'px'
    tooltipEl.style.top = positionY + tooltip.caretY + 'px'
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily
    tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px'
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle
    tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px'
  }
}

export function ChartRender (
  dom: HTMLCanvasElement,
  config: Partial<Chart.ChartConfiguration>
): Chart | undefined {
  let ctx = dom.getContext('2d')
  if (!ctx) return
  return new Chart(ctx, { ...{ type: 'line' }, ...config })
}
