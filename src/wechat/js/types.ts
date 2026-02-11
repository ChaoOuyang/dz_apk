export interface AuthResponse {
  errCode: number;
  errStr?: string;
  type: string;
  code?: string;
  state?: string;
  lang?: string;
  country?: string;
}

export class WechatError extends Error {
  code: number;
  errCode: number;  // 兼容旧代码中使用 error.errCode 的地方
  
  constructor(response: AuthResponse) {
    super(response.errStr || 'WeChat error');
    this.code = response.errCode;
    this.errCode = response.errCode;  // 同时设置 errCode 属性
    this.name = 'WechatError';
  }
}

export type EventType = 'SendAuth.Resp' | 'LaunchFromWX.Req';

export interface WechatModule {
  registerApp(appId: string, universalLink: string, callback: (error: any, result: any) => void): void;
  isWXAppInstalled(callback: (error: any, result: boolean) => void): void;
  isWXAppSupportApi(callback: (error: any, result: boolean) => void): void;
  getApiVersion(callback: (error: any, result: string) => void): void;
  openWXApp(callback: (error: any, result: boolean) => void): void;
  sendAuthRequest(scope: string, state: string, callback: (error: any, result: any) => void): void;
}
