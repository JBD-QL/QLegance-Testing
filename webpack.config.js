var config = {
   entry: './src/bind.js',

   output: {
      path:'./public',
      filename: 'bundle.js',
   },

   devServer: {
      inline: true,
      port: 8080
   },

   module: {
      loaders: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
               presets: ['es2015']
            }
         }
      ]
   }
}

module.exports = config;
