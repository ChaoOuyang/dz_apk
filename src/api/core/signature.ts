/**
 * 请求签名工具 - 与后端 Java 实现对齐
 * 
 * 签名机制：防止参数篡改，确保数据完整性和请求合法性
 * 
 * 完整的签名流程：
 * 1. 请求参数排序：按 ASCII 码升序排序所有参数 key
 * 2. 参数过滤：移除 null/undefined 值和 signture 字段（避免循环引用）
 * 3. 字符串拼接：key1=value1&key2=value2&...&keyN=valueN
 * 4. Emoji 过滤：对每个 value 移除 emoji 字符
 * 5. MD5 加密：计算 MD5 哈希值，转为大写
 * 
 * 注意：secret 参数已作为请求参数传入，所以签名源就是拼接后的参数字符串本身，不再需要额外拼接密钥
 * 
 * 例子：
 *   参数：{ password: 'pass', secret: 'ABC123', timestamp: '1000', username: 'test' }
 *   排序：password, secret, timestamp, username
 *   拼接：password=pass&secret=ABC123&timestamp=1000&username=test
 *   加密：MD5(password=pass&secret=ABC123&timestamp=1000&username=test)
 * 
 * 注意事项：
 * - 时间戳必须是秒级（10 位）不是毫秒级
 * - 服务器会验证时间戳防止重放攻击（5 分钟超时）
 * - 参数顺序很重要，必须按 ASCII 码排序
 * - 签名字段本身不参与签名计算
 * - secret 参数必须包含在签名源中
 */

import { API_SECRET } from './config';

/**
 * MD5 哈希算法实现
 * 基于 RFC 1321 标准
 */
function rotateLeft(lValue: number, iShiftBits: number): number {
  return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
}

function addUnsigned(lX: number, lY: number): number {
  const lX8 = lX & 0x80000000;
  const lY8 = lY & 0x80000000;
  const lX4 = lX & 0x40000000;
  const lY4 = lY & 0x40000000;
  const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);

  if (lX4 & lY4) {
    return lResult ^ 0x80000000 ^ lX8 ^ lY8;
  }
  if (lX4 | lY4) {
    if (lResult & 0x40000000) {
      return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
    } else {
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
  } else {
    return lResult ^ lX8 ^ lY8;
  }
}

function F(x: number, y: number, z: number): number {
  return (x & y) | (~x & z);
}

function G(x: number, y: number, z: number): number {
  return (x & z) | (y & ~z);
}

function H(x: number, y: number, z: number): number {
  return x ^ y ^ z;
}

function I(x: number, y: number, z: number): number {
  return y ^ (x | ~z);
}

function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
  a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
  return addUnsigned(rotateLeft(a, s), b);
}

function convertToWordArray(string: string): number[] {
  const lMessageLength = string.length;
  const lNumberOfWords_temp1 = lMessageLength + 8;
  const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
  const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
  const lWordArray: number[] = new Array(lNumberOfWords - 1);

  let lBytePosition = 0;
  let lByteCount = 0;

  while (lByteCount < lMessageLength) {
    const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
    lByteCount++;
  }

  const lWordCount = (lByteCount - (lByteCount % 4)) / 4;
  lBytePosition = (lByteCount % 4) * 8;
  lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
  lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
  lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;

  return lWordArray;
}

function wordToHex(lValue: number): string {
  let wordToHexValue = '';
  for (let lCount = 0; lCount <= 3; lCount++) {
    const lByte = (lValue >>> (lCount * 8)) & 255;
    let wordToHexValue_temp = '0' + lByte.toString(16);
    wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
  }
  return wordToHexValue;
}

function utf8Encode(string: string): string {
  let utftext = '';
  for (let n = 0; n < string.length; n++) {
    const c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

function md5(string: string): string {
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const encodedString = utf8Encode(string);
  const x = convertToWordArray(encodedString);

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;

    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return temp.toUpperCase();
}

/**
 * 过滤 emoji 字符 - 与后端 Java EmojiFilter.filter() 完全一致
 * @param str 需要过滤的字符串
 * @returns 过滤后的字符串
 * 
 * 后端 Java 正则表达式（UTF-16 代码对）：
 * - [\ud83c\udc00-\ud83c\udfff] - 第一组 emoji（U+1F300 到 U+1F5FF）
 * - [\ud83d\udc00-\ud83d\udfff] - 第二组 emoji（U+1F600 到 U+1F64F）
 * - [\ud83e\udc00-\ud83e\udfff] - 第三组 emoji（U+1F900 到 U+1F9FF）
 * - [\u2600-\u2B55]           - 杂项符号和装饰符（U+2600 到 U+2B55）
 */
function filterEmoji(str: string): string {
  if (!str || str.trim().length === 0) {
    return str;
  }

  // 后端 Java 的 emoji 过滤正则表达式对应的 JavaScript 版本
  // 匹配：杂项符号 + UTF-16 代理对 emoji
  const emojiRegex = /[\u2600-\u2B55]|[\uD800-\uDBFF][\uDC00-\uDFFF]/gu;

  return str.replace(emojiRegex, '');
}

/**
 * 生成请求签名
 * @param params 请求参数对象
 * @param secret API 密钥（只用于签名计算，不在请求中发送）
 * @returns 签名字符串（大写 MD5 哈希）
 * 
 * 签名流程（与后端 Java 实现对齐）：
 * 1. 过滤掉 signture 字段（避免循环引用）和 null/undefined 值
 * 2. 将密钥添加到参数中（作为 secret 字段）
 * 3. 按 ASCII 码对参数 key 进行升序排序
 * 4. 拼接成 key1=value1&key2=value2&... 的格式
 * 5. 过滤每个 value 中的 emoji 字符
 * 6. 计算 MD5 哈希并转为大写
 * 
 * 注意：secret 只在签名计算时使用，不在请求参数中发送
 */
export function generateSignature(params: Record<string, any>, secret?: string): string {
  // 步骤 1 & 2: 过滤掉 signture 字段（避免循环引用）和 null/undefined 值，并添加密钥
  const filteredParams: Record<string, string> = {};
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (key !== 'signture' && value !== null && value !== undefined) {
      // 将所有值转换为字符串
      filteredParams[key] = String(value);
    }
  });

  // 添加密钥到参数中（如果提供了 secret）
  if (secret) {
    filteredParams['secret'] = secret;
  }

  // 步骤 3: 获取所有 key 并按 ASCII 码升序排序（字符串的自然排序）
  const keys = Object.keys(filteredParams).sort();

  // 步骤 4 & 5: 拼接参数字符串并过滤 emoji
  let signString = keys
    .map((key) => {
      // 对每个 value 过滤 emoji
      const filteredValue = filterEmoji(filteredParams[key]);
      return `${key}=${filteredValue}`;
    })
    .join('&');
  
  console.log('【签名】参数字符串:', signString);
  console.log('【签名】完整签名源:', signString);

  // 步骤 6: 计算 MD5 哈希（已经是大写）
  const signature = md5(signString);
  console.log('【签名】最终签名:', signature);
  
  return signature;
}

/**
 * 生成 6 位随机数
 * @returns 6 位随机数字符串
 */
export function generateRandom(): string {
  let random = '';
  for (let i = 0; i < 6; i++) {
    random += Math.floor(Math.random() * 10);
  }
  return random;
}

/**
 * 获取当前时间戳（秒级）
 * @returns 时间戳字符串（10 位秒级时间戳）
 * 
 * 与后端对齐：
 * - 秒级而非毫秒级
 * - 用于时间戳过期验证（防重放攻击）
 */
export function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}
