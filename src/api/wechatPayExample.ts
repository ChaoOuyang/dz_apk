/**
 * 微信支付使用示例
 * 
 * 这个文件展示了如何在你的项目中使用微信支付功能
 */

import { wechatPayService, getWechatPayParams } from './index';
import { Alert } from 'react-native';

/**
 * 示例 1: 使用完整流程进行支付（推荐）
 */
export async function exampleCompletePaymentFlow(activityId: number) {
  try {
    console.log('示例 1: 完整支付流程');
    
    const result = await wechatPayService.processPayment({
      activityId,
      type: 1,
      privateInsurance: 0,
      phone: '13800000000',
      name: '张三',
      idCard: '110101200001011234',
    });

    if (result.success) {
      console.log('支付成功');
      Alert.alert('成功', '支付完成，已成功报名');
    } else {
      console.log('支付失败:', result.message);
      if (result.errorCode !== -1) {
        Alert.alert('失败', result.message);
      }
    }
  } catch (error) {
    console.error('支付异常:', error);
    Alert.alert('错误', '支付过程中出现异常');
  }
}

/**
 * 示例 2: 分步骤进行支付
 */
export async function exampleStepByStepPayment(activityId: number) {
  try {
    console.log('示例 2: 分步骤支付流程');
    
    // 第一步: 检查微信是否安装
    console.log('第一步: 检查微信是否安装...');
    const isInstalled = await wechatPayService.isWechatInstalled();
    
    if (!isInstalled) {
      Alert.alert('提示', '您需要安装微信才能进行支付');
      return;
    }
    
    console.log('微信已安装');
    
    // 第二步: 从后端获取支付参数
    console.log('第二步: 从后端获取支付参数...');
    const payParams = await getWechatPayParams({
      activityId,
      type: 1,
      privateInsurance: 0,
      phone: '13800000000',
      name: '张三',
      idCard: '110101200001011234',
    });
    
    if (!payParams) {
      Alert.alert('失败', '无法获取支付信息');
      return;
    }
    
    console.log('成功获取支付参数');
    
    // 第三步: 发起支付
    console.log('第三步: 发起支付...');
    const result = await wechatPayService.pay(payParams);
    
    if (result.success) {
      console.log('支付成功');
      Alert.alert('成功', '支付完成');
    } else {
      console.log('支付失败:', result.message);
      if (result.errorCode !== -1) {
        Alert.alert('失败', result.message);
      }
    }
  } catch (error) {
    console.error('支付异常:', error);
    Alert.alert('错误', '支付过程中出现异常');
  }
}

/**
 * 示例 3: 带重试机制的支付
 */
export async function examplePaymentWithRetry(
  activityId: number,
  maxRetries: number = 3
) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`示例 3: 支付重试 (${attempt}/${maxRetries})`);
      
      const result = await wechatPayService.processPayment({
        activityId,
        type: 1,
        privateInsurance: 0,
        phone: '13800000000',
        name: '张三',
        idCard: '110101200001011234',
      });

      if (result.success) {
        console.log('支付成功');
        Alert.alert('成功', '支付完成');
        return result;
      } else if (result.errorCode === -1) {
        // 用户取消，不再重试
        console.log('用户取消支付');
        return result;
      } else {
        // 其他失败，进行重试
        lastError = new Error(result.message);
        console.warn(`第 ${attempt} 次尝试失败:`, result.message);
        
        if (attempt < maxRetries) {
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    } catch (error) {
      lastError = error as Error;
      console.error(`第 ${attempt} 次尝试异常:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  // 所有重试都失败了
  console.error('支付失败，已达最大重试次数');
  Alert.alert('失败', lastError?.message || '支付失败，请重试');
  
  return {
    success: false,
    message: lastError?.message || 'Max retries exceeded',
    errorCode: -99,
  };
}

/**
 * 示例 4: 在 React 组件中使用支付
 */
export function useWechatPayment() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePayment = async (activityId: number) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await wechatPayService.processPayment({
        activityId,
        type: 1,
        privateInsurance: 0,
        phone: '13800000000',
        name: '张三',
        idCard: '110101200001011234',
      });

      if (result.success) {
        // 支付成功，更新本地状态或调用后端 API
        console.log('支付成功，更新本地状态...');
        // await updateActivitySignupStatus(activityId);
      }

      return result;
    } catch (error) {
      console.error('支付异常:', error);
      return {
        success: false,
        message: '支付异常',
        errorCode: -99,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handlePayment };
}

// 注意: useWechatPayment 需要导入 React
import React from 'react';

/**
 * 示例 5: 获取用户信息并进行支付
 * 
 * 如果用户信息来自 Redux 或 Context，可以这样使用：
 */
export async function examplePaymentWithUserInfo(
  activityId: number,
  userInfo: {
    phone: string;
    name: string;
    idCard: string;
  }
) {
  try {
    console.log('示例 5: 使用用户信息进行支付');
    
    const result = await wechatPayService.processPayment({
      activityId,
      type: 1,
      privateInsurance: 0,
      phone: userInfo.phone,
      name: userInfo.name,
      idCard: userInfo.idCard,
    });

    if (result.success) {
      console.log('支付成功');
      Alert.alert('成功', '支付完成');
    } else {
      console.log('支付失败:', result.message);
    }

    return result;
  } catch (error) {
    console.error('支付异常:', error);
    throw error;
  }
}

/**
 * 运行示例
 * 
 * 取消下面的注释来运行对应的示例
 */

// 当应用启动时运行示例
// if (__DEV__) {
//   // 示例 1: 完整支付流程
//   // exampleCompletePaymentFlow(673509);
//   
//   // 示例 2: 分步骤支付
//   // exampleStepByStepPayment(673509);
//   
//   // 示例 3: 带重试机制的支付
//   // examplePaymentWithRetry(673509);
// }
