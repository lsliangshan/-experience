<template>
  <div class="play_music_container">
    <div class="play_music_container_bg" :style="{backgroundImage: 'url(' + playOptions.album.picUrl + ')'}"></div>
    <div class="play_music_content">
      <div class="album_container">
        <div class="album_pic_container" :style="{animationPlayState: (audio.play ? 'running' : 'paused')}">
          <img class="album_pic" :src="playOptions.album.picUrl">
        </div>
      </div>
      <p class="music_name" v-text="playOptions.name"></p>
      <p class="music_author" v-text="playOptions.author.name"></p>
    </div>
    <div class="play_music_control_container">
      <div class="play_music_control_bg"></div>
      <div class="play_music_control_content">
        <div class="play_btns">
          <a href="javascript: void(0)" class="prev disabled"></a>
          <a href="javascript: void(0)" class="play" v-if="!audio.play" @click="play"></a>
          <a href="javascript: void(0)" class="pause" v-else @click="pause"></a>
          <a href="javascript: void(0)" class="next disabled"></a>
        </div>
      </div>
    </div>
    <audio :ref="audioRef" autoplay loop :src="playOptions.url"></audio>
  </div>
</template>
<style scoped>
  @keyframes rotate {
    0% {
      -webkit-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  .play_music_container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .play_music_container_bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    background-size: cover;
    background-attachment: fixed;
    background-position: 50% 50%;
    filter: blur(150px);
  }
  .play_music_content {
    width: 100%;
    height: 100%;
    color: #ffffff;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .album_container {
    width: 240px;
    height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .album_pic_container {
    width: 220px;
    height: 220px;
    border-radius: 110px;
    overflow: hidden;
    -webkit-animation: rotate 20s infinite linear;
    -o-animation: rotate 20s infinite linear;
    animation: rotate 20s infinite linear;
    -webkit-box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.3);
    -moz-box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.3);
  }
  .album_pic {
    width: 220px;
    height: 220px;
  }
  .music_name {
    margin-top: 10px;
    font-size: 30px;
    font-weight: 200;
  }
  .music_author {
    font-size: 14px;
    margin-top: 15px;
    color: #f5f5f5;
    font-weight: 200;
  }

  .play_music_control_container {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 9;
    width: 100%;
    height: 53px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .play_music_control_bg {
    position: absolute;
    width: 100%;
    height: 53px;
    z-index: 0;
    background: url('http://static.dei2.com/experience/playbar.png') no-repeat 0 9999px;
    background-position: 0 0;
    background-repeat: repeat-x;
  }
  .play_music_control_content {
    z-index: 1;
    width: 90%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .play_btns {
    width: 137px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
  }
  .play_btns a {
    display: block;
    margin-right: 8px;
    width: 28px;
    height: 28px;
    background: url('http://static.dei2.com/experience/playbar.png') no-repeat 0 9999px;
  }
  .play_btns a.disabled {
    opacity: 0.1;
    cursor: not-allowed;
  }
  .play_btns a.disabled:hover {
    opacity: 0.1;
  }
  .play_btns .prev {
    background-position: 0 -130px;
  }
  .play_btns .prev:hover {
    background-position: -30px -130px;
  }
  .play_btns .prev.disabled:hover {
    background-position: 0 -130px;
  }
  .play_btns .play {
    width: 36px;
    height: 36px;
    background-position: 0 -204px;
  }
  .play_btns .play:hover {
    background-position: -40px -204px;
  }
  .play_btns .play.disabled:hover {
    background-position: 0 -204px;
  }
  .play_btns .pause {
    width: 36px;
    height: 36px;
    background-position: 0 -165px;
  }
  .play_btns .pause:hover {
    background-position: -40px -165px;
  }
  .play_btns .pause.disabled:hover {
    background-position: 0 -165px;
  }
  .play_btns .next {
    background-position: -80px -130px;
  }
  .play_btns .next:hover {
    background-position: -110px -130px;
  }
  .play_btns .next.disabled:hover {
    background-position: -80px -130px;
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
        audioRef: 'audio-ref',
        playOptions: {
          author: {},
          album: {}
        },
        audio: {
          play: true,
          ele: null
        }
      }
    },
    created () {
      this.playOptions = Object.assign({}, this.options)
      this.$nextTick(() => {
        this.audio.ele = this.$refs[this.audioRef]
        this.play()
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
      },
      play () {
        if (this.audio.ele.paused) {
          this.audio.ele.play()
          this.audio.play = true
        }
      },
      pause () {
        if (!this.audio.ele.paused) {
          this.audio.ele.pause()
          this.audio.play = false
        }
      }
    },
    watch: {
      'options.id': function (val) {
        this.playOptions = Object.assign({}, this.options)
        this.play()
      }
    },
    components: {}
  }
</script>
