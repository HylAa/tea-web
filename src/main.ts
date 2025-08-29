import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import pinia from "./stores";
import "./assets/main.css";

// 初始化应用配置和安全设置
import { initializeConfig } from '@/utils/appConfig'
import { securityManager } from '@/utils/security'

async function initializeApp() {
  try {
    // 初始化配置验证
    initializeConfig()
    
    // 生成 CSRF Token
    securityManager.generateCSRFToken()
    
    // 创建应用实例
    const app = createApp(App)
    
    app.use(router)
    app.use(pinia)
    
    // 在生产环境启用错误处理
    if (import.meta.env.PROD) {
      app.config.errorHandler = (error, instance, info) => {
        console.error('应用错误:', error)
        console.error('错误信息:', info)
        
        // 可以在这里添加错误上报逻辑
        // reportError(error, { instance, info })
      }
    }
    
    app.mount("#app")
    
    console.log('✅ TeaHvh-Web 应用启动成功')
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    
    // 显示友好的错误页面
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f5f5f5;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 400px;
        ">
          <h2 style="color: #e74c3c; margin-bottom: 1rem;">应用启动失败</h2>
          <p style="color: #666; margin-bottom: 1.5rem;">
            应用在初始化过程中遇到问题，请检查配置或联系技术支持。
          </p>
          <button onclick="location.reload()" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
          ">
            重新加载
          </button>
        </div>
      </div>
    `
  }
}

// 启动应用
initializeApp()
