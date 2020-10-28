import { defineComponent, watch } from 'nuxt-composition-api'
import _ from 'lodash'

export type Emitter = Record<string, Function>

export type Arguments = {
  props?: string[],
  emits?: string[],
  template?: string|null
}

export default function useMockedComponent ({ props = [], emits = [], template = null }: Arguments) {
  const propsList: Record<string, any>[] = []
  const emitsList: Emitter[] = []

  const component = defineComponent({
    props,
    setup (props, { emit }) {
      const key = propsList.length - 1
      propsList.push(props)
      watch(
        props,
        (newProps) => {
          propsList[key] = newProps
        },
        { deep: true }
      )

      const emitter: Emitter = {}
      emits.map((event) => {
        emitter[event] = (...args: any[]) => emit(event, ...args)
      })
      emitsList.push(emitter)
    },
    template: template || '<div><slot /></div>'
  })

  const getByProps = (key: string, value: any) => {
    const index = propsList.findIndex(props => _.isEqual(props[key], value))
    return {
      props: propsList[index],
      emits: emitsList[index]
    }
  }

  return {
    component,
    propsList,
    emitsList,
    getByProps
  }
}
