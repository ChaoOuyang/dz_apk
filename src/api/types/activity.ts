/**
 * 活动相关的类型定义
 */

export interface ActivitySignupParams {
  activity_id: number;
  fromId?: number;
  inviteId?: number;
  iv?: string;
  code?: string;
  encryptedData?: string;
}

// 活动基础信息
export interface Activity {
  id: number;
  activeDate: number;
  bollPark: string;
  parkFormat: string;
  localtion: string;
  latitude: string;
  longitude: string;
  remark: string;
  originatorId: number;
  status: number;
  limitNum: number;
  signupNum: number;
  leave: number;
  list: number;
  headimgurl: string;
  linkimgurl: string;
  group_head: any[];
  memberHeadLink: any[];
  isinform: number;
  iscancel: number;
  demand: number;
  allowChoose: number;
  payActivityId: number;
  queneInform: number;
  permission: any;
  createTime: number;
  labels: string;
  readNum: number;
  isBrand: number;
  isTop: number;
  openInsurance: number;
  signDeadline: number;
  phone: string;
  index: number;
  love: number;
  hate: number;
  message: number;
  distance: any;
  date: string;
  originatorName: string;
  description: string;
  time: string;
  signupCount: string;
  reason: any;
  chargeDetail: any;
  teamInfo: any;
  deadlineDescription: any;
  deadlineDate: any;
  deadlineTime: any;
  deadline: any;
  remarkShow: any;
  userExtraData: any;
  extraData: any;
  data: Record<string, any>;
}

// 球队信息
export interface TeamInfo {
  id: number;
  captainId: number;
  headImg: string;
  name: string;
  place: string;
  age: string;
  foundTime: string;
  introduce: string;
  slogan: any;
  treaty: number;
  treatyContent: any;
  couren: number;
  courenContent: any;
  search: number;
  label: any;
  createTime: number;
  isDelete: number;
  data: Record<string, any>;
}

// 消息信息
export interface Message {
  id: number;
  user_id: number;
  name: string;
  reply_name: string;
  img: string;
  content: string;
  videoPic: any;
  reply: any[];
  time: string;
  issignup: number;
  type: number;
  hasPhone: number;
  phone: any;
  wechat: any;
  playNum: number;
  unbelievableNum: number;
  img_list: any;
  top: number;
  applyActivityId: number;
  data: Record<string, any>;
}

// 收费信息
export interface ChargeActivity {
  id: number;
  activityId: number;
  userId: number;
  type: number;
  income: number;
  deposit: number;
  doveFee: number;
  doveType: number;
  openVip: number;
  vip0: number;
  vip1: number;
  vip2: number;
  vip3: number;
  status: number;
  time: string;
  activityDate: string;
  place: string;
  remark: any;
  prePrice: number;
  afterPrice: number;
}

// 报名人员
export interface Signuper {
  id: number;
  name: string;
  nickname: string;
  count: number;
  num: number;
  time: any;
  joinTime: any;
  headimgurl: string;
  phone: any;
  unbelievable: number;
  isLoveOrHate: number;
  type: any;
  enable: number;
  fans: number;
  follow: number;
  level: number;
  isRobot: number;
  data: any;
}

// 用户分账信息
export interface UserDivideValue {
  divide: any;
  allowChoose: number;
}

// 发起人等级信息
export interface OriginatorPersonTime {
  level: number;
  num: number;
}

// 活动报名响应
export interface ActivitySignupResponse {
  isSignup: string;
  userDivideValue: UserDivideValue;
  noDividies: any[];
  isArrange: boolean;
  chargeType: number;
  isPermission: number;
  type: number;
  chargeMember: any;
  chargeMembersNum: number;
  addChatPopup: boolean;
  relate: any;
  isDivide: number;
  activityPrice: number;
  isConfirm: number;
  leave: number;
  ownTeam: TeamInfo[];
  recruitNum: number;
  isOfficialUser: boolean;
  addWechat: boolean;
  respMessage: string;
  index: number;
  fixPayNum: number;
  chargeDove: boolean;
  originatorIndex: number;
  treatyContent: any;
  needPay: number;
  isBrandUser: boolean;
  messages: Message[];
  chargeActivity: ChargeActivity;
  isAdminUser: boolean;
  applyStatus: number;
  myPayStatus: number;
  originatorPersonTime: OriginatorPersonTime;
  wait: number;
  activity: Activity;
  addChatSwitch: boolean;
  chargeStatus: number;
  isInvite: number;
  iSsubscribe: boolean;
  chargeRemark: any;
  divides: any[];
  duty_signupers: any[];
  signupers: Signuper[];
  authentication: any;
  blaklist: number;
  isOriginator: boolean;
  team: TeamInfo;
  recruitStatus: number;
  insurancePrice: number;
  notice_signupers: any[];
  undetermined: number;
  relateServer: Record<string, any>;
  isQuene: boolean;
  apply_num: number;
  isTreaty: number;
  signup_cancel: any[];
  respCode: string;
}
