import Vue from 'vue'
import { ValidationObserver, ValidationProvider, extend, localize } from 'vee-validate'
import * as rules from 'vee-validate/dist/rules'
import ja from 'vee-validate/dist/locale/ja.json'

for (const [rule, validation] of Object.entries(rules)) {
  extend(rule, {
    ...validation as any
  })
}

localize({
  ja
})
localize('ja')

Vue.component('ValidationObserver', ValidationObserver)
Vue.component('ValidationProvider', ValidationProvider)
