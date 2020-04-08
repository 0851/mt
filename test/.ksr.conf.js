const MTWebpackPlugin = require('../dist/webpack/plugin')
let p = new MTWebpackPlugin()
console.log(MTWebpackPlugin.loader)
module.exports = function () {
  return {
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: MTWebpackPlugin.loader,
          exclude: [/node_modules/],
        },
      ],
    },
    plugins: [p],
  }
}
