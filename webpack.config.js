const path = require('path')

module.exports = [{

  mode:"development",
  output:{
    filename:'main.js',
    path: path.resolve(__dirname,'js')
  },
  entry:'./src/main.js'
}]


/*
module: {
  rules: [
    {
      test: /\.js$/,
      loader: require.resolve('@open-wc/webpack-import-meta-loader'),
    },
  ],
},*/
