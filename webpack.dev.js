const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const extractCSS = new ExtractTextPlugin('other-styles.css')
const extractLess = new ExtractTextPlugin('original-styles.css')
const extractSass = new ExtractTextPlugin('new-styles.css')

const pageTemplate = process.env.page || 'index'
const htmlTemplate = new HtmlWebpackPlugin({ 
  title : pageTemplate, 
  template: `template/${pageTemplate}.ejs`,
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
  mode: 'development',
  context: __dirname + '/src/',
  entry: {
    app: './index.js',
  },
  optimization,
  output: {
    path: __dirname + '/dist/',
    filename:'[name].js?[hash]',
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
            { loader: 'postcss-loader', options: { path: 'postcss.config.json' } },
            'sass-loader'
          ]
        })
      },
      {
        test: /\.less$/,
        use: extractLess.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            { loader: 'postcss-loader', options: { path: 'postcss.config.json' } },
            'less-loader'
          ]
        })
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { importLoaders: 1 } },
            { loader: 'postcss-loader', options: { path: 'postcss.config.json' } }
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
            query: {
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
  devtool: 'source-map',
  plugins: [
    htmlTemplate,
    extractCSS,
    extractLess,
    extractSass,
  ]
}
