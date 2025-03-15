const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool(config.database);

// 添加连接测试
pool.getConnection()
  .then(connection => {
    console.log('数据库连接成功');
    connection.release();
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
  });

module.exports = pool; 