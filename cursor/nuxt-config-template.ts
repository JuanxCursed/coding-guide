export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/'],
    }
  }
});