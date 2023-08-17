const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // 关闭eslint检查
  lintOnSave: false,
  transpileDependencies: true,
  // 端口号
  devServer: {
    port: 8081
  }
})
