import webpack from 'webpack'
import path from 'path'

const noop = (): void => {
  //
}
type ITMapKey = 'tap' | 'async' | 'promise'
const TMap: {
  [key in ITMapKey]: string
} = {
  tap: 'tap',
  async: 'tapAsync',
  promise: 'tapPromise'
}

function hookTap (
  compiler: any,
  hook: string,
  fn = noop,
  name: string,
  type: ITMapKey = 'tap'
) {
  if (compiler.hooks) {
    hook = hook.replace(/-(\w)/g, function (all, letter) {
      return letter.toUpperCase()
    })
    compiler.hooks[hook][TMap[type] || 'tap'](name, fn)
  } else {
    compiler.plugin(hook, fn)
  }
}
class MTWebpackPlugin {
  constructor () {
    console.log('===')
  }
  apply (compiler: webpack.Compiler) {
    // console.log(compiler)
  }
  static loader = require.resolve('./loader.js')
}

export default MTWebpackPlugin
