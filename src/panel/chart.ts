import Chart from 'chart.js'

Chart.defaults.global.defaultFontColor = '#e1e1e1'

export function randomRgbaColor () {
  let r = Math.floor(Math.random() * 256) // 随机生成256以内r值
  let g = Math.floor(Math.random() * 256) // 随机生成256以内g值
  let b = Math.floor(Math.random() * 256) // 随机生成256以内b值
  return {
    bg: `rgb(${r},${g},${b},0.3)`,
    border: `rgb(${r},${g},${b},1)`
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
  let colors = randomRgbaColor()
  datasets = datasets.map(function (item) {
    let datas: any[] = item.data || []
    labels = datas.map((d: any) => {
      return d.toString()
    })
    return {
      backgroundColor: colors.bg,
      borderColor: colors.border,
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
              // beginAtZero: true,
              // min: 0,
              // suggestedMin: 0,
              stepSize: 0.1
            }
          }
        ]
      }
    }
  }
  return res
}
export function ChartRender (
  dom: HTMLCanvasElement,
  config: Partial<Chart.ChartConfiguration>
): Chart | undefined {
  let ctx = dom.getContext('2d')
  if (!ctx) return
  return new Chart(ctx, { ...{ type: 'line' }, ...config })
}
