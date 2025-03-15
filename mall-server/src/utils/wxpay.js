const tenpay = require('tenpay');
const config = require('../config');

// 创建模拟支付API实例
const createMockPayApi = () => {
  return {
    // 模拟统一下单
    unifiedOrder: async () => {
      return {
        return_code: 'SUCCESS',
        result_code: 'SUCCESS',
        nonce_str: 'mock_nonce_' + Date.now(),
        prepay_id: 'mock_prepay_' + Date.now(),
        sign: 'mock_sign_' + Date.now()
      };
    },
    // 模拟获取签名
    getSign: () => {
      return 'mock_sign_' + Date.now();
    },
    // 模拟支付回调
    middleware: async (req) => {
      return {
        return_code: 'SUCCESS',
        result_code: 'SUCCESS',
        out_trade_no: req.body.out_trade_no,
        transaction_id: 'mock_transaction_' + Date.now()
      };
    }
  };
};

// 创建支付API实例
let wxpayApi = null;

// 开发环境使用模拟支付
if (process.env.NODE_ENV !== 'production') {
  console.warn('使用模拟支付模式');
  wxpayApi = createMockPayApi();
} else {
  // 生产环境才检查配置
  if (!config.wxpay.appId) {
    console.error('微信支付配置错误: 缺少 appId');
  }
  if (!config.wxpay.mchId) {
    console.error('微信支付配置错误: 缺少 mchId');
  }
  if (!config.wxpay.apiKey) {
    console.error('微信支付配置错误: 缺少 apiKey');
  }

  try {
    wxpayApi = new tenpay({
      appid: config.wxpay.appId,
      mchid: config.wxpay.mchId,
      partnerKey: config.wxpay.apiKey,
      notify_url: config.wxpay.notifyUrl,
      sandbox: false
    });
  } catch (error) {
    console.error('初始化微信支付实例失败，降级使用模拟支付:', error);
    wxpayApi = createMockPayApi();
  }
}

module.exports = wxpayApi; 