'use strict'

import { app, BrowserWindow, ipcMain, Notification } from 'electron'

import axios from 'axios'
import querystring from 'querystring'
import jwt from 'jsonwebtoken'

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db.json')
const db = low(adapter)

db.defaults({
  user: [],
  currentUser: {}
}).write()

const instance = axios.create({
  timeout: 3000
})

// const REQUEST_BASE_URL = 'https://talkapi.dei2.com'
const REQUEST_BASE_URL = 'http://127.0.0.1:3001'
const secret = 'com.dei2'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
let checkLogin = false
let loginWindow
global.currentUser = {}

function createLoginWindow (args) {
  loginWindow = new BrowserWindow({
    width: 250,
    height: 390,
    show: false,
    // parent: mainWindow,
    model: true,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      devTools: false
    }
  })
  // loginWindow.loadURL('http://m.zhaopin.com/account/login?prevUrl=http%3A//m.zhaopin.com/');
  loginWindow.loadURL(`http://localhost:9080/login`)

  // const macaddress = require('macaddress')
  // macaddress.all(function (err, all) {
  //   if (err) {
  //     console.log('>>>>>>> error: ', err.message)
  //   }
  //   console.log('====2====', all.utun1.mac, JSON.stringify(all, null, 2))
  // })
  // console.log('====2====', JSON.stringify(macaddress.networkInterfaces(), null, 2))
  // loginWindow.on('closed', () => {
  //   // loginWindow = null
  //   if (checkLogin) {
  //     mainWindow.show()
  //   }
  // })
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow(({
    width: 850,
    height: 700,
    useContentSize: true,
    show: false,
    webPreferences: {
      devTools: true
    }
  }))

  mainWindow.loadURL(winURL)

  // mainWindow.on('closed', () => {
  //   mainWindow = null
  // })

  createLoginWindow()

  global.currentUser = db.get('currentUser').value()
  if (global.currentUser && global.currentUser.username) {
    let _loginToken = db.get('user').find({username: global.currentUser.username}).value().token
    if (_loginToken) {
      let _status = jwt.verify(_loginToken, secret, (err, decoded) => {
        return err || {}
      })
      if (!_status.name) {
        // 登录成功
        checkLogin = true
      } else {
        // token验证失败, 'TokenExpiredError': 失效; 'JsonWebTokenError': token格式不正确
        checkLogin = false
      }
    } else {
      checkLogin = false
    }
  }
  if (checkLogin) {
    mainWindow.show()
  } else {
    loginWindow.show()
  }

  // mainWindow = new BrowserWindow({
  //   // height: 850
  //   // , width: 1000
  //     width: 250
  //   , height: 390
  //   , useContentSize: true
  //   // frame: false,
  //   // transparent: true,
  //   , show: false
  // })
  //
  // mainWindow.loadURL(winURL)
  //
  // mainWindow.on('closed', () => {
  //   mainWindow = null
  // })
  // !checkLogin && createLoginWindow({
  //   show: !checkLogin
  // });
  // mainWindow.once('ready-to-show', () => {
  //   mainWindow.show()
  // })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

let cacheLoginStatus = false

ipcMain.on('logout', () => {
  db.get('user')
    .find({
      username: global.currentUser.username
    })
    .assign({
      token: ''
    })
    .write()
  global.currentUser.token = ''
  db.get('currentUser')
    .assign(global.currentUser)
    .write()
  checkLogin = false
  loginWindow.show()
  mainWindow.hide()
})

ipcMain.on('login', async res => {
  let outStatus = {}
  if (!res.username || res.username.trim() === '') {
    outStatus = {
      status: 401,
      message: '用户名不能为空'
    }
  } else if (!res.password || res.password.trim() === '') {
    outStatus = {
      status: 401,
      message: '密码不能为空'
    }
  } else {
    // 去登录
    let loginData = await instance({
      method: 'POST',
      baseURL: REQUEST_BASE_URL,
      url: '/Kapi/index/login',
      data: querystring.stringify(res)
    })
    outStatus = loginData.data
    if (outStatus.status === 200) {
      // 登录成功
      cacheLoginStatus = true
      // 缓存登录的用户信息
      let _loginInfo = loginData.data.data
      let _oldUser = db.get('user')
        .find({
          username: _loginInfo.username
        })
        .value()
      if (_oldUser) {
        db.get('user')
          .find({
            username: _loginInfo.username
          })
          .assign(_loginInfo)
          .write()
      } else {
        db.get('user')
          .push(_loginInfo)
          .write()
      }
      global.currentUser = _loginInfo
      // 更新当前用户名
      db.update('currentUser', () => _loginInfo).write()
    } else {
      let notification = new Notification({
        title: '通知',
        subtitle: '通知子标题',
        body: outStatus.message
      })
      notification.show()
    }
  }
  ipcMain.emit('login-status', outStatus)
})

ipcMain.on('close-login-window', () => {
  if (cacheLoginStatus) {
    checkLogin = true
    loginWindow.hide()
    mainWindow.show()
  }
})

// ipcMain.on('download', (args) => {
//   console.log('>>>>>>>>>', args)
//   let downloadpath = args.url
//   let folderpath = args.path
//   // evt.send('tips', downloadpath)
//   mainWindow.webContents.downloadURL(downloadpath)
//
//   mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
//     console.log('===== will download')
//     item.setSavePath(folderpath + `\\${item.getFilename()}`)
//
//     item.once('done', (event, state) => {
//       if (state === 'completed') {
//         console.log('Download successfully')
//       } else {
//         console.log(`Download failed: ${state}`)
//       }
//     })
//   })
// })
