import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const createRouter = (
  ssrContext: any,
  createDefaultRouter: Function,
  routerOptions: any
) => {
  const options = routerOptions || createDefaultRouter(ssrContext).options

  return new Router({
    ...options,
    base: window.APP_URL_PATH || '/'
  })
}
