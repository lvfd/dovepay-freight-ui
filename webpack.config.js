const path = require('path')
const env = process.env.NODE_ENV? process.env.NODE_ENV: 'production'
const ProgressBarWebpackPlugin = require('progress-bar-webpack-plugin')

module.exports = {
  mode: env,
  devtool: env === 'production'? 'source-map': 'inline-source-map',
  entry: {
    dovepayFreight: './src/Entry',
  },
  output: {
    filename: env === 'production'? '[name].min.js': '[name].js',
    // path: path.resolve(__dirname, 'release')
    path: path.resolve(__dirname, '../', 'dovepay-freight/dist')
  },
  plugins: [
    new ProgressBarWebpackPlugin()
  ],
  module: {
    rules: [{
      test: /\.m?js$/,
      include: path.resolve(__dirname, 'src'),
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                "targets": {"ie": "10"},
                "useBuiltIns": "usage",
                "corejs": "3"
              }
            ]
          ]
        }
      }
    }]
  }
}