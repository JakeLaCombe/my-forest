import * as path from 'path'

export default {
  mode: 'development',
  entry: './src/main.ts',
  devServer: {
    port: 9000,
    static: {
      serveIndex: true,
      directory: __dirname
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
         test: /\.(jpe?g|png|svg|gif|glb|gltf|ico|eot|ttf|woff|woff2|mp4|pdf|webm|txt)$/,
         type: 'asset/resource'
      },
      // {
      //   test: /\.(jpe?g|png|svg|gif|glb|gltf|ico|eot|ttf|woff|woff2|mp4|pdf|webm|txt)$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //     },
      //   ],
      // },
    ]
  },
  watchOptions: {
    ignored: /node_modules/
  }
}
