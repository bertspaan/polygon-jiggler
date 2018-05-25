const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './bin'),
    filename: 'app.js'
  },
  // module: {
  //   loaders: [{
  //     test: /\.js$/,
  //     exclude: /node_modules/,
  //     loader: 'babel-loader'
  //   }]
  // }
}
