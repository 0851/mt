import webpack from 'webpack'
function MTWebpackPluginLoader (
  this: webpack.loader.LoaderContext,
  source: string | Buffer,
  sourceMap?: any
): string | Buffer | void | undefined {
  console.log('====+++=', source)
  return source
}
export default MTWebpackPluginLoader
