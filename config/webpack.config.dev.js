const path = require('path')

module.exports = {
  entry: path.join(__dirname, '../src/index.js'),
  output: {
    path: path.join(__dirname, '../src/'),
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      api: path.join(__dirname, '../src/api'),
      components: path.join(__dirname, '../src/components'),
      constants: path.join(__dirname, '../src/constants'),
      services: path.join(__dirname, '../src/services'),
      styles: path.join(__dirname, '../src/styles'),
      utils: path.join(__dirname, '../src/utils')
    },
    extensions: ['.js', '.jsx', '.less']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'react', 'stage-0'],
            plugins: ['transform-decorators-legacy']
          }
        }]
      }, {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'less-loader' }
        ]
      }, {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '../src/'),
    publicPath: '/src/',
    port: 3333,
    inline: true
  },
  mode: 'development',
  devtool: 'cheap-module-source-map'
}
