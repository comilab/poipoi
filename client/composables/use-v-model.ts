import { computed } from 'nuxt-composition-api'
import { SetupContext } from '@vue/composition-api'

export default function useVModel (
  props: any,
  emit: SetupContext['emit'],
  prop = 'value',
  event = 'input'
) {
  const innerValue = computed({
    get: () => props[prop],
    set: value => emit(event, value)
  })

  return {
    innerValue
  }
}
