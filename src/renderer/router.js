// Vue Routerパッケージのインポート
import { createRouter, createWebHistory } from 'vue-router'
import Main from './src/components/Main.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    component: Main
  }
]

// 一般的なルートの追加（動的インポート）
routes.push({
  path: '/pdf',
  name: 'pdf',
  component: () => import('./src/components/PdfViewer.vue')
})

// 存在しないパスは全てTOPへ
routes.push({
  path: '/:catchAll(.*)',
  redirect: '/'
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  // URL直接入力の場合はTOPへ
  if (to.path != '/' && from.name == undefined) {
    return '/'
  }
})

export default router
