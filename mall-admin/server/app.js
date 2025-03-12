// 引入商品路由
const goodsRouter = require('./routes/goods');

// 注册商品路由
app.use('/api/admin/goods', goodsRouter); 