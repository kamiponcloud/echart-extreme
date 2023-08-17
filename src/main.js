import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import router from './route/index.js'
const app = createApp(App)
app.use(ElementPlus).use(router).mount('#app')

