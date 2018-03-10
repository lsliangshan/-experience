<template>
  <div class="home_container">
    <p>欢迎 {{currentUser.username}} 登录！</p>
    <button @click="logout">退出登录</button>
  </div>
</template>
<style scoped>
  .home_container {
    width: 100%;
    height: 100%;
    background-color: rgba(18,231,255,0.38);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
<script>
  const electron = require('electron')
  export default {
    name: 'Home',
    data () {
      return {
        currentUser: {}
      }
    },
    created () {
      this.$nextTick(() => {
        this.syncCurrentUser()

        electron.remote.ipcMain.on('login-status', res => {
          if (res.status === 200) {
            // 登录成功
            this.syncCurrentUser()
          }
        })
      })
    },
    methods: {
      logout () {
        electron.remote.ipcMain.emit('logout', {})
      },
      syncCurrentUser () {
        let currentUser = electron.remote.getGlobal('currentUser')
        if (currentUser && currentUser.username) {
          this.currentUser = currentUser
        }
      }
    },
    components: {}
  }
</script>
