/**
 * 静态文本字符串常量
 * 用于国际化和应用中的硬编码文本
 */

export const STRINGS = {
  // 通用
  common: {
    ok: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    back: '返回',
    loading: '加载中...',
    error: '出错了',
    success: '成功',
    warning: '警告',
    retry: '重试',
  },

  // 导航标签
  navigation: {
    home: '大志',
    group: '群聊',
    profile: '我的',
  },

  // 首页
  home: {
    title: '大志有球',
    activityList: '活动列表',
    noActivities: '暂无活动',
    signup: '报名',
    loading: '加载活动中...',
    error: '加载活动失败',
    retryLoad: '重新加载',
  },

  // 群聊
  group: {
    title: '群聊',
    myGroups: '我的群',
    createGroup: '创建群聊',
    noGroups: '暂无群聊',
    groupName: '群名称',
    members: '成员',
    messages: '消息',
    addMember: '添加成员',
  },

  // 个人资料
  profile: {
    title: '我的',
    nickname: '昵称',
    phone: '电话',
    email: '邮箱',
    avatar: '头像',
    settings: '设置',
    logout: '退出登录',
  },

  // 活动详情
  activity: {
    title: '活动详情',
    activityName: '活动名称',
    startTime: '开始时间',
    location: '地点',
    description: '活动描述',
    signupCount: '报名人数',
    limit: '人数限制',
    remark: '备注',
    signupSuccess: '报名成功',
    signupFailed: '报名失败',
  },

  // 错误提示
  errors: {
    networkError: '网络错误，请检查您的连接',
    serverError: '服务器错误，请稍后重试',
    validationError: '输入验证失败',
    authError: '认证失败，请重新登录',
    notFound: '未找到相关内容',
    timeout: '请求超时，请重试',
  },
} as const;

export default STRINGS;
