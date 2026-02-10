package com.dazhiyouqiu.app

import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Dazhiyouqiu"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
  
  override fun onResume() {
    super.onResume()
    // 打印应用签名信息，用于微信集成调试
    val sha1 = SignatureUtils.getSignatureSHA1(this)
    val md5 = SignatureUtils.getSignatureMD5(this)
    Log.d("WeChatDebug", "Package: ${packageName}")
    Log.d("WeChatDebug", "SHA1: $sha1")
    Log.d("WeChatDebug", "MD5: $md5")
  }
}
