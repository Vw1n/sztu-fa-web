#!/usr/bin/env node

/**
 * 构建前环境变量校验脚本
 * 确保在 Vercel / CI 的 Production 与 Preview 环境下配置正确的 VITE_API_BASE_URL
 */

const vercelEnv = (process.env.VERCEL_ENV || '').trim().toLowerCase();
const buildEnv = (process.env.BUILD_ENV || vercelEnv).trim().toLowerCase();
const apiBaseUrl = (process.env.VITE_API_BASE_URL || '').trim();
const newsMock = (process.env.VITE_ENABLE_NEWS_MOCK || '').trim().toLowerCase();


console.log(`[validate-env] 检测到构建环境 BUILD_ENV/VERCEL_ENV = "${buildEnv || 'local'}"`);
console.log(`[validate-env] VITE_API_BASE_URL = "${apiBaseUrl}"`);

if (buildEnv === 'production') {
  if (!apiBaseUrl) {
    console.error('❌ [Error] 生产环境 (Production) 必须配置 VITE_API_BASE_URL 变量！');
    process.exit(1);
  }
  if (apiBaseUrl.includes('api-dev.sztufa.xyz')) {
    console.error('❌ [Error] 生产环境 (Production) 禁止使用开发 API 地址 (api-dev.sztufa.xyz)！');
    process.exit(1);
  }
  if (newsMock === 'true') {
    console.error('❌ [Error] 生产环境 (Production) 禁止开启 VITE_ENABLE_NEWS_MOCK！');
    process.exit(1);
  }
  console.log('✅ [Check Passed] 生产环境 API 配置验证通过');
} else if (buildEnv === 'preview') {
  if (!apiBaseUrl) {
    console.error('❌ [Error] 预览环境 (Preview) 必须配置 VITE_API_BASE_URL 变量！');
    process.exit(1);
  }
  if (apiBaseUrl === 'https://api.sztufa.xyz/api/v1' || (apiBaseUrl.includes('api.sztufa.xyz') && !apiBaseUrl.includes('api-dev.sztufa.xyz'))) {
    console.error('❌ [Error] 预览环境 (Preview) 禁止使用生产 API 地址 (api.sztufa.xyz)！');
    process.exit(1);
  }
  console.log('✅ [Check Passed] 预览环境 API 配置验证通过');
} else {
  console.log('ℹ️ [validate-env] 本地构建或开发环境，跳过严格 API 配置校验。');
}
