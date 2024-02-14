<template>
  <main>
    <router-view v-slot="{ Component }">
      <!--<Transition name="switch-router">-->
        <component :is="Component" />
      <!--</Transition>-->
    </router-view>
  </main>
</template>