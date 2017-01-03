const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

console.log(process.env.NODE_ENV, process.env.NODE_ENV === 'production')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    'index': (isProduction?[]:[
      'webpack-hot-middleware/client?reload=true'
      ]).concat([
      'regenerator-runtime/runtime.js',
      './src/index.js'
    ])
  },
  output: {
    pathinfo: !isProduction,
    path: path.resolve(__dirname, "lib"),
    publicPath: "/lib/",
    filename: "bundle.js"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".es", ".jsx", ".js"]
  },

  module: {
    loaders: [
      {
        test: /\.js[x]?$/,
        loader: "babel-loader",
        exclude: /(node_modules|bower_components)/,
        query: {
          presets: ['babel-preset-latest']
        }  
      },
      //{ test: /\.ts$/, loader: "ts-loader" },
      //{ test: /\.tsx$/, loaders: ["react-hot", "ts-loader"], include: path.join(__dirname, 'src') },
      //{ test: /\.jsx?$/, loaders: ['react-hot', 'jsx?harmony'], include: path.join(__dirname, 'src') }
    ],

    preLoaders: [
      { test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  plugins: [
    new webpack.DllReferencePlugin({
      context: path.join(__dirname),
      manifest: require("./lib/vendor-manifest.json")
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: isProduction ? '"production"': '"development"'
      }
    }),
    new webpack.NoErrorsPlugin()].concat(isProduction ? [
    new ExtractTextPlugin("[name].css", { allChunks: true }),
    new webpack.optimize.UglifyJsPlugin({ compressor: { warnings: false } }),
    new webpack.BannerPlugin("/**compressed**/", { raw: true })
  ] : [ new webpack.HotModuleReplacementPlugin() ])
    
};
