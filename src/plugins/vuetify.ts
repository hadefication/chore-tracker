import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles/main.css'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const choreTheme = {
  dark: false,
  colors: {
    background: '#fff7f0',
    surface: '#ffffff',
    primary: '#f26b3a',
    secondary: '#247d8b',
    accent: '#f1b24a',
    success: '#2f9e62',
    warning: '#f08c3f',
    error: '#d95763',
    info: '#4f8ca8',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'choreTheme',
    themes: {
      choreTheme,
    },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VBtn: {
      rounded: 'xl',
      size: 'large',
      height: 46,
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VAlert: {
      rounded: 'xl',
      border: 'start',
    },
    VSheet: {
      rounded: 'xl',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VDialog: {
      maxWidth: 720,
    },
  },
})
