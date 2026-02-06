const crypto = require('crypto');

// 配置
const API_BASE_URL = 'https://interface.dazhiyouqiu.com/0827/';
const FIXED_SESSION = 'ttAyrqPeGaTMHbhx';
const API_SECRET = 'e2ffab74c3d1f8477a801a7377b66125';

// 生成随机数
function generateRandom() {
  return Math.random().toString(36).substring(2, 15);
}

// 获取时间戳
function getTimestamp() {
  return Math.floor(Date.now() / 1000);
}

// 生成签名
function generateSignature(params) {
  const keys = Object.keys(params).sort();
  const str = keys.map(key => key + '=' + params[key]).join('&');
  return crypto.createHash('md5').update(str + API_SECRET).digest('hex');
}

// 构建请求数据
const random = generateRandom();
const timestamp = getTimestamp();
const requestData = {
  activity_id: 673123,
  fromId: 6,
  inviteId: 0,
  iv: '',
  code: '',
  encryptedData: '',
  rdsession: FIXED_SESSION,
  random,
  timestamp,
};

const signature = generateSignature(requestData);
requestData.signture = signature;

// 构建查询参数
const queryParams = new URLSearchParams();
Object.keys(requestData).forEach(key => {
  queryParams.append(key, String(requestData[key]));
});

const url = API_BASE_URL + 'api/core/show_signup?' + queryParams.toString();

console.log('🚀 开始请求 showSignup 接口...');
console.log('📍 请求地址:', API_BASE_URL + 'api/core/show_signup');
console.log('🔑 会话:', FIXED_SESSION);
console.log('⏰ 时间戳:', timestamp);
console.log('🎲 随机数:', random);
console.log('');

fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => {
  console.log('✅ 响应成功!');
  console.log('📊 响应数据:', JSON.stringify(data, null, 2));
  process.exit(0);
})
.catch(error => {
  console.error('❌ 请求失败:', error.message);
  process.exit(1);
});

// 设置超时
setTimeout(() => {
  console.error('⏱️ 请求超时');
  process.exit(1);
}, 10000);
