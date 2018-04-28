<template>
  <div class="home_container">
    <transition name="fade">
      <component :is="currentCommand" :options="commandOptions" :current-user="currentUser"></component>
    </transition>
  </div>
</template>
<style scoped>
  .home_container {
    width: 100%;
    height: 100%;
    background-color: #ffffff;
  }
</style>
<script>
  const electron = require('electron')
  export default {
    name: 'Home',
    data () {
      return {
        currentUser: {},
        currentCommand: 'NoCommand',
        commandOptions: {}
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

      setTimeout(() => {
        this.currentCommand = 'play-music'
        this.commandOptions = {
          name: '夜空中最亮的星',
          url: 'http://m10.music.126.net/20180428175535/ceb19a975b93df269aedac8f2cd4dcab/ymusic/67a7/1920/cad6/a19f11f01c2fc0c7ead033b2ace15eb7.mp3'
        }
      }, 3000)
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
    components: {
      NoCommand: () => import('./commands/NoCommand.vue'),
      PlayMusic: () => import('./commands/PlayMusic.vue')
    }
  }
</script>
