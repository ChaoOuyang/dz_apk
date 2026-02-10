package com.dazhiyouqiu.app

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

/**
 * 签名模块 Package - 用于注册 SignatureModule
 */
class SignaturePackage : TurboReactPackage() {
    override fun getModule(
        name: String,
        reactContext: ReactApplicationContext
    ): NativeModule? {
        return when (name) {
            "SignatureModule" -> SignatureModule(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val modules: MutableMap<String, ReactModuleInfo> = mutableMapOf()
            modules["SignatureModule"] = ReactModuleInfo(
                name = "SignatureModule",
                className = SignatureModule::class.java.name,
                canOverrideExistingModule = false,
                needsEagerInit = false,
                isCxxModule = false,
                isTurboModule = true
            )
            modules
        }
    }
}
