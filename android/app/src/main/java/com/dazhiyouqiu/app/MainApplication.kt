package com.dazhiyouqiu.app

import android.app.Application
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.theweflex.react.WeChatPackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(WeChatPackage())
          add(SignaturePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    
    // 打印签名信息用于微信集成调试
    printSignatureInfo()
  }
  
  private fun printSignatureInfo() {
    val sha1 = SignatureUtils.getSignatureSHA1(this)
    val md5 = SignatureUtils.getSignatureMD5(this)
    Log.i("WeChat-Integration", "=".repeat(50))
    Log.i("WeChat-Integration", "Package: ${packageName}")
    Log.i("WeChat-Integration", "SHA1 Signature: $sha1")
    Log.i("WeChat-Integration", "MD5 Signature: $md5")
    Log.i("WeChat-Integration", "=".repeat(50))
  }
}
