import { defineComponent } from 'nuxt-composition-api'

type Props = {
  name?: string
  vid?: string
  rules?: string|Record<string, any>
}

export default function useValidationProviderStub (hasSlot = true) {
  const propsList: Props[] = []

  const component = defineComponent({
    props: ['name', 'vid', 'rules'],
    setup (innerProps) {
      propsList.push(innerProps)
    },
    template: hasSlot ? '<div><slot /></div>' : '<div />'
  })

  return {
    component,
    propsList
  }
}
