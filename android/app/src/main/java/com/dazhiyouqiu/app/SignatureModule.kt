package com.dazhiyouqiu.app

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

/**
 * React Native 原生模块 - 用于获取应用签名信息
 * 这个模块允许 JavaScript 层调用签名工具获取调试信息
 */
class SignatureModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SignatureModule"

    /**
     * 获取应用签名信息
     * @param promise 回调 Promise
     */
    @ReactMethod
    fun getSignatureInfo(promise: Promise) {
        try {
            val context = reactApplicationContext
            val packageName = context.packageName
            val sha1 = SignatureUtils.getSignatureSHA1(context, packageName)
            val md5 = SignatureUtils.getSignatureMD5(context, packageName)

            val map: WritableMap = Arguments.createMap()
            map.putString("packageName", packageName)
            map.putString("sha1", sha1)
            map.putString("md5", md5)

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERR_SIGNATURE", e.message)
        }
    }

    /**
     * 获取 SHA1 签名
     * @param promise 回调 Promise
     */
    @ReactMethod
    fun getSHA1(promise: Promise) {
        try {
            val sha1 = SignatureUtils.getSignatureSHA1(reactApplicationContext)
            promise.resolve(sha1)
        } catch (e: Exception) {
            promise.reject("ERR_SHA1", e.message)
        }
    }

    /**
     * 获取 MD5 签名
     * @param promise 回调 Promise
     */
    @ReactMethod
    fun getMD5(promise: Promise) {
        try {
            val md5 = SignatureUtils.getSignatureMD5(reactApplicationContext)
            promise.resolve(md5)
        } catch (e: Exception) {
            promise.reject("ERR_MD5", e.message)
        }
    }
}
