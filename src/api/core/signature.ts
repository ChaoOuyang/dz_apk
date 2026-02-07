/**
 * 请求签名工具
 * 参考参考文档中的签名机制
 * 
 * 签名流程：
 * 1. 参数排序：按 ASCII 码顺序排序所有参数
 * 2. 字符串构建：将参数拼接成 key1=value1&key2=value2&... 格式
 * 3. 过滤表情：移除所有 emoji 和特殊字符
 * 4. MD5 加密：使用 MD5 算法加密字符串，转为大写
 */

/**
 * MD5 哈希算法实现
 * 基于 RFC 1321 标准
 */
class MD5 {
  private a = 0x67452301;
  private b = 0xefcdab89;
  private c = 0x98badcfe;
  private d = 0x10325476;

  private k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  private s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  hash(msg: string): string {
    const bytes = this.toUtf8Bytes(msg);
    const len = bytes.length;

    // Pre-processing: adding a single 1 bit
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) {
      bytes.push(0x00);
    }

    // Append original length in bits as 64-bit little-endian
    let bitlen = len * 8;
    for (let i = 0; i < 8; i++) {
      bytes.push(bitlen >>> (i * 8) & 0xff);
    }

    // Process message in successive 512-bit chunks as 16 32-bit little-endian words
    for (let offset = 0; offset < bytes.length; offset += 64) {
      this.processChunk(bytes, offset);
    }

    return this.toHexString();
  }

  private toUtf8Bytes(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code <= 0x7f) {
        bytes.push(code);
      } else if (code <= 0x7ff) {
        bytes.push(0xc0 | (code >> 6));
        bytes.push(0x80 | (code & 0x3f));
      } else if (code <= 0xffff) {
        bytes.push(0xe0 | (code >> 12));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      } else {
        bytes.push(0xf0 | (code >> 18));
        bytes.push(0x80 | ((code >> 12) & 0x3f));
        bytes.push(0x80 | ((code >> 6) & 0x3f));
        bytes.push(0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  private processChunk(bytes: number[], offset: number): void {
    const m: number[] = [];
    for (let i = 0; i < 16; i++) {
      m[i] =
        bytes[offset + i * 4] |
        (bytes[offset + i * 4 + 1] << 8) |
        (bytes[offset + i * 4 + 2] << 16) |
        (bytes[offset + i * 4 + 3] << 24);
    }

    let a = this.a;
    let b = this.b;
    let c = this.c;
    let d = this.d;

    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      b =
        (b +
          this.leftRotate(
            (a + f + this.k[i] + m[g]) >>> 0,
            this.s[i]
          )) >>>
        0;
      a = temp;
    }

    this.a = (this.a + a) >>> 0;
    this.b = (this.b + b) >>> 0;
    this.c = (this.c + c) >>> 0;
    this.d = (this.d + d) >>> 0;
  }

  private leftRotate(num: number, bits: number): number {
    return ((num << bits) | (num >>> (32 - bits))) >>> 0;
  }

  private toHexString(): string {
    const toHex = (num: number): string => {
      let hex = '';
      for (let i = 0; i < 4; i++) {
        const h = ((num >>> (i * 8)) & 0xff).toString(16);
        hex += h.length === 1 ? '0' + h : h;
      }
      return hex;
    };
    return (
      toHex(this.a) + toHex(this.b) + toHex(this.c) + toHex(this.d)
    );
  }
}

function md5(str: string): string {
  return new MD5().hash(str);
}

/**
 * 过滤 emoji 和特殊字符
 * @param str 需要过滤的字符串
 * @returns 过滤后的字符串
 */
function filterEmoji(str: string): string {
  // 移除 emoji
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  let filtered = str.replace(emojiRegex, '');
  
  // 移除其他特殊字符（保留字母、数字、汉字、常见符号）
  filtered = filtered.replace(/[^\w\u4E00-\u9FA5\-_.~]/g, '');
  
  return filtered;
}

/**
 * 生成请求签名
 * @param params 请求参数对象
 * @returns 签名字符串（大写 MD5 哈希）
 * 
 * 签名流程：
 * 1. 过滤掉 signture 字段（避免循环引用）
 * 2. 按 ASCII 码对参数 key 进行升序排序
 * 3. 拼接成 key1=value1&key2=value2&... 的格式
 * 4. 过滤 emoji 和特殊字符
 * 5. 计算 MD5 哈希并转为大写
 */
export function generateSignature(params: Record<string, any>): string {
  // 步骤 1: 过滤掉 signture 字段（避免循环引用）和空值
  const filteredParams: Record<string, any> = {};
  Object.keys(params).forEach((key) => {
    if (key !== 'signture' && params[key] !== null && params[key] !== undefined) {
      filteredParams[key] = params[key];
    }
  });

  // 步骤 2: 获取所有 key 并按 ASCII 码升序排序
  const keys = Object.keys(filteredParams).sort();

  // 步骤 3: 拼接参数字符串
  let paramString = keys
    .map((key) => `${key}=${filteredParams[key]}`)
    .join('&');

  // 步骤 4: 过滤 emoji 和特殊字符
  paramString = filterEmoji(paramString);

  console.log('[Signature] Signature string:', paramString);

  // 步骤 5: 计算 MD5 哈希并转为大写
  return md5(paramString).toUpperCase();
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
 * 获取当前时间戳（秒级，13 位）
 * @returns 时间戳字符串
 */
export function getTimestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}
