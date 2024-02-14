<script setup>
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <ul class="bottom-[30px] mx-[auto] my-[0] px-[0] py-[15px] font-['Menlo',_'Lucida_Console',_monospace] inline-flex overflow-hidden items-center rounded-[22px] text-slate-300 bg-[#202127] backdrop-filter backdrop-blur-xl versions">
    <li class="block float-left border-r border-gray-500 px-[20px] py-[0] text-[14px] leading-[14px] opacity-80 electron-version">Electron v{{ versions.electron }}</li>
    <li class="block float-left border-r border-gray-500 px-[20px] py-[0] text-[14px] leading-[14px] opacity-80 ml-2 chrome-version">Chromium v{{ versions.chrome }}</li>
    <li class="block float-left px-[20px] py-[0] text-[14px] leading-[14px] opacity-80 ml-2 node-version">Node v{{ versions.node }}</li>
  </ul>
</template>
