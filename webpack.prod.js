const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractSass = new ExtractTextPlugin('style.css')

const indexTemplate = new HtmlWebpackPlugin({ 
  template: `template/index.ejs`,
})

const optimization = {
  splitChunks: {
    cacheGroups: {
      default: false,
      vendors: {
        name: 'vendor',
        reuseExistingChunk: true,
        test: /[\\/]node_modules[\\/]|[\\/]react-slick[\\/]/,
        chunks: 'all',
      },
    }
  },  
};

module.exports = {
  mode: 'production',
  context: __dirname + '/src/',
  entry: {
    app: './index.js',
  },
  optimization,
  output: {
    path: __dirname,
    filename: 'js/[name].js?[hash]'
  },
  devServer: {
    inline: true,
    https: true,
    public:'0.0.0.0:3000',
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.js(x)?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'sass-loader'
          ]
        })
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        loaders: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 4,
              },
              pngquant: {
                quality: '75-90',
                speed: 3,
              },
            }
          }
        ]
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader?name=public/fonts/[name].[ext]'
      },
      { test: /\.html$/, loader: 'html-loader' }
    ]
  },
  plugins: [
    indexTemplate,
    extractSass,
  ],
}
