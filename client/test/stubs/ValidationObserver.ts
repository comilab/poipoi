import { defineComponent, ref } from 'nuxt-composition-api'

export default function useValidationObserverStub () {
  const invalid = ref(false)

  const component = defineComponent({
    setup () {
      return {
        invalid
      }
    },
    template: `
      <div>
        <slot
          :invalid="invalid"
        />
      </div>
    `
  })

  return {
    component,
    invalid
  }
}
