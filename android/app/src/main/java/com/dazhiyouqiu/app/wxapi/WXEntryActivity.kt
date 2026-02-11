package com.dazhiyouqiu.app.wxapi

import android.app.Activity
import android.os.Bundle
import com.dazhiyouqiu.app.wechat.WechatLoginModule

class WXEntryActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    WechatLoginModule.handleIntent(intent)
    finish()
  }
}
