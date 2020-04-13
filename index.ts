import Mt from './mt'
import MtPanel from './mt-panel'
import MtFps from './mt-fps'
import MtError from './mt-error'
import './index.styl'

let monitor = new Mt({
  product: 'test',
  uid: 'test',
  reportUrl: `http://${location.hostname}:8000/log`
})

let fps = new MtFps()
let err = new MtError()
let panel = new MtPanel(fps)

monitor
  .plugin(fps)
  .plugin(err)
  .plugin(panel)

monitor.run()

// panel.on('plugin:mount', (content: any) => {
//   console.log(content)
// })
// panel.on('plugin:mounted', (content: any) => {
//   setInterval(() => {
//   }, 1000)
//   console.log(content)
// })
// setTimeout(function () {
//   console.log('=====')
//   throw new Error('===++')
// }, 1000)
// function a () {
//   throw new Error('===')
// }
// a()
