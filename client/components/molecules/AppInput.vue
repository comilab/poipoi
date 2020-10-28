<template lang="pug">
ValidationProvider(
  :vid="vid",
  :name="name || label",
  :rules="rules",
  v-slot="{ classes, errors }",
  :immediate="immediate",
  slim
)
  .flex.flex-col(
    :class="classes",
    :data-testid="`input-${name || label || vid}`"
  )
    AppLabel(
      v-if="hasLabel",
      :for="id",
      data-testid="label"
    )
      slot(name="label") {{ label }}
    template(v-if="type === 'checkbox'")
      label.cursor-pointer(data-testid="input")
        input.mr-2(
          type="checkbox",
          v-model="innerValue",
          :value="value",
          :name="name || label || vid || checkboxLabel",
          v-bind="$attrs"
        )
        span {{ checkboxLabel }}
    template(v-else-if="type === 'checkboxgroup'")
      .flex.flex-wrap.-mx-4.-my-2(data-testid="input")
        label.cursor-pointer.mx-4.my-2(v-for="(option, i) in options", :key="i")
          input.mr-2(
            type="checkbox",
            v-model="innerValue",
            :value="option.value",
            :disabled="option.disabled",
            :name="name || label || vid",
            v-bind="$attrs"
          )
          span.whitespace-nowrap {{ option.label }}
    template(v-else-if="type === 'radio'")
      .flex.flex-wrap.-mx-4.-my-2(data-testid="input")
        label.cursor-pointer.mx-4.my-2(v-for="(option, i) in options", :key="i")
          input.mr-2(
            type="radio",
            v-model="innerValue",
            :value="option.value",
            :disabled="option.disabled",
            :name="name || label || vid",
            v-bind="$attrs"
          )
          span.whitespace-nowrap {{ option.label }}
    template(v-else-if="type === 'textarea'")
      textarea.border-b.focus_border-blue-400.focus_outline-none.transition-colors.duration-300.p-2(
        :id="id",
        ref="textarea",
        v-model="innerValue",
        :name="name || label || vid",
        v-bind="$attrs",
        @keydown="adjustHeight",
        data-testid="input"
      )
    template(v-else)
      input.border-b.focus_border-blue-400.focus_outline-none.transition-colors.duration-300.bg-white.p-2(
        :id="id",
        :type="type",
        v-model="innerValue",
        :name="name || label || vid",
        v-bind="$attrs",
        data-testid="input"
      )
    .flex.flex-col.md_flex-row.flex-col-reverse.justify-between.text-sm
      div(
        v-if="!hideErrors",
        data-testid="errors"
      )
        .mt-1(
          v-for="(error, i) in errors"
        ) {{ error }}
      .text-gray-500.text-right.mt-1(
        v-if="rules.max",
        data-testid="counter"
      ) {{ innerValue.length }} / {{ rules.max }}
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'nuxt-composition-api'
import { PropType } from '@vue/composition-api'
import dayjs from 'dayjs'

import useUniqId from '~/composables/use-uniq-id'
import AppLabel from '~/components/atoms/AppLabel.vue'

type Option = {
  label: string
  value: any
  disabled: boolean
}

export default defineComponent({
  components: {
    AppLabel
  },
  props: {
    value: {
      required: false,
      default: null
    },
    type: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: false,
      default: null
    },
    vid: {
      type: String,
      required: false,
      default: null
    },
    name: {
      type: String,
      required: false,
      default: null
    },
    options: {
      type: Array as PropType<Option[]>,
      required: false,
      default: () => []
    },
    checkboxLabel: {
      type: String,
      required: false,
      default: null
    },
    rules: {
      type: [String, Object] as PropType<any>,
      required: false,
      default: () => { return {} }
    },
    immediate: {
      type: Boolean,
      required: false,
      default: false
    },
    hideErrors: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props, context) {
    const { id } = useUniqId('input')

    const textarea = ref<HTMLTextAreaElement>()

    const innerValue = computed({
      get: () => {
        if (props.type === 'datetime-local' && props.value) {
          return dayjs(props.value as any).format('YYYY-MM-DDTHH:mm')
        }
        return props.value
      },
      set: (value) => {
        if (props.type === 'datetime-local' && value) {
          context.emit('input', dayjs(value).utc().toDate())
        } else {
          context.emit('input', value)
        }
        adjustHeight()
      }
    })

    const hasLabel = computed(() => {
      return props.label || context.slots.label
    })

    const adjustHeight = async () => {
      if (textarea.value) {
        textarea.value.style.height = 'auto'
        await context.root.$nextTick()
        const height = Math.min(Math.max(75, textarea.value.scrollHeight), 400)
        textarea.value.style.height = `${height}px`
      }
    }

    onMounted(() => {
      if (textarea.value) {
        adjustHeight()
      }
    })

    return {
      id,
      textarea,
      innerValue,
      hasLabel,
      adjustHeight
    }
  }
})
</script>

<style lang="postcss" scoped>
.invalid {
  @apply text-red-700;

  & input,
  & textarea {
    @apply text-black border-red-700;
  }

  & div {
    @apply text-red-700;
  }
}
</style>
