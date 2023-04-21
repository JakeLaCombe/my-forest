const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());


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
  plugins: [
    new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(appDirectory, "index.html"),
    }),
    new CleanWebpackPlugin(),
 ],
  watchOptions: {
    ignored: /node_modules/
  }
}
