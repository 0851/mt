import Mt from './mt'
import MtPanel from './mt-panel'
import MtFps from './mt-fps'
import MtError from './mt-error'

let monitor = new Mt({
  uid: 'test',
  reportUrl: `http://${location.hostname}:8000/log`
})

let fps = new MtFps(30, 500000)
let err = new MtError(100000, 100, 10)
let panel = new MtPanel()

panel.on('plugin:start', (content: any) => {
  console.log(content)
})
panel.on('plugin:end', (content: any) => {
  console.log(content)
})
monitor
  .plugin(fps)
  .plugin(err)
  .plugin(panel)

monitor.run()

function sdd () {
  throw new Error('====click error===')
}
window.addEventListener('click', sdd)
// setTimeout(function () {
// window.removeEventListener('click', sdd)
//   let a = new Promise(function (res, rj) {
//     rj('promise error')
//   })
//   throw Error('throw window Error')
// }, 5000)
