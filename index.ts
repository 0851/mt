import mtsdk from './mtsdk'
import mtsdkpanel from './mtsdk-panel'

let monitor = new mtsdk({
  uid: 'test',
  report: `http://${location.hostname}:8000/log`,
  logsMax: 20,
  fpsCount: 30,
  errorDelay: 5000,
  tracksMax: 1000
})
let panel = new mtsdkpanel()
panel.on('plugin:start', (content: any) => {
  console.log(content)
})
panel.on('plugin:end', (content: any) => {
  console.log(content)
})
monitor.plugin(panel)
monitor.run()
function sdd () {
  throw new Error('====click error===')
}
window.addEventListener('click', sdd)
setTimeout(function () {
  // window.removeEventListener('click', sdd)
  let a = new Promise(function (res, rj) {
    rj('promise error')
  })
  throw Error('throw window Error')
}, 5000)
