/* eslint-disable @typescript-eslint/no-var-requires,import/no-extraneous-dependencies */
const slsw = require('serverless-webpack')

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.IS_LOCAL ? 'development' : 'production',
  target: 'node',
  devtool: 'source-map',
  externals: [{ 'aws-sdk': 'commonjs aws-sdk' }],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
}
