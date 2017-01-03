const webpack = require('webpack')
const devConfig = require('./webpack.config.js')
const compiler = webpack(devConfig)

const http = require('http')
const connect = require('connect')
const connectStatic = require('serve-static')
const connectCompression = require('compression');
const app = connect();
app.use(connectCompression())
app.use(connectStatic('.', { maxAge: '1d' }))

const isProduction = process.env.NODE_ENV === 'production'
if (isProduction) {
  http.createServer(app).listen(1080);
  console.log('listening on port 1080')

} else {
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: false,
    quiet: false,
    lazy: false,
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    publicPath: "/lib/",
    headers: { "X-Webpack-Header": "yes" },
    stats: {
      colors: true
    }
  }));


  app.use(require('webpack-hot-middleware')(compiler));
  //app.use('/foo', function fooMiddleware(req, res, next) {
  //  console.log('foo')
  //  next();
  //});

  http.createServer(app).listen(1080);
  console.log('listening on port 1080')
}
