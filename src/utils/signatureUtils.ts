import { NativeModules, Platform } from 'react-native';

/**
 * 签名工具 - 用于获取应用签名信息，便于微信集成调试
 */

const SignatureModule = NativeModules.SignatureModule;

interface SignatureInfo {
  packageName: string;
  sha1: string;
  md5: string;
}

/**
 * 获取应用签名信息
 * @returns Promise<SignatureInfo>
 */
export async function getSignatureInfo(): Promise<SignatureInfo | null> {
  if (!SignatureModule) {
    console.warn('SignatureModule not available');
    return null;
  }

  try {
    const info = await SignatureModule.getSignatureInfo();
    return info;
  } catch (error) {
    console.error('Failed to get signature info:', error);
    return null;
  }
}

/**
 * 获取 SHA1 签名
 * @returns Promise<string>
 */
export async function getSHA1(): Promise<string | null> {
  if (!SignatureModule) {
    console.warn('SignatureModule not available');
    return null;
  }

  try {
    const sha1 = await SignatureModule.getSHA1();
    return sha1;
  } catch (error) {
    console.error('Failed to get SHA1:', error);
    return null;
  }
}

/**
 * 获取 MD5 签名
 * @returns Promise<string>
 */
export async function getMD5(): Promise<string | null> {
  if (!SignatureModule) {
    console.warn('SignatureModule not available');
    return null;
  }

  try {
    const md5 = await SignatureModule.getMD5();
    return md5;
  } catch (error) {
    console.error('Failed to get MD5:', error);
    return null;
  }
}

/**
 * 打印签名信息到控制台（用于调试）
 */
export async function printSignatureDebugInfo(): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('Signature debug info only available on Android');
    return;
  }

  const info = await getSignatureInfo();
  if (info) {
    console.log('='.repeat(50));
    console.log('WeChat Integration Debug Info:');
    console.log(`Package Name: ${info.packageName}`);
    console.log(`SHA1: ${info.sha1}`);
    console.log(`MD5: ${info.md5}`);
    console.log('='.repeat(50));
  }
}
