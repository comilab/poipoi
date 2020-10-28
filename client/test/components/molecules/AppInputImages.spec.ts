import { fireEvent, render, waitFor } from '@testing-library/vue'
import { defineComponent, ref } from 'nuxt-composition-api'
import { Ref } from '@vue/composition-api'

import AppInputImages from '~/components/molecules/AppInputImages.vue'
import Image from '~/models/Image'
import imageFactory from '~/test/factories/image'
import useMockedComponent from '~/test/stubs/MockedComponent'

describe('components/molecules/AppInputImages', () => {
  let options: any
  let props: any

  beforeEach(() => {
    props = {
      value: []
    }

    options = {
      props,
      stubs: {
        FontAwesomeIcon: true
      }
    }

    jest.spyOn(document, 'cookie', 'get').mockImplementation(() => 'XSRF-TOKEN=foo')
  })

  test('renders correctly', () => {
    const { container } = render(AppInputImages, options)

    expect(container).toMatchSnapshot()
  })

  describe('images', () => {
    test('props.imagesを初期値としてセット', () => {
      props.images = imageFactory.buildList(1)
      const { getAllByRole } = render(AppInputImages, options)

      expect(getAllByRole('img')).toHaveLength(1)
    })

    test('Draggableに渡す', () => {
      const { component, propsList } = useMockedComponent({ props: ['value'] })
      options.stubs.Draggable = component
      props.images = imageFactory.buildList(1)
      render(AppInputImages, options)

      expect(propsList[0].value).toStrictEqual(props.images)
    })

    test('空配列の場合はサムネイル一覧を表示しない', () => {
      props.images = []
      const { queryByRole } = render(AppInputImages, options)

      expect(queryByRole('img')).not.toBeInTheDocument()
    })

    test('カウンターを表示', () => {
      props.images = imageFactory.buildList(1)
      const { getByText } = render(AppInputImages, options)

      expect(getByText('1 / 200')).toBeInTheDocument()
    })

    test('画像が200枚以上ならボタン類を使用不可にする', () => {
      props.images = imageFactory.buildList(200)
      options.stubs.AppInputImagesThumbnail = true
      const { getByRole, getByLabelText } = render(AppInputImages, options)

      expect(getByRole('button', { name: /ここをクリックして画像を選択/ })).toHaveAttribute('disabled')
      expect(getByLabelText('ここをクリックして画像をペースト')).toHaveAttribute('contenteditable', 'false')
    })
  })

  describe('AppInputImagesThumbnail', () => {
    let inputImagesThumbnailProps: any
    let inputImagesThumbnailFireRemoveFunction: Function
    let draggableProps: any

    beforeEach(() => {
      options.stubs.AppInputImagesThumbnail = defineComponent({
        props: ['image', 'num'],
        setup (props, { emit }) {
          inputImagesThumbnailProps = props
          inputImagesThumbnailFireRemoveFunction = () => emit('remove')
        },
        template: '<div />'
      })
      options.stubs.Draggable = defineComponent({
        props: ['value'],
        setup (props) {
          draggableProps = props
        },
        template: '<div><slot /></div>'
      })
    })

    test('imagesを1件ずつ渡す', () => {
      props.images = imageFactory.buildList(1)
      render(AppInputImages, options)

      expect(inputImagesThumbnailProps.image).toBe(props.images[0])
    })

    test('num = key + 1', () => {
      props.images = imageFactory.buildList(1)
      render(AppInputImages, options)

      expect(inputImagesThumbnailProps.num).toBe(1)
    })

    describe('remove', () => {
      test('対象がImageモデルの場合は削除', async () => {
        props.images = imageFactory.buildList(1)
        render(AppInputImages, options)
        inputImagesThumbnailFireRemoveFunction()

        await waitFor(() => {
          expect(draggableProps.value).toHaveLength(0)
        })
      })

      test('対象がImageモデルでない場合はuploader.removeを実行', () => {
        const removeMock = jest.fn()
        options.stubs.VueUploadComponent = defineComponent({
          setup () {
            return {
              remove: removeMock
            }
          },
          template: '<div />'
        })
        props.images = [{}]
        render(AppInputImages, options)
        inputImagesThumbnailFireRemoveFunction()

        expect(removeMock).toBeCalled()
      })
    })
  })

  describe('VueUploadComponent', () => {
    let uploadComponentProps: any
    let uploadComponentFireInputFunction: Function
    let uploadComponentFireInputFilterFunction: Function
    let draggableProps: any

    beforeEach(() => {
      options.stubs.VueUploadComponent = defineComponent({
        props: ['value', 'multiple', 'extensions', 'accept', 'drop', 'dropDirectory', 'postAction', 'headers'],
        setup (props, { emit }) {
          uploadComponentProps = props
          uploadComponentFireInputFunction = (arg: any[]) => emit('input', arg)
          uploadComponentFireInputFilterFunction = (arg: any) => emit('input-filter', arg)
        },
        template: '<div />'
      })
      options.stubs.Draggable = defineComponent({
        props: ['value'],
        setup (props) {
          draggableProps = props
        },
        template: '<div />'
      })
    })

    test('valueはimagesからImageモデルを除外したもの', () => {
      props.images = [imageFactory.build(), {}]
      render(AppInputImages, options)

      expect(uploadComponentProps.value).toHaveLength(1)
      expect(uploadComponentProps.value[0]).not.toBeInstanceOf(Image)
    })

    test('multiple = true', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.multiple).toBeTruthy()
    })

    test('extensions = /.(gif|jpe?g|png)$/i', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.extensions).toBeInstanceOf(RegExp)
      expect(uploadComponentProps.extensions.test('.gif')).toBeTruthy()
      expect(uploadComponentProps.extensions.test('.jpeg')).toBeTruthy()
      expect(uploadComponentProps.extensions.test('.jpg')).toBeTruthy()
      expect(uploadComponentProps.extensions.test('.png')).toBeTruthy()
    })

    test('accept = image/*', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.accept).toBe('image/*')
    })

    test('drop = true', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.drop).toBeTruthy()
    })

    test('dropDirectory = false', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.dropDirectory).toBeFalsy()
    })

    test('postAction = /api/images', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.postAction).toBe(`${process.env.apiUrl}/api/images`)
    })

    test('headersにX-XSRF-TOKENをセット', () => {
      render(AppInputImages, options)

      expect(uploadComponentProps.headers).toStrictEqual({ 'X-XSRF-TOKEN': 'foo' })
    })

    describe('input', () => {
      test('imagesを更新', async () => {
        props.images = []
        render(AppInputImages, options)
        uploadComponentFireInputFunction([{}])

        await waitFor(() => {
          expect(draggableProps.value).toHaveLength(1)
        })
      })

      test('ファイルが削除された場合に対応', async () => {
        props.images = [{ id: 1, weight: 0 }, { id: 2, weight: 1 }]
        render(AppInputImages, options)
        uploadComponentFireInputFunction([{ id: 1, weight: 0 }])

        await waitFor(() => {
          expect(draggableProps.value).toHaveLength(1)
          expect(draggableProps.value[0].id).toBe(1)
        })
      })

      test('Imageモデルはそのまま保持', async () => {
        const image = imageFactory.build()
        props.images = [image]
        render(AppInputImages, options)
        uploadComponentFireInputFunction([image, {}])

        await waitFor(() => {
          expect(draggableProps.value).toHaveLength(2)
          expect(draggableProps.value[0]).toStrictEqual(image)
        })
      })
    })

    describe('input-filter', () => {
      test('newFile.xhr.withCredentialsをセット', () => {
        const newFile = {
          xhr: {
            withCredentials: false
          }
        }
        render(AppInputImages, options)
        uploadComponentFireInputFilterFunction(newFile)

        expect(newFile.xhr.withCredentials).toBeTruthy()
      })
    })
  })

  describe('onPaste', () => {
    let event: any
    let getAsFileMock: jest.Mock
    let uploaderComponentAddMock: jest.Mock

    beforeEach(() => {
      getAsFileMock = jest.fn().mockReturnValue('file')
      event = {
        clipboardData: {
          items: [
            { kind: 'file', type: 'image/jpeg', getAsFile: getAsFileMock }
          ]
        }
      }
      uploaderComponentAddMock = jest.fn()
      options.stubs.VueUploadComponent = defineComponent({
        setup () {
          return {
            add: uploaderComponentAddMock
          }
        },
        template: '<div />'
      })
    })

    test('uploader.addを実行', async () => {
      const { getByLabelText } = render(AppInputImages, options)
      await fireEvent.paste(getByLabelText('ここをクリックして画像をペースト'), event)

      expect(getAsFileMock).toBeCalled()
      expect(uploaderComponentAddMock).toBeCalledWith('file')
    })

    test('画像以外がペーストされた場合は何もしない', async () => {
      event.clipboardData.items[0].type = 'text/html'
      const { getByLabelText } = render(AppInputImages, options)
      await fireEvent.paste(getByLabelText('ここをクリックして画像をペースト'), event)

      expect(getAsFileMock).not.toBeCalled()
      expect(uploaderComponentAddMock).not.toBeCalled()
    })
  })

  describe('upload', () => {
    let wrapper: any
    let images: any[]
    let onUploaded: jest.Mock
    let appInputImages: Ref<any>

    beforeEach(() => {
      onUploaded = jest.fn()
      wrapper = defineComponent({
        components: { AppInputImages },
        setup () {
          appInputImages = ref()
          return {
            appInputImages,
            images,
            onUploaded
          }
        },
        template: `
          <div>
            <AppInputImages
              ref="appInputImages"
              :images="images"
              @uploaded="onUploaded"
            />
          </div>
        `
      })
      options.stubs.VueUploadComponent = defineComponent({
        setup () {
          return {
            active: false
          }
        },
        template: '<div />'
      })
    })

    test('uploadImagesがあればuploader.active=trueにする', () => {
      images = [{}]
      render(wrapper, options)
      appInputImages.value.upload()

      expect(appInputImages.value.uploader.active).toBeTruthy()
    })

    test('uploadImagesがない場合はuploadedを発火', () => {
      images = imageFactory.buildList(1)
      render(wrapper, options)
      appInputImages.value.upload()

      expect(onUploaded).toBeCalledWith({ value: images })
    })
  })

  describe('watch', () => {
    describe('uploaded', () => {
      let uploadComponentSetUploadedFunction: Function

      beforeEach(() => {
        options.stubs.VueUploadComponent = defineComponent({
          setup (_props, { root }) {
            const uploaded = ref(false)
            uploadComponentSetUploadedFunction = async () => {
              uploaded.value = true
              await root.$nextTick()
            }
            return {
              uploaded
            }
          },
          template: '<div />'
        })
      })

      test('trueになったらuploadedイベントを発火', async () => {
        props.images = [{
          response: {}
        }]
        const { emitted } = render(AppInputImages, options)
        await uploadComponentSetUploadedFunction()

        expect(emitted().uploaded).toHaveLength(1)
        expect(emitted().uploaded[0]).toHaveLength(1)
        expect(emitted().uploaded[0][0]).toHaveLength(1)
      })

      test('Imageモデルはそのまま渡す', async () => {
        props.images = [
          imageFactory.build(),
          {
            response: {}
          }
        ]
        const { emitted } = render(AppInputImages, options)
        await uploadComponentSetUploadedFunction()

        expect(emitted().uploaded[0][0][0]).toBe(props.images[0])
      })

      test('Imageモデルでない場合はresponseを渡す', async () => {
        props.images = [{
          response: {}
        }]
        const { emitted } = render(AppInputImages, options)
        await uploadComponentSetUploadedFunction()

        expect(emitted().uploaded[0][0][0]).toBe(props.images[0].response)
      })

      test('uploadImagesがなければ何もしない', async () => {
        props.images = []
        const { emitted } = render(AppInputImages, options)
        await uploadComponentSetUploadedFunction()

        expect(emitted().uploaded).toBeFalsy()
      })
    })
  })
})
