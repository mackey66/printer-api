<script setup>
import { ref } from 'vue'
//import { VuePDF, usePDF } from '@tato30/vue-pdf'
import { useRouter } from 'vue-router'

const url = ref('https://www.global.hokudai.ac.jp/wp-content/uploads/2013/03/samplePDF.pdf')
//const counter = ref(0)
//const view = ref(null)
const router = useRouter()
const goMain = () => router.replace('/')
const print = () => ipcHandleSetPrinter()
const ipcHandleSetPrinter = async () => {
  const options = {
    pageSize: 'A4',
    landscape: false,
    silent: false
  }
  const res = await window.electronAPI.setPrinter(options)
  if (res) {
    console.log(res)
  }
}
// Send print request to the Main process
const printComponent = (target) => {
  return new Promise(() => {
    console.log('forwarding print request to the main process...')

    // convert the iframe into data url
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
    //let data = target.contentWindow.document.documentElement.outerHTML
    //let data = document.getElementById('view').outerHTML
    //let data = target.src
    //let webviewObj = document.querySelector('webview')
    //webviewObj.print({ printBackground: true })

    //target.print()
    /*
    //console.log(data);
    var blob = new Blob([data], { type: 'text/html' })
    var url = URL.createObjectURL(blob)
    console.log(url)

    window.electronAPI.printComponent(url, (response) => {
      console.log('Main: ', response)
    })
    */
  })
}
/*
window.electronAPI.onUpdateCounter((value) => {
  counter.value = counter.value + value
})
*/
</script>

<template>
  <div class="my-2 mx-2 flex flex-row actions">
    <button
      class="text-xs bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
      @click="goMain"
    >
      Back
    </button>
    <button
      class="ml-2 text-xs bg-slate-600 hover:enabled:bg-slate-800 disabled:opacity-75 text-white py-1 px-2 rounded-full"
      @click="print()"
    >
      Print
    </button>
    <!--Counter: {{ counter }}-->
  </div>
  <!--<embed :src="url" width="100%" height="560" type="application/pdf" />-->
  <!--<iframe id="view" ref="view" :src="url" width="100%" height="560" frameborder="0" style="border: none"></iframe>-->
  <webview :src="url" style="display: inline-flex; width: 100vw; height: 100vh"></webview>
  <!--<img :src="url" />-->
  <!--<picture>
    <source :srcset="url" type="image/heic" />
    <img :src="url" />
  </picture>-->
</template>
