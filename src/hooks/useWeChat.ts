import * as WeChat from 'react-native-wechat-lib';
import { Alert } from 'react-native';

// 定义分享场景的枚举
export enum ShareScene {
  Session = 0,  // 会话
  Timeline = 1, // 朋友圈
  Favorite = 2, // 收藏
}

// 支付请求参数类型
export interface PaymentPayload {
  partnerId: string;
  prepayId: string;
  nonceStr: string;
  timeStamp: string;
  package: string;
  sign: string;
}

// 微信登录返回的结果
export interface WeChatAuthResult {
  errCode?: number;
  errStr?: string;
  code?: string;
  state?: string;
}

export function useWeChat() {
  const checkInstall = async () => {
    const isInstalled = await WeChat.isWXAppInstalled();
    if (!isInstalled) {
      Alert.alert('提示', '请先安装微信客户端');
      return false;
    }
    return true;
  };

  // 登录
  const sendAuthRequest = async (
    scope: string | string[] = 'snsapi_userinfo',
    state = 'wechat_sdk_demo'
  ): Promise<WeChatAuthResult | undefined> => {
    if (!(await checkInstall())) return;
    try {
      const result = await WeChat.sendAuthRequest(scope, state);
      // 登录成功，result.code 可用于换取 access_token
      console.log('登录成功', result);
      return result;
    } catch (e) {
      console.error('登录失败', e);
      Alert.alert('登录失败', '请稍后重试');
    }
  };

  // 分享网页
  const shareWebpage = async (options: {
    title: string;
    description?: string;
    thumbImageUrl?: string;
    webpageUrl: string;
    scene?: ShareScene;
  }) => {
    if (!(await checkInstall())) return;
    try {
      await WeChat.shareWebpage({
        scene: options.scene ?? ShareScene.Session,
        title: options.title,
        description: options.description,
        thumbImageUrl: options.thumbImageUrl,
        webpageUrl: options.webpageUrl,
      } as any);
    } catch (e) {
      console.error('分享失败', e);
      Alert.alert('分享失败', '请稍后重试');
    }
  };

  // 支付
  const pay = async (payload: PaymentPayload) => {
    if (!(await checkInstall())) return;
    try {
      const result = await WeChat.pay(payload);
      // 注意：这里的 result 可能不代表最终支付结果，最终结果请以服务器异步通知和 DeviceEventEmitter 监听为准
      console.log('支付请求已发送', result);
      return result;
    } catch (e) {
      console.error('支付请求失败', e);
      Alert.alert('支付失败', '无法调起微信支付');
    }
  };

  return {
    isWXAppInstalled: WeChat.isWXAppInstalled,
    sendAuthRequest,
    shareWebpage,
    pay,
  };
}
