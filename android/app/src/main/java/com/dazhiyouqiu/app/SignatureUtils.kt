package com.dazhiyouqiu.app

import android.content.Context
import android.content.pm.PackageManager
import java.security.MessageDigest

/**
 * 签名工具类 - 用于获取应用签名信息
 * 这个工具可以帮助调试微信 SDK 集成问题
 */
object SignatureUtils {
    /**
     * 获取应用的签名 SHA1
     * @param context 应用上下文
     * @param packageName 包名
     * @return SHA1 签名，格式为 XX:XX:XX... (大写)
     */
    fun getSignatureSHA1(context: Context, packageName: String = context.packageName): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(
                packageName,
                PackageManager.GET_SIGNATURES
            )
            
            val signatures = packageInfo.signatures
            if (signatures == null || signatures.isEmpty()) {
                "No signatures found"
            } else {
                val digest = MessageDigest.getInstance("SHA1")
                val bytes = digest.digest(signatures[0].toByteArray())
                bytes.joinToString(":") { "%02X".format(it) }
            }
        } catch (e: Exception) {
            "Error: ${e.message}"
        }
    }
    
    /**
     * 获取应用的签名 MD5
     * @param context 应用上下文
     * @param packageName 包名
     * @return MD5 签名，格式为 XX:XX:XX... (小写)
     */
    fun getSignatureMD5(context: Context, packageName: String = context.packageName): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(
                packageName,
                PackageManager.GET_SIGNATURES
            )
            
            val signatures = packageInfo.signatures
            if (signatures == null || signatures.isEmpty()) {
                "No signatures found"
            } else {
                val digest = MessageDigest.getInstance("MD5")
                val bytes = digest.digest(signatures[0].toByteArray())
                bytes.joinToString(":") { "%02x".format(it) }
            }
        } catch (e: Exception) {
            "Error: ${e.message}"
        }
    }
}
