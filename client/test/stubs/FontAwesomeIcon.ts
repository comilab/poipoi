import { defineComponent } from 'nuxt-composition-api'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

type Props = {
  icon?: IconDefinition|string
}

export default function useFontAwesomeIconStub () {
  const propsList: Props[] = []

  const component = defineComponent({
    props: ['icon'],
    setup (props) {
      propsList.push(props)
    },
    template: '<span />'
  })

  return {
    component,
    propsList
  }
}
