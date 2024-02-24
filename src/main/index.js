import { app, shell, BrowserWindow, dialog, ipcMain, nativeTheme, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sqlite3 from 'sqlite3'
import bodyParser from 'body-parser'
//import PDFWindow from 'electron-pdf-window'

const db = new sqlite3.Database('printer.db')
const expressApp = express()
expressApp.use(cors())
expressApp.use(bodyParser.json())
expressApp.use(bodyParser.urlencoded({ extended: true }))

function handleSetTitle(event, title) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  if (!canceled) {
    return filePaths[0]
  }
}

function handleGetPrinters(event) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  const res = win.webContents.getPrintersAsync({})
  getPrinters()
  return res
}

function getPrinters() {
  const w = new BrowserWindow({ show: false });
  w.webContents.getPrintersAsync().then((printers) => {
    db.serialize(() => {
      db.run('DELETE FROM printers;', (err) => {
        if (err) console.log(err)
      })
      printers.forEach((printer) => {
        db.run('INSERT INTO printers(name, is_default, detail) VALUES(?, ?, ?);', printer.name, printer.isDefault, JSON.stringify(printer), (err) => {
          console.log(printer)
          if (err) console.log(err)
        })
      })
    })
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      plugins: true,
      webviewTag: true,
    }
  })

  /*
  // Menu Test
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send('update-counter', 1),
          label: 'Increment'
        },
        {
          click: () => mainWindow.webContents.send('update-counter', -1),
          label: 'Decrement'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
  */

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Set Title
  ipcMain.on('set-title', handleSetTitle)

  // Open File
  ipcMain.handle('dialog:openFile', handleFileOpen)

  // Get Port
  //ipcMain.handle('get-port', handleGetPort)

  // Get Printer
  ipcMain.handle('get-printers', handleGetPrinters)

  // Set Printer
  ipcMain.handle(
    'set-printer',
    (event, options) =>
      new Promise((resolve, reject) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        win.webContents.print(options, (success, failureReason) => {
          if (failureReason) resolve(failureReason)
          resolve(success)
        })
      })
  )

  // Dark mode
  ipcMain.handle('dark-mode:toggle', () => {
    if (nativeTheme.shouldUseDarkColors) {
      nativeTheme.themeSource = 'light'
    } else {
      nativeTheme.themeSource = 'dark'
    }
    return nativeTheme.shouldUseDarkColors
  })

  ipcMain.handle('dark-mode:system', () => {
    nativeTheme.themeSource = 'system'
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  db.close()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

import express from 'express'
import cors from 'cors'

let port = ''

db.serialize(() => {
  // Tableがなければ作成
  db.run('CREATE TABLE IF NOT EXISTS config (' + 
    'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 
    'app TEXT, ' + 
    'version TEXT, ' + 
    'name TEXT, ' + 
    'email TEXT, ' + 
    'regcd TEXT, ' + 
    'port TEXT' + 
  ')')
  db.run('CREATE TABLE IF NOT EXISTS printers (' + 
    'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 
    'name TEXT, ' + 
    'is_default INTEGER, ' + 
    'detail TEXT' + 
  ')')
  db.run('CREATE TABLE IF NOT EXISTS execution (' + 
  'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 
  'no INTEGER, ' + 
  'deviceName TEXT, ' + 
  'explanation TEXT, ' + 
  'silent INTEGER, ' + 
  'pageSize TEXT, ' + 
  'landscape INTEGER, ' + 
  'color INTEGER, ' + 
  'margins TEXT, ' + 
  'scaleFactor INTEGER, ' + 
  'pagesPerSheet INTEGER, ' + 
  'collated INTEGER, ' + 
  'copies INTEGER, ' + 
  'pageRanges TEXT, ' + 
  'duplexMode TEXT, ' + 
  'dpi TEXT, ' + 
  'printBackground INTEGER, ' + 
  'header TEXT, ' + 
  'footer TEXT' + 
')')
  // 初期値
  const stmt = db.prepare('INSERT OR IGNORE INTO config VALUES (?, ?, ?, ?, ?, ?, ?)')
  stmt.run(1, 'iWanPrint', process.env.npm_package_version, '', '', '', 3000)
  stmt.finalize()
  // 表示
  db.each('SELECT * FROM config', (err, row) => {
    console.log(row.app, row.version)
  })
  db.each('SELECT * FROM printers', (err, row) => {
    console.log(row.name, row.is_default)
  })
  // Load
  db.all('SELECT port FROM config', (err, rows) => {
    if (err) {
      console.log(err)
    } else {
      port = rows[0].port
      expressApp.listen(Number(port), () => {
        console.log('API is waiting for reception on port ' + port)
      })
    }
  })
})

ipcMain.handle(
  'get-port',
  (event) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all('SELECT port FROM config', (err, rows) => {
          if (err) reject(err)
          resolve(rows[0].port)
        })
      })
    })
)

