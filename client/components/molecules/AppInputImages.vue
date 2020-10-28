<template lang="pug">
.text-center
  .bg-gray-200.rounded.my-4.p-4
    ValidationProvider(
      :rules="{ max: 200 }",
      v-slot="{ invalid }",
      slim
    )
      Draggable.grid.gap-8.grid-cols-2.md_grid-cols-4.mb-1(
        v-if="innerImages.length",
        v-model="innerImages"
      )
        AppInputImagesThumbnail(
          v-for="(image, i) in innerImages",
          :key="i",
          :image="image",
          :num="i + 1",
          @remove="onRemove(image)"
        )
      .text-sm.text-right(:class="{ 'text-red-700': invalid }") {{ innerImages.length }} / 200
  .grid.md_grid-cols-2.md_divide-x.items-stretch.my-4
    .activator.flex.justify-center
      VueUploadComponent(
        ref="uploader",
        v-model="uploadImages",
        :multiple="true",
        :extensions="/\.(gif|jpe?g|png)$/i",
        accept="image/*",
        :drop="true",
        :drop-directory="false",
        :post-action="`${postAction}/images`",
        :headers="headers",
        @input-filter="onInputFilter"
      )
        AppButton(
          color="blue",
          :disabled="innerImages.length >= 200"
        )
          div ここをクリックして画像を選択
          .hidden.lg_block
            .text-sm もしくは
            div 画像をドラッグ&amp;ドロップ
    .flex.justify-center.mt-4.md_mt-0
      .inline-flex.items-center.bg-blue-600.text-white.hover_bg-blue-800.rounded.cursor-pointer.h-full.px-4.py-2(
        :contenteditable="!innerImages.length >= 200",
        :class="{ 'opacity-50': innerImages.length >= 200 }",
        @paste.prevent="onPaste",
        role="textbox",
        aria-label="ここをクリックして画像をペースト"
      ) ここをクリックして画像をペースト
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'nuxt-composition-api'
import { PropType, watch } from '@vue/composition-api'
import VueUploadComponent from 'vue-upload-component'
// @ts-ignore
import Draggable from 'vuedraggable'

import Image from '~/models/Image'
import AppButton from '~/components/atoms/AppButton.vue'
import AppInputImagesThumbnail from '~/components/molecules/AppInputImagesThumbnail.vue'

interface WeightedVUFile extends VUFile {
  weight: number
}

export default defineComponent({
  components: {
    VueUploadComponent,
    Draggable,
    AppButton,
    AppInputImagesThumbnail
  },
  props: {
    images: {
      type: Array as PropType<Image[]>,
      required: false,
      default: () => []
    }
  },
  setup (props, context) {
    const uploader = ref<VueUploadComponent>()

    const innerImages = ref<(WeightedVUFile|Image)[]>([...props.images])

    const uploadImages = computed({
      get: () => {
        return innerImages.value
          .map((file, i) => {
            file.weight = i
            return file
          })
          .filter(file => !(file instanceof Image)) as WeightedVUFile[]
      },
      set: (newFiles) => {
        innerImages.value = innerImages.value
          .map((file, i) => {
            if (file instanceof Image) {
              return file
            }
            return newFiles.find(file => file.weight === i)
          })
          .filter(file => !!file)
          .concat(newFiles.filter(file => file.weight === undefined)) as (WeightedVUFile|Image)[]
      }
    })

    const headers = computed(() => {
      const value = document.cookie.split('; ').find((segment) => {
        return segment.startsWith('XSRF-TOKEN')
      })!.split('=').pop()

      return {
        'X-XSRF-TOKEN': decodeURIComponent(value!)
      }
    })

    const onRemove = (target: WeightedVUFile|Image) => {
      if (target instanceof Image) {
        const key = innerImages.value.findIndex(file => file === target)
        innerImages.value.splice(key, 1)
      } else {
        uploader.value!.remove(target)
      }
    }

    const onPaste = (event: ClipboardEvent) => {
      if (event.clipboardData?.items.length) {
        const item = event.clipboardData.items[0]
        if (item && item.kind === 'file' && /^image\//.test(item.type)) {
          uploader.value!.add(item.getAsFile()!)
        }
      }
    }

    const onInputFilter = (newFile: VUFile) => {
      if (newFile && newFile.xhr && !newFile.xhr.withCredentials) {
        newFile.xhr.withCredentials = true
      }
    }

    const upload = () => {
      if (uploadImages.value.length) {
        uploader.value!.active = true
      } else {
        context.emit('uploaded', innerImages)
      }
    }

    watch(
      () => !!uploader.value?.uploaded,
      (isUploaded) => {
        if (uploadImages.value.length && isUploaded) {
          context.emit('uploaded', innerImages.value.map((file) => {
            if (!(file instanceof Image)) {
              return file.response
            }
            return file
          }))
        }
      }
    )

    return {
      uploader,
      innerImages,
      uploadImages,
      headers,
      onRemove,
      onPaste,
      onInputFilter,
      upload,
      postAction: `${process.env.apiUrl}/api`
    }
  }
})
</script>

<style lang="postcss" scoped>
.activator >>> label {
  @apply cursor-pointer;
}
</style>
