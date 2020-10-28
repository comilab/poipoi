<template lang="pug">
component.inline-flex.items-center.justify-center.whitespace-no-wrap.transition-colors.duration-300.disabled_opacity-75.disabled_pointer-events-none.focus_outline-none(
  :is="component",
  :to="to",
  :class="innerButtonClass",
  v-bind="innerButtonAttrs",
  v-on="$listeners",
  data-testid="button"
)
  div(
    v-if="icon !== null",
    v-bind="innerIconAttrs"
  )
    font-awesome-icon.fa-fw(
      v-if="innerIcon !== 'r18'",
      :icon="innerIcon",
      :pulse="pulse",
      :class="innerIconClass",
      data-testid="icon"
    )
    .inline-block.text-xs.font-bold.rounded.tracking-tighter.leading-tight.px-px(
      v-else-if="innerIcon === 'r18'",
      :class="innerIconClass",
      data-testid="icon"
    ) R18
  div(
    :class="innerTextClass",
    data-testid="text"
  )
    slot
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import { PropType } from '@vue/composition-api'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import useClassProp, { prop as classProp } from '~/composables/use-class-prop'

export default defineComponent({
  props: {
    type: {
      type: String,
      required: false,
      default: 'button'
    },
    to: {
      type: [String, Object],
      required: false,
      default: null
    },
    href: {
      type: String,
      required: false,
      default: null
    },
    color: {
      type: String,
      required: false,
      default: null
    },
    size: {
      type: String,
      required: false,
      default: 'md'
    },
    icon: {
      type: [String, Object] as PropType<string|IconDefinition>,
      required: false,
      default: null
    },
    indeterminate: {
      type: Boolean,
      required: false,
      default: false
    },
    breakpoint: {
      type: String,
      required: false,
      default: null
    },
    pill: {
      type: Boolean,
      required: false,
      default: false
    },
    square: {
      type: Boolean,
      required: false,
      default: false
    },
    buttonClass: {
      ...classProp
    },
    iconClass: {
      ...classProp
    },
    textClass: {
      ...classProp
    }
  },
  setup (props, { attrs, slots }) {
    const { merge } = useClassProp()

    const component = computed(() => {
      if (props.type === 'badge') {
        return 'div'
      } else if (props.to) {
        return 'nuxt-link'
      } else if (props.href) {
        return 'a'
      }
      return 'button'
    })

    const innerButtonAttrs = computed(() => {
      const innerAttrs = { ...attrs }
      if (component.value === 'button') {
        innerAttrs.type = props.type
      } else if (component.value === 'a') {
        innerAttrs.href = props.href
      }
      return innerAttrs
    })

    const innerIcon = computed(() => props.indeterminate ? faSpinner : props.icon)

    const pulse = computed(() => innerIcon.value === faSpinner)

    const iconOnly = computed(() => props.icon && !slots.default)

    const innerIconAttrs = computed(() => {
      const attrs: Record<string, any> = {}
      if (pulse.value) {
        attrs.role = 'status'
      }
      return attrs
    })

    const innerButtonClass = computed(() => {
      const classes = []

      if (props.type === 'badge') {
        classes.push('pointer-events-none')
      }

      if (props.color === 'blue') {
        classes.push('bg-blue-600', 'text-white', 'hover_bg-blue-700')
      } else if (props.color === 'red') {
        classes.push('bg-red-700', 'text-white', 'hover_bg-red-800')
      } else if (props.color === 'white') {
        classes.push('bg-white', 'text-gray-600', 'hover_bg-gray-300', 'hover_text-gray-800')
      } else if (props.color === 'yellow') {
        classes.push('bg-yellow-500', 'text-gray-800', 'hover_bg-yellow-600')
      } else if (props.color === 'gray') {
        classes.push('bg-gray-300', 'text-gray-800', 'hover_bg-gray-400')
      }

      if (props.size === 'sm') {
        classes.push('text-sm', 'px-2', 'py-1')
      } else if (props.size === 'md') {
        classes.push('px-3', 'py-2')
      } else if (props.size === 'lg') {
        classes.push('text-xl', 'px-4', 'py-2')
      }

      if (iconOnly.value || props.square || props.breakpoint) {
        if (props.size === 'sm') {
          classes.push('square-sm')
        } else if (props.size === 'md') {
          classes.push('square-md')
        }
      }

      if (props.breakpoint === 'md') {
        classes.push('breakpoint-md')
      } else if (props.breakpoint === 'lg') {
        classes.push('breakpoint-lg')
      }

      if (props.pill) {
        classes.push('rounded-full')
      } else {
        classes.push('rounded')
      }

      if (props.icon === 'r18') {
        classes.push('has-r18-icon')
      }

      return merge(classes, props.buttonClass)
    })

    const innerIconClass = computed(() => {
      const classes = []

      if (!iconOnly.value) {
        if (props.breakpoint === 'md') {
          classes.push('md_mr-2')
        } else if (props.breakpoint === 'lg') {
          classes.push('lg_mr-2')
        } else {
          classes.push('mr-2')
        }
      }

      if (innerIcon.value === 'r18') {
        if (props.color === 'red') {
          classes.push('text-red-700', 'bg-white', 'hover_text-red-800')
        }
      }

      return merge(classes, props.iconClass)
    })

    const innerTextClass = computed(() => {
      const classes = []

      if (props.breakpoint === 'md') {
        classes.push('hidden', 'md_block')
      } else if (props.breakpoint === 'lg') {
        classes.push('hidden', 'lg_block')
      }

      return merge(classes, props.textClass)
    })

    return {
      component,
      innerButtonAttrs,
      innerIcon,
      pulse,
      iconOnly,
      innerIconAttrs,
      innerButtonClass,
      innerIconClass,
      innerTextClass
    }
  }
})
</script>

<style lang="postcss" scoped>
.square-sm {
  width: 29px;
  height: 29px;
}

.square-md {
  width: 37px;
  height: 37px;
}

@screen md {
  .breakpoint-md {
    @apply w-auto;
  }
}

@screen lg {
  .breakpoint-lg {
    @apply w-auto;
  }
}
</style>
