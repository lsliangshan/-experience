'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'

import axios from 'axios'
import querystring from 'querystring'

const instance = axios.create({
  timeout: 3000
})

const REQUEST_BASE_URL = 'http://127.0.0.1:3000'

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

function createLoginWindow (args) {
  loginWindow = new BrowserWindow({
    width: 250,
    height: 390,
    show: args.show,
    parent: mainWindow,
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

  loginWindow.on('closed', () => {
    loginWindow = null
    if (checkLogin) {
      mainWindow.show()
    }
  })
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow(({
    width: 850,
    height: 900,
    useContentSize: true,
    show: false,
    webPreferences: {
      devTools: false
    }
  }))

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  !checkLogin && createLoginWindow({
    show: true
  })

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
      url: '/Zpm/user/login',
      data: querystring.stringify(res)
    })
    outStatus = loginData.data
    if (outStatus.status === 200) {
      // 登录成功
      cacheLoginStatus = true
    }
  }
  ipcMain.emit('login-status', outStatus)
})

ipcMain.on('close-login-window', () => {
  if (cacheLoginStatus) {
    checkLogin = true
    loginWindow.close()
  }
})
