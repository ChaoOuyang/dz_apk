package com.dazhiyouqiu.app.wechat

import android.content.Intent
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.tencent.mm.opensdk.modelbase.BaseReq
import com.tencent.mm.opensdk.modelbase.BaseResp
import com.tencent.mm.opensdk.modelmsg.SendAuth
import com.tencent.mm.opensdk.openapi.IWXAPI
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler
import com.tencent.mm.opensdk.openapi.WXAPIFactory

class WechatLoginModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), IWXAPIEventHandler {
    
    private var api: IWXAPI? = null
    private var appId: String? = null
    
    companion object {
        private const val MODULE_NAME = "WechatLogin"
        private const val NOT_REGISTERED = "registerApp required."
        
        private val modules = mutableListOf<WechatLoginModule>()
        
        @JvmStatic
        fun handleIntent(intent: Intent) {
            modules.forEach { module ->
                module.api?.handleIntent(intent, module)
            }
        }
    }
    
    override fun getName(): String = MODULE_NAME
    
    override fun initialize() {
        super.initialize()
        modules.add(this)
    }
    
    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        api = null
        modules.remove(this)
    }
    
    @ReactMethod
    fun registerApp(appId: String, universalLink: String, callback: Callback) {
        this.appId = appId
        api = WXAPIFactory.createWXAPI(reactApplicationContext.baseContext, appId, true)
        val result = api?.registerApp(appId) ?: false
        callback.invoke(null, result)
    }
    
    @ReactMethod
    fun isWXAppInstalled(callback: Callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED)
            return
        }
        callback.invoke(null, api?.isWXAppInstalled)
    }
    
    @ReactMethod
    fun isWXAppSupportApi(callback: Callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED)
            return
        }
        callback.invoke(null, api?.wxAppSupportAPI)
    }
    
    @ReactMethod
    fun getApiVersion(callback: Callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED)
            return
        }
        callback.invoke(null, api?.wxAppSupportAPI)
    }
    
    @ReactMethod
    fun openWXApp(callback: Callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED)
            return
        }
        callback.invoke(null, api?.openWXApp())
    }
    
    @ReactMethod
    fun sendAuthRequest(scope: String, state: String, callback: Callback) {
        if (api == null) {
            callback.invoke(NOT_REGISTERED)
            return
        }
        val req = SendAuth.Req()
        req.scope = scope
        req.state = state
        val result = api?.sendReq(req) ?: false
        callback.invoke(null, result)
    }
    
    // 微信回调处理
    override fun onReq(req: BaseReq?) {
        req?.let {
            val map = Arguments.createMap().apply {
                putString("openId", it.openId)
                putString("transaction", it.transaction)
            }
            sendEvent("WeChat_Req", map)
        }
    }
    
    override fun onResp(resp: BaseResp?) {
        resp?.let {
            val map = Arguments.createMap().apply {
                putInt("errCode", it.errCode)
                putString("errStr", it.errStr)
                putString("openId", it.openId)
                putString("transaction", it.transaction)
                
                if (it is SendAuth.Resp) {
                    putString("type", "SendAuth.Resp")
                    putString("code", it.code)
                    putString("state", it.state)
                    putString("url", it.url)
                    putString("lang", it.lang)
                    putString("country", it.country)
                }
            }
            sendEvent("WeChat_Resp", map)
        }
    }
    
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
