import { PropType } from '@vue/composition-api'

export const prop = {
  type: [String, Array, Object] as PropType<string|string[]|Object>,
  required: false,
  default: null
}

export default function useClassProp () {
  const merge = (...classPropValues: (string|string[]|Object|null)[]) => {
    const classes: { [key: string]: boolean } = {}

    classPropValues.map((values) => {
      if (values) {
        if (Array.isArray(values)) {
          classes[values.join(' ')] = true
        } else if (typeof values === 'string') {
          classes[values] = true
        } else {
          Object.assign(classes, values)
        }
      }
    })

    return classes
  }

  return {
    merge
  }
}