ipcMain.handle(
  'set-port',
  (event, value) =>
    new Promise((resolve, reject) => {
      db.run('UPDATE config SET port=? WHERE id = 1;', value, (err) => {
        if (err) reject(err)
        port = value
        resolve('Set port to ' + port + '. Restart required.')
      })
    })
)

ipcMain.handle(
  'get-printers-db',
  (event) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all('SELECT * FROM printers', (err, rows) => {
          if (err) reject(err)
          resolve(rows)
        })
      })
    })
)

ipcMain.handle(
  'get-execution',
  (event) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all('SELECT * FROM execution ORDER BY no', (err, rows) => {
          if (err) reject(err)
          resolve(rows)
        })
      })
    })
)

ipcMain.handle(
  'search-execution',
  (event, no) =>
    new Promise((resolve, reject) => {
      db.serialize(() => {
        db.all('SELECT id, no, deviceName FROM execution WHERE no = ? LIMIT 1', no, (err, res) => {
          if (err) reject(err)
          resolve(res)
        })
      })
    })
)

ipcMain.handle(
  'add-execution',
  (event, no, name) =>
    new Promise((resolve, reject) => {
      db.run('INSERT INTO execution (no, deviceName, pageSize) VALUES (?, ? , "A4");', no, name, (err) => {
        if (err) reject(err)
        resolve()
      })
    })
)

ipcMain.handle(
  'delete-execution',
  (event, id) =>
    new Promise((resolve, reject) => {
      db.run('DELETE FROM execution WHERE id = ?;', id, (err) => {
        if (err) reject(err)
        resolve()
      })
    })
)

ipcMain.handle(
  'update-execution',
  (event, id, no, name, value) =>
    new Promise((resolve, reject) => {
      db.run('UPDATE execution SET no = ?, ' + name + ' = ? WHERE id = ?;', no, value, id, (err) => {
        if (err) reject(err)
        resolve()
      })
    })
)

/*
const allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, access_token'
  )

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200)
  } else {
    next()
  }
}
expressApp.use(allowCrossDomain)
*/
expressApp.use(cors())

const users = [
  { id: 1, name: 'User1', email: 'user1@test.local' },
  { id: 2, name: 'User2', email: 'user2@test.local' },
  { id: 3, name: 'User3', email: 'user3@test.local' }
]

// GET
expressApp.get('/users', (req, res) => {
  res.send(JSON.stringify(users))
})

// POST
let win_ = null

expressApp.post('/print', (req, res) => {
  const no = req.body.no
  const url = req.body.url
  if (no) {
    // 応答は先に返しておく
    res.end()
    // DB
    db.serialize( () => {
      db.get('SELECT * FROM execution WHERE no = ?', no, (err, res) => {
        if (err) {
          console.log(err)
          return
        }

        const options = {
          deviceName: res.deviceName,
          pageSize: res.pageSize,
          landscape: res.landscape,
          silent: res.silent
        }

        //if (win_) {
        //  win_.close()
        //}
        
        win_ = new BrowserWindow({
          //parent: mainWindow,
          modal: true,
          show: true,
          webSecurity: false,
          webPreferences: {
            nodeIntegration: true,
            devTools: true
          }
        })

        //PDFWindow.addSupport(win_)
        //win_.hide()
        win_.loadURL(url)
        win_.webContents.once('did-finish-load', async () => {
          //win_.show()
          //setTimeout(() => {
          try {
            win_.webContents.print(options || {}, (success, failureReason) => {
              if (failureReason) {
                console.log(failureReason)
              } else {
                console.log(success)
              }
            })
          } catch (e) {
            console.error(e)
          }
          //}, 3000)
        })
      })
    })
  } else {
    res.send('Requires no')
  }
})

/*
async function print(url, options) {
  win_.loadURL(url)
  await win_.webContents.print(options || {}, (success, failureReason) => {
    if (failureReason) {
      console.log(failureReason)
    } else {
      console.log(success)
    }
  })
}
*/

ipcMain.handle('printComponent', (event, url) => {
  const options = {
    silent: false,
    printBackground: true,
    color: true,
    margin: {
      marginType: 'printableArea'
    },
    landscape: false,
    pagesPerSheet: 1,
    collate: false,
    copies: 1,
    header: 'Page header',
    footer: 'Page footer'
  }
  let win = new BrowserWindow({ show: true })
  win.loadURL(url)

  win.webContents.on('did-finish-load', () => {
    win.webContents.print(options, (success, failureReason) => {
      console.log('Print Initiated in Main...')
      if (!success) console.log(failureReason)
    })
  })
  return 'done in main'
})
