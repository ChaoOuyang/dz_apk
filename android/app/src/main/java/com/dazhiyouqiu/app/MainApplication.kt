package com.dazhiyouqiu.app

import android.app.Application
import android.content.Context
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.soloader.SoLoader
import com.wechatlib.WeChatLibPackage // 导入微信包

class MainApplication : Application(), ReactApplication {

  private val mReactNativeHost: ReactNativeHost = object : ReactNativeHost(this@MainApplication) {
    override fun getPackages(): List<ReactPackage> {
      val packages: MutableList<ReactPackage> = PackageList(this@MainApplication).packages
      // Packages that cannot be autolinked yet can be added manually here, for example:
      // packages.add(MyReactNativePackage())
      packages.add(WeChatLibPackage())
      return packages
    }

    override fun getJSMainModuleName(): String {
      return "index"
    }

    override fun getUseDeveloperSupport(): Boolean {
      return BuildConfig.DEBUG
    }
  }

  override fun getReactNativeHost(): ReactNativeHost {
    return mReactNativeHost
  }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }
}
