# 微信 SDK 集成调试指南

## 问题描述
应用中有微信 app，但是 WeChat SDK 检测不到微信已安装。

## 根本原因
微信 SDK 需要验证应用的签名以确保安全性。当应用签名与微信开放平台注册的签名不匹配时，SDK 会拒绝识别微信应用已安装，即使微信确实已安装。

## 解决步骤

### 1. 获取应用签名信息

当应用启动时，会自动在 Logcat 中打印签名信息。查看日志：

```bash
# 从 Android Studio 或终端查看
adb logcat | grep "WeChat-Integration"
```

你会看到类似的输出：
```
I/WeChat-Integration: ==================================================
I/WeChat-Integration: Package: com.dazhiyouqiu.app
I/WeChat-Integration: SHA1 Signature: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
I/WeChat-Integration: MD5 Signature: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
I/WeChat-Integration: ==================================================
```

### 2. 查看应用日志获取签名

也可以在 React Native 运行时调用以下代码查看签名（自动在 ProfileScreen 初始化时执行）：

```javascript
// ProfileScreen.tsx 中会自动打印，查看控制台输出
console.log('WeChat Integration Debug Info:');
console.log(`Package Name: ${info.packageName}`);
console.log(`SHA1: ${info.sha1}`);
console.log(`MD5: ${info.md5}`);
```

### 3. 在微信开放平台注册应用

1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 使用开发者账号登录
3. 创建/编辑移动应用
4. 在 Android 应用信息中：
   - **应用签名（SHA1）**: 使用上面获取的 SHA1 值
   - **应用包名**: `com.dazhiyouqiu.app`
   - **确保这两个值完全匹配**

### 4. 调试签名验证

#### 方法 A：使用调试签名（开发）
- 使用项目中的 `android/app/debug.keystore` 生成 APK
- 获取该签名的 SHA1 和 MD5
- 在微信开放平台注册该签名
- 这样开发阶段就能测试微信功能

#### 方法 B：使用发布签名（生产）
- 使用你的发布签名生成 APK
- 获取发布签名的 SHA1 和 MD5
- 在微信开放平台注册发布签名
- 确保发布的 APK 使用相同的签名

### 5. 验证修复

修复后，重新编译和安装应用：

```bash
# 清理构建
cd android
./gradlew clean

# 重新构建并安装
./gradlew installDebug

# 或使用 React Native CLI
react-native run-android
```

然后：
1. 打开应用
2. 导航到 ProfileScreen（"我的" 页面）
3. 查看 Logcat 和 React Native 控制台输出
4. 确认签名信息无误
5. 验证 WeChat 登录按钮是否从"未安装微信"变为"微信登录"

## 关键文件

### Android 端实现
- `SignatureUtils.kt` - 获取签名的工具类
- `SignatureModule.kt` - React Native 原生模块
- `SignaturePackage.kt` - 模块注册包
- `MainApplication.kt` - 应用启动时打印签名

### React Native 端
- `src/utils/signatureUtils.ts` - TypeScript 封装
- `src/screens/ProfileScreen.tsx` - 使用签名工具的屏幕

## 常见问题

### Q: 为什么应用签名会不同？
A: 调试签名、发布签名、CI/CD 生成的签名都可能不同。确保使用一致的签名和 keystore 文件。

### Q: 如何确认 APK 使用了正确的签名？
A: 可以使用以下命令验证 APK 签名：
```bash
keytool -printcert -jarfile app-debug.apk
# 或
keytool -printcert -jarfile app-release.apk
```

### Q: 微信检测仍然失败怎么办？
A: 
1. 检查 AndroidManifest.xml 中是否添加了 queries 权限
2. 确保 WXEntryActivity 正确配置
3. 确认微信 AppID 正确
4. 查看完整的 Logcat 输出寻找具体错误

## 需要的权限

已在 AndroidManifest.xml 中添加：
- `android.permission.INTERNET` - 网络权限
- `android.permission.ACCESS_NETWORK_STATE` - 检查网络状态
- `<queries><package android:name="com.tencent.mm" /></queries>` - 用于检测微信应用（Android 11+）

## 技术细节

微信 SDK 验证流程：
1. 应用调用 `registerApp(appId)` 时，SDK 计算应用签名
2. SDK 向微信开放平台服务器验证签名
3. 如果签名匹配，SDK 允许检测微信应用
4. 如果签名不匹配，`isWXAppInstalled()` 返回 false

## 参考资源

- [微信开放平台文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html)
- [react-native-wechat-lib 文档](https://github.com/react-native-wechat/react-native-wechat-lib)
- [Android 应用签名文档](https://developer.android.com/studio/publish/app-signing)
