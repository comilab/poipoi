<template lang="pug">
.flex
  AppButton.mx-2(
    color="white",
    :icon="faAngleDoubleLeft",
    @click="onClick(1)",
    :class="{ 'pointer-events-none': pagination.currentPage === 1 }",
    data-testid="page-first"
  )
  .mx-1(
    v-if="range[0] > 1",
    data-testid="left-ellipsis"
  ) …
  AppButton.mx-2(
    v-for="page in range",
    :key="page",
    :color="getColor(page)",
    square,
    @click="onClick(page)",
    :data-testid="`page-${page}`"
  ) {{ page }}
  .mx-1(
    v-if="range.slice(-1).pop() < pagination.lastPage",
    data-testid="right-ellipsis"
  ) …
  AppButton.mx-2(
    color="white",
    :icon="faAngleDoubleRight",
    @click="onClick(pagination.lastPage)",
    :class="{ 'pointer-events-none': pagination.currentPage === pagination.lastPage }",
    data-testid="page-last"
  )
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import lodashRange from 'lodash/range'
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons'

import Pagination from '~/models/Pagination'
import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppButton
  },
  props: {
    pagination: {
      type: Pagination,
      required: true
    }
  },
  setup (props, { emit }) {
    const range = computed(() => {
      const from = Math.max(
        1,
        Math.min(
          props.pagination.currentPage - 2,
          props.pagination.lastPage - 4
        )
      )

      return lodashRange(
        from,
        Math.min(from + 5, props.pagination.lastPage + 1)
      )
    })

    const getColor = (page: number) => {
      return page === props.pagination.currentPage ? 'blue' : 'white'
    }

    const onClick = (page: number) => {
      emit('selected', page)
    }

    return {
      range,
      getColor,
      onClick,
      faAngleDoubleLeft,
      faAngleDoubleRight
    }
  }
})
</script>
