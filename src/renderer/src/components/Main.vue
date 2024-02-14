<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Versions from './Versions.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const text = ref('')
const portText = ref('')
const port = ref('3001')
const edit = ref(0)

/*
const counter = ref(0)

window.electronAPI.onUpdateCounter((value) => {
  counter.value = counter.value + value
})
*/


const bool = [0, 1]
const size = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'Legal', 'Letter', 'Tabloid']
const duplex = ['simplex', 'shortEdge', 'longEdge']
let printers = [
  {
    id: 1,
    name: 'printer1',
    is_default: 1,
    detail: ''
  },
  {
    id: 2,
    name: 'printer2',
    is_default: 0,
    detail: ''
  }
]
let execution = [
  {
    id: 1,
    no: 1,
    deviceName: 'printer1',
    explanation: '',
    silent: 0,
    pageSize: 'A4',
    landscape: 0,
    color: 1,
    margins: null,
    scaleFactor: 1,
    pagesPerSheet: 1,
    collate: 0,
    copies: 1,
    pageRanges: null,
    duplexMode: '',
    dpi: null,
    printBackground: 0,
    header: '',
    footer: ''
  },
  {
    id: 2,
    no: 2,
    deviceName: 'printer1',
    explanation: '',
    silent: 0,
    pageSize: 'A4',
    landscape: 1,
    color: 1,
    margins: null,
    scaleFactor: 1,
    pagesPerSheet: 1,
    collate: 0,
    copies: 1,
    pageRanges: null,
    duplexMode: '',
    dpi: null,
    printBackground: 0,
    header: '',
    footer: ''
  },
  {
    id: 3,
    no: 3,
    deviceName: 'printer2',
    explanation: '',
    silent: 0,
    pageSize: 'A4',
    landscape: 0,
    color: 0,
    margins: null,
    scaleFactor: 1,
    pagesPerSheet: 1,
    collate: 0,
    copies: 1,
    pageRanges: null,
    duplexMode: '',
    dpi: null,
    printBackground: 0,
    header: '',
    footer: ''
  }
]
const devices = reactive({
  items: printers
})
const exes = reactive({
  items: execution
})
const goPdf = () => router.replace('pdf')
const ipcHandle = () => window.electron.ipcRenderer.send('ping')
const ipcHandlePrinter = () => window.electron.ipcRenderer.send('printer')
const ipcHandleTitle = (title) => window.electronAPI.setTitle(title)
const ipcHandleDarkToggle = () => window.electronAPI.setDarkToggle()
const ipcHandleDarkSystem = () => window.electronAPI.setDarkSystem()
const ipcHandleOpenFile = async () => {
  const filePath = await window.electronAPI.openFile()
  text.value = filePath
}
const ipcHandleGetPrinters = async () => {
  const res = await window.electronAPI.getPrinters()
  text.value = res
  ipcHandleGetPrintersDb()
}
const ipcHandleGetPrintersDb = async () => {
  const res = await window.electronAPI.getPrintersDb()
  devices.items = res
}
const ipcHandleGetExecution = async () => {
  const res = await window.electronAPI.getExecution()
  //console.log(res)
  exes.items = res
}
const ipcHandleSearchExecution = async (no) => {
  const res = await window.electronAPI.searchExecution(no)
  //console.log(res)
  return res
}
const ipcHandleAddExecution = async (no, name) => {
  const res = await window.electronAPI.addExecution(no, name)
  ipcHandleGetExecution()
}
const ipcHandleUpdateExecution = async (id, no, name, value) => {
  const res = await window.electronAPI.updateExecution(id, no, name, value)
  ipcHandleGetExecution()
}
const moveupExecution = async (id, old_no, new_no, name, value) => {
  const res = await ipcHandleSearchExecution(new_no)
  ipcHandleUpdateExecution(res[0].id, old_no, name, res[0].deviceName)
  ipcHandleUpdateExecution(id, new_no, name, value)
  ipcHandleGetExecution()
}
const ipcHandleDeleteExecution = async (id, no, name) => {
  let result = window.confirm('Are you sure you want to delete it?' + ' (#' + no + ': ' + name + ')')
  if (!result) return
  const res = await window.electronAPI.deleteExecution(id)
  ipcHandleGetExecution()
}
const ipcHandleExecution = async (name, silent, pageSize, landscape) => {
  const options = {
    deviceName: name,
    pageSize: pageSize,
    landscape: landscape,
    silent: silent
  }
  const res = await window.electronAPI.setPrinter(options)
  if (res) {
    text.value = res
  }
}
const ipcHandleGetPort = async () => {
  const res = await window.electronAPI.getPort()
  //console.log('res', res)
  port.value = res
}
const ipcHandleSetPort = async () => {
  const res = await window.electronAPI.setPort(port.value)
  //text.value = res
  portText.value = res
}
const ipcHandleSetPrinter = async () => {
  const options = {
    pageSize: 'A4',
    landscape: false,
    silent: false
  }
  const res = await window.electronAPI.setPrinter(options)
  if (res) {
    text.value = res
  }
}
const clear = () => {
  text.value = ''
}

