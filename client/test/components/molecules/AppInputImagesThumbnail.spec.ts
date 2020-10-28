import { fireEvent, render } from '@testing-library/vue'
import { defineComponent } from 'nuxt-composition-api'
import { faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons'

import AppInputImagesThumbnail from '~/components/molecules/AppInputImagesThumbnail.vue'
import imageFactory from '~/test/factories/image'

describe('components/molecules/AppInputImagesThumbnail', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        image: {
          file: {},
          active: false,
          success: false
        },
        num: 1
      },
      stubs: {
        FontAwesomeIcon: true
      }
    }
  })

  test('renders correctly', () => {
    const { container } = render(AppInputImagesThumbnail, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    describe('image', () => {
      describe('Imageモデルの場合', () => {
        test('img要素のsrc属性にpaths.smallをセット', () => {
          options.props.image = imageFactory.build()
          const { getByTestId } = render(AppInputImagesThumbnail, options)

          expect(getByTestId('thumbnail')).toHaveAttribute('src', options.props.image.paths.small)
        })
      })

      describe('Imageモデルでない場合', () => {
        let fontAwesomeIconProps: any

        beforeEach(() => {
          options.stubs.FontAwesomeIcon = defineComponent({
            props: ['icon'],
            setup (props) {
              fontAwesomeIconProps = props
            },
            template: '<span />'
          })
        })

        test('activeがtrueなら進捗アイコンとしてfaSpinnerを表示する', async () => {
          const { queryByTestId, updateProps } = render(AppInputImagesThumbnail, options)
          expect(queryByTestId('progress')).not.toBeInTheDocument()

          await updateProps({
            image: {
              file: {},
              active: true,
              success: false
            }
          })
          expect(queryByTestId('progress')).toBeInTheDocument()
          expect(fontAwesomeIconProps.icon).toBe(faSpinner)
        })

        test('successがtrueなら進捗アイコンとしてfaCheckを表示する', async () => {
          const { queryByTestId, updateProps } = render(AppInputImagesThumbnail, options)
          expect(queryByTestId('progress')).not.toBeInTheDocument()

          await updateProps({
            image: {
              file: {},
              active: false,
              success: true
            }
          })
          expect(queryByTestId('progress')).toBeInTheDocument()
          expect(fontAwesomeIconProps.icon).toBe(faCheck)
        })

        test('activeがtrueなら削除ボタンをdisabledにする', async () => {
          const { queryByTestId, updateProps } = render(AppInputImagesThumbnail, options)
          expect(queryByTestId('remove-button')).not.toHaveAttribute('disabled')

          await updateProps({
            image: {
              file: {},
              active: true,
              success: false
            }
          })
          expect(queryByTestId('remove-button')).toHaveAttribute('disabled')
        })

        test('successがtrueなら削除ボタンをdisabledにする', async () => {
          const { queryByTestId, updateProps } = render(AppInputImagesThumbnail, options)
          expect(queryByTestId('remove-button')).not.toHaveAttribute('disabled')

          await updateProps({
            image: {
              file: {},
              active: false,
              success: true
            }
          })
          expect(queryByTestId('remove-button')).toHaveAttribute('disabled')
        })
      })
    })

    describe('num', () => {
      test('numを表示', () => {
        const { getByText } = render(AppInputImagesThumbnail, options)

        getByText('1')
      })
    })
  })

  describe('event', () => {
    describe('remove', () => {
      test('閉じるボタンを押したときに発火', async () => {
        const { getByTestId, emitted } = render(AppInputImagesThumbnail, options)
        await fireEvent.click(getByTestId('remove-button'))

        expect(emitted().remove).toHaveLength(1)
      })
    })
  })
})
