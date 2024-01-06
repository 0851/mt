// class A {
//   b = 'sdd'
//   c = '222'
//   get a() {
//     console.log(this.b, this.c)
//     return this.b + this.c
//   }
// }
// let s = new A()
// console.log(s.a)

class Ob {
  constructor(options) {
    let computed = options.computed
    let data = options.data.call(this)
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(value) {
          data[key] = value
        },
      })
    })
    Object.keys(options.computed).forEach((key) => {
      let item = computed[key]
      Object.defineProperty(this, key, {
        get() {
          return item.call(this)
        },
      })
    })
  }
}
console.time('start')
let s = new Ob({
  data() {
    return {
      c: '====',
      d: '===++++',
    }
  },
  computed: {
    a() {
      return this.c + this.d
    },
  },
})
console.timeEnd('start')
console.time('1')
console.log(s.a)
s.c = 'changed'
console.log(s.a)
console.timeEnd('1')