onMounted(() => {
  edit.value = 0
  ipcHandleTitle('iWanPrint')
  ipcHandleGetPort()
  ipcHandleGetPrintersDb()
  ipcHandleGetExecution()
  ipcHandleDarkSystem()
})
</script>

<template>
  <div
    class="relative flex min-h-screen flex-col justify-center overflow-hidden dark:bg-slate-950 py-6 sm:py-12 text-center"
  >
    <img alt="logo" class="w-24 h-24 rounded-full mx-auto logo" src="../assets/electron.svg" />
    <div class="mt-2 text-sm font-medium dark:text-gray-400 creator">Powered by electron-vite</div>
    <div class="mt-5 text-3xl font-semibold dark:text-slate-200 text">
      Build an Electron app with
      <span class="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500 vue"
        >Vue</span
      >
    </div>
    <p class="mt-2 text-base font-medium dark:text-gray-400 tip">
      Please try pressing <code class="font-bold">F12</code> to open the devTool
    </p>
    <div class="mt-5 flex flex-row mx-auto actions">
      <button class="bg-slate-600 hover:bg-slate-800 text-white py-2 px-4 rounded-full">
        <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
      </button>
      <button
        class="ml-2 bg-slate-600 hover:bg-slate-800 text-white py-2 px-4 rounded-full"
        @click="ipcHandleSetPrinter"
      >
        Print
      </button>
      <button
        class="ml-2 bg-slate-600 hover:bg-slate-800 text-white py-2 px-4 rounded-full"
        @click="goPdf"
      >
        PDF Test
      </button>
      <!--Counter: {{ counter }}-->
    </div>

    <div class="container mt-6 mx-auto dark:text-slate-200 text-left">
      <div class="border-b border-gray-900/10 pb-12">
        <h2 class="text-lg font-semibold leading-7">Printer API</h2>
        <p class="mt-1 text-sm leading-6">You can specify a printer and print using http communication from a web application.</p>
        <p class="mt-1 text-sm leading-6">Please include no (Printer settings #) and url (https://xxxxxx.pdf) in the request body and POST to http://localhost:{{port}}/print</p>
        <p class="mt-1 text-xs leading-4">However, this is not possible due to a bug? where Electron WebContents' contents.print results in a blank page.</p>

        <div class="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

          <div class="sm:col-span-2">
            <div class="flex flex-col md:flex-row">
              <div class="w-20 h-6 mt-3">Port:</div>
              <div class="flex-1 flex flex-col md:flex-row">
                <div class="w-full flex-1 mx-2">
                  <div class="mt-2">
                    <input
                      v-model="port"
                      @change="ipcHandleSetPort"
                      type="text"
                      placeholder="Port" 
                      class="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="sm:col-span-2">
            <p class="mt-3 text-xs text-red-500 dark:text-red-400 px-1 py-1">{{ portText }}</p>
          </div>
          <div class="sm:col-span-6">
            <h2 class="text-lg font-semibold leading-7">Printer settings</h2>
            <div class="ml-1.5 flex items-center">
              <input v-model="edit" checked id="checked-checkbox" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <label for="checked-checkbox" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Edit</label>
            </div>
            <div class="overflow-x-scroll">
              <table class="divide-y border-b border-gray-300 dark:border-gray-200 divide-gray-300 dark:divide-gray-200">
                <thead>
                  <tr>
                    <th v-if="edit == 1" class="pr-2"></th>
                    <th class="px-2">#</th>
                    <th class="px-2">deviceName</th>
                    <th></th>
                    <th class="px-2">explanation</th>
                    <th class="px-2">pageSize</th>
                    <th class="px-2">landscape</th>
                    <th class="px-2">silent</th>
                    <th class="px-2">color</th>
                    <th class="px-2">margins</th>
                    <th class="px-2">scaleFactor</th>
                    <th class="px-2">pagesPerSheet</th>
                    <th class="px-2">collate</th>
                    <th class="px-2">copies</th>
                    <th class="px-2">pageRanges</th>
                    <th class="px-2">duplexMode</th>
                    <th class="px-2">dpi</th>
                    <th class="px-2">printBackground</th>
                    <th class="px-2">header</th>
                    <th class="px-2">footer</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300 dark:divide-gray-200">
                  <tr v-for="(item, key) in exes.items" :key="key">
                    <td v-if="edit == 1" class="pr-2">
                      <div v-if="key > 0">
                        <button
                          class="text-xs my-1 bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
                          @click="moveupExecution(item.id, item.no, item.no - 1, 'deviceName', item.deviceName)"
                        >
                          ↑
                        </button>
                      </div>
                    </td>
                    <td class="px-2">{{ item.no }}</td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.deviceName"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'deviceName', item.deviceName)"
                        >
                          <option v-for="item_ in devices.items" :key="item_.id" :value="item_.name">{{ item_.name }}</option>
                        </select>
                      </div>
                      <div v-else class="whitespace-nowrap">{{ item.deviceName }}</div>
                    </td>
                    <td>
                      <div v-if="edit == 1">
                        <button
                          class="text-xs my-1 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded-full"
                          @click="ipcHandleDeleteExecution(item.id, key + 1, item.deviceName)"
                        >
                          Delete
                        </button>
                      </div>
                      <div v-else>
                        <button
                          class="text-xs my-1 bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
                          @click="ipcHandleExecution(item.deviceName, item.silent, item.pageSize, item.landscape)"
                        >
                          Print
                        </button>
                      </div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <input
                          v-model="item.explanation"
                          placeholder="explanation"
                          type="text"
                          class="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'explanation', item.explanation)"
                        />
                      </div>
                      <div v-else class="whitespace-nowrap">{{ item.explanation }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.pageSize"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'pageSize', item.pageSize)"
                        >
                          <option v-for="value in size" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.pageSize }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.landscape"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'landscape', item.landscape)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.landscape }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.silent"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'silent', item.silent)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.silent }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.color"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'color', item.color)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.color }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.margins"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'margins', item.margins)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.margins }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <input
                          v-model="item.scaleFactor"
                          placeholder="scaleFactor"
                          type="number"
                          class="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'scaleFactor', item.scaleFactor)"
                        />
                      </div>
                      <div v-else>{{ item.scaleFactor }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <input
                          v-model="item.pagesPerSheet"
                          placeholder="pagesPerSheet"
                          type="number"
                          class="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'pagesPerSheet', item.pagesPerSheet)"
                        />
                      </div>
                      <div v-else>{{ item.pagesPerSheet }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.collate"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'collate', item.collate)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.collate }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <input
                          v-model="item.copies"
                          placeholder="copies"
                          type="number"
                          class="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'copies', item.copies)"
                        />
                      </div>
                      <div v-else>{{ item.copies }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.pageRanges"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'pageRanges', item.pageRanges)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.pageRanges }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.duplexMode"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'duplexMode', item.duplexMode)"
                        >
                          <option v-for="value in duplex" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.duplexMode }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.dpi"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'dpi', item.dpi)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.dpi }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <select
                          v-model="item.printBackground"
                          class="block rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'printBackground', item.printBackground)"
                        >
                          <option v-for="value in bool" :key="value" :value="value">{{ value }}</option>
                        </select>
                      </div>
                      <div v-else>{{ item.printBackground }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <input
                          v-model="item.header"
                          placeholder="header"
                          type="text"
                          class="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'header', item.header)"
                        />
                      </div>
                      <div v-else>{{ item.header }}</div>
                    </td>
                    <td class="px-2">
                      <div v-if="edit == 1" class="my-2">
                        <input
                          v-model="item.footer"
                          placeholder="footer"
                          type="text"
                          class="block w-full rounded-md border-0 py-1 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          @change="ipcHandleUpdateExecution(item.id, key + 1, 'footer', item.footer)"
                        />
                      </div>
                      <div v-else>{{ item.footer }}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                class="text-xs mt-2 bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
                :disabled="edit == 0"
                @click="ipcHandleAddExecution(exes.items.length + 1, devices.items[0].name)"
              >
                Add
              </button>
            </div>
          </div>

          <div class="sm:col-span-6">
            <h2 class="text-lg font-semibold leading-7">Available printers</h2>
            <button
              class="text-xs bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
              @click="ipcHandleGetPrinters"
            >
              Refresh
            </button>
            <div class="overflow-x-scroll">
              <table class="sm:col-span-6 divide-y border-b border-gray-300 dark:border-gray-200 divide-gray-300 dark:divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-2">#</th>
                    <th class="px-2">Name</th>
                    <th class="px-2">Default</th>
                    <th class="px-2">Detail</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-300 dark:divide-gray-200">
                  <tr v-for="(item, key) in devices.items" :key="key">
                    <td class="px-2">{{ key + 1 }}</td>
                    <td class="px-2">
                      <div class="whitespace-nowrap">{{ item.name }}</div>
                    </td>
                    <td class="px-2">{{ item.is_default }}</td>
                    <td class="px-2 text-xs">{{ item.detail }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="sm:col-span-6">
            <div class="col-span-full">
              <label for="about" class="block text-sm font-medium leading-6 dark:text-gray-200">Result</label>
              <div class="border-solid border rounded border-gray-300 dark:border-gray-200">
                <p class="dark:text-gray-300 px-1 py-1">{{ text }}</p>
              </div>
              <button
                class="text-xs mt-2 bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
                :disabled="text == ''"
                @click="clear"
              >
                Clear
              </button>
              <p class="text-sm leading-6 dark:text-gray-200">
                The result of each button is returned.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="py-4"></div>
    <div class="absolute inset-x-0 bottom-0 h-16">
      <Versions />
    </div>
  </div>
</template>
