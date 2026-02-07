/**
 * 微信支付参数 Mock 数据
 * 
 * 用于开发和测试时，当后端接口不可用时，可以使用此 mock 数据
 */

import type { WechatPayResponse } from '../types';

export const WECHAT_PAY_PARAMS_MOCK: WechatPayResponse = {
  appid: 'wx159d41be98ce4c90',
  partnerid: 'mock_partner_id',
  prepayid: 'wx07210330947181c71e5a7c16e638420000',
  noncestr: '263e27f60a5f4f2d97428606ef0f45b5',
  timestamp: '1770469411',
  sign: 'TF9N6gNRVUTYXbIue/j+eKfP0q5T9MbS5HtDl2I3IBFTROFI+tFy+Vm7wsKQvspMnTE0kEIFZjzexB1CvX9nmtmq1DWCW28SDSfiSLnX7KRuUMG1zxknZzLexQrOyB4pGM+jtPE131d9MjG2wm/AhIadqW1I3ayfjYeDPtKCz+o8tKesQ0BATB5XGc5TfZ0TK8CdolTQ0HDErFezReIEfhlsU15SeKQDAGc25etrNpUgjoxoXJihwMCo6HejeR2Ut6KoqPtOE4E/mPnf4onWke9G5QdIUXakBYXNMI+XUGAauy61LgrjAVDHYPbrvc/ZwBMlyE5pvCy1eD+h6yVj2Q==',
  package: 'prepay_id=wx07210330947181c71e5a7c16e638420000',
};

/**
 * 获取微信支付参数 Mock 数据
 * 
 * @returns 微信支付参数 Mock 数据
 */
export function getWechatPayParamsMock(): WechatPayResponse {
  return JSON.parse(JSON.stringify(WECHAT_PAY_PARAMS_MOCK));
}
