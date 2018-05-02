<template>
  <div class="play_music_container">
    <p v-text="options.name"></p>
    <audio :ref="audioRef" :src="options.url"></audio>
  </div>
</template>
<style scoped>
  .play_music_container {
    width: 100%;
    height: 100%;
    background-color: #000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
<script>
  // const electron = require('electron')
  export default {
    name: 'PlayMusic',
    props: {
      options: {
        type: Object,
        default: function () {
          return {}
        }
      }
    },
    data () {
      return {
        audioRef: 'audio-ref'
      }
    },
    created () {
      this.$nextTick(async () => {
        let audio = this.$refs[this.audioRef]
        audio.play()
        /**
          electron.remote.ipcMain.emit('download', {
            url: 'http://m10.music.126.net/20180428175535/ceb19a975b93df269aedac8f2cd4dcab/ymusic/67a7/1920/cad6/a19f11f01c2fc0c7ead033b2ace15eb7.mp3',
            path: './'
          })
         */
      })
    },
    methods: {
      funDownload (filename) {
        // 创建隐藏的可下载链接
        let eleLink = document.createElement('a')
        eleLink.download = filename || '示例音乐'
        eleLink.style.display = 'none'
        eleLink.href = 'http://m10.music.126.net/20180428175535/ceb19a975b93df269aedac8f2cd4dcab/ymusic/67a7/1920/cad6/a19f11f01c2fc0c7ead033b2ace15eb7.mp3'
        document.body.appendChild(eleLink)
        eleLink.click()
        // 然后移除
        document.body.removeChild(eleLink)
      }
    },
    components: {}
  }
</script>
