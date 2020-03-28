import mtsdk from './mtsdk'
import mtsdkpanel from './mtsdk-panel'

let monitor = new mtsdk({})

let panel = new mtsdkpanel()
panel.on('plugin:start', (content: any) => {
  console.log(content)
})
panel.on('plugin:end', (content: any) => {
  console.log(content)
})
monitor.plugin(panel)
monitor.run()
