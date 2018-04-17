const path = require('path')

module.exports = {
  entry: path.join(__dirname, '../app/index.js'),
  output: {
    path: path.join(__dirname, '../app/'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      api: path.join(__dirname, '../app/api'),
      components: path.join(__dirname, '../app/components'),
      constants: path.join(__dirname, '../app/constants'),
      services: path.join(__dirname, '../app/services'),
      styles: path.join(__dirname, '../app/styles'),
      utils: path.join(__dirname, '../app/utils')
    },
    extensions: ['', '.js', '.jsx', '.less']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-0'],
          plugins: [
            ['transform-decorators-legacy']
          ]
        }
      }, {
        test: /\.less$/,
        loader: 'style!css!less'
      }, {
        test: /\.css$/,
        loader: 'style!css'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '../app/'),
    publicPath: '/app/',
    port: 3333,
    inline: true
  },
  devtool: 'cheap-module-source-map'
}
