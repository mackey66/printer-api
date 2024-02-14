import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', {
      setTitle: (title) => ipcRenderer.send('set-title', title),
      setDarkToggle: () => ipcRenderer.invoke('dark-mode:toggle'),
      setDarkSystem: () => ipcRenderer.invoke('dark-mode:system'),
      openFile: () => ipcRenderer.invoke('dialog:openFile'),
      getPrinters: () => ipcRenderer.invoke('get-printers'),
      getPrintersDb: async () => ipcRenderer.invoke('get-printers-db'),
      getExecution: async () => ipcRenderer.invoke('get-execution'),
      searchExecution: async (no) => ipcRenderer.invoke('search-execution', no),
      addExecution: async (no, name) => ipcRenderer.invoke('add-execution', no, name),
      updateExecution: async (id, no, name, value) => ipcRenderer.invoke('update-execution', id, no, name, value),
      deleteExecution: async (id) => ipcRenderer.invoke('delete-execution', id),
      getPort: async () => ipcRenderer.invoke('get-port'),
      setPrinter: async (options) => ipcRenderer.invoke('set-printer', options),
      setPort: async (port) => ipcRenderer.invoke('set-port', port),
      onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
      counterValue: (value) => ipcRenderer.send('counter-value', value),
      printComponent: async (url, callback) => {
        let response = await ipcRenderer.invoke('printComponent', url)
        callback(response)
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
