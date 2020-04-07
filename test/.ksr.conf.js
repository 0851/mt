const MTWebpackPlugin = require('../dist/webpack-plugin-cjs.js')
let p = new MTWebpackPlugin()
console.log(MTWebpackPlugin.loader)
module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /.js$/,
          loader: MTWebpackPlugin.loader,
        },
      ],
    },
    plugins: [p],
  }
}
