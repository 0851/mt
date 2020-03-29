
export class Fps {
  lists: number[]
  constructor (count: number) {
    let lastTime = performance.now()
    let frame = 0
    let lastFameTime = performance.now()
    this.lists = []
    const loop = () => {
      let now = performance.now()
      let fs = now - lastFameTime
      lastFameTime = now
      let fps = Math.round(1000 / fs)
      frame++
      if (now > 1000 + lastTime) {
        fps = Math.round((frame * 1000) / (now - lastTime))
        frame = 0
        lastTime = now
      }
      if (this.lists.length >= count) {
        this.lists.splice(0, 1)
      }
      this.lists.push(fps)
      window.requestAnimationFrame(loop)
    }
    loop()
  }
}
