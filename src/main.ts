import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useAppStore } from './stores/app'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

registerSW({ immediate: true })

const appStore = useAppStore()

appStore
  .init()
  .finally(() => {
    app.mount('#app')
  })
