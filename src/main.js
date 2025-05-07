import { createApp } from 'vue'
import VueTheMask from 'vue-the-mask'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'

// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)
app.use(VueTheMask)

// Mount vue app
app.mount('#app')
