import mtsdk from './mtsdk'
import mtsdkpanel from './mtsdk-panel'

let monitor = new mtsdk({
  uid: 'test',
  report: 'http://127.0.0.1:8000/log',
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
  (console as any).sdd('click error')
}
setTimeout(function () {
  window.addEventListener('click', sdd)
  // setTimeout(function () {
  //   window.removeEventListener('click', sdd)
  // }, 5000)
  // let a = new Promise(function (res, rj) {
  //   rj('promise error')
  // })
  // throw Error('window Error')
}, 5000)
