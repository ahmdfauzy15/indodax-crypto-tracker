const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://indodax.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api', // Tidak perlu rewrite jika path sama
      },
      onProxyRes: function(proxyRes, req, res) {
        // Tambahkan header CORS
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      }
    })
  );
};