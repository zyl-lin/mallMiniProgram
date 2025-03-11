const express = require('express')
const dotenv = require('dotenv')
const path = require('path')

// 打印初始环境变量
console.log('Initial NODE_ENV:', process.env.NODE_ENV)

// 确保环境变量设置正确
const NODE_ENV = process.env.NODE_ENV || 'development'
console.log('Current NODE_ENV:', NODE_ENV)

// 根据 NODE_ENV 加载对应的环境变量文件
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development'
console.log('Loading env file:', envFile)

// 加载环境变量文件
dotenv.config({ path: path.join(__dirname, envFile) })

// 加载配置文件
const config = require('./config')
console.log('Loaded config:', {
  env: NODE_ENV,
  port: config.port,
  database: {
    ...config.database,
    password: '******' // 隐藏敏感信息
  },
  apiUrl: config.apiUrl
})

const app = express()

// 基础配置
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 测试路由
app.get('/', (req, res) => {
  res.json({
    message: 'Mall Admin API Server',
    env: NODE_ENV,
    config: {
      port: config.port,
      database: {
        ...config.database,
        password: '******' // 隐藏敏感信息
      },
      apiUrl: config.apiUrl
    }
  })
})

// 启动服务器
const PORT = config.port || 3000
app.listen(PORT, () => {
  console.log('----------------------------------------')
  console.log(`Server is running in ${NODE_ENV} mode`)
  console.log(`Port: ${PORT}`)
  console.log(`API URL: ${config.apiUrl}`)
  console.log(`Database: ${config.database.host}:${config.database.port}/${config.database.database}`)
  console.log('----------------------------------------')
}) 