import { render, RenderOptions, within } from '@testing-library/vue'

import AppSection from '~/components/atoms/AppSection.vue'

describe('components/atoms/AppSection', () => {
  let options: RenderOptions<AppSection>
  let props: any

  beforeEach(() => {
    props = {}

    options = {
      props,
      slots: {
        default: 'default-slot',
        title: 'title-slot'
      }
    }
  })

  test('renders correctly', () => {
    const { container, getByText, getByTestId } = render(AppSection, options)

    expect(container).toMatchSnapshot()
    getByText('default-slot')
    within(getByTestId('title')).getByText('title-slot')
  })

  describe('props', () => {
    describe('title', () => {
      beforeEach(() => {
        props.title = 'title'
        delete options.slots?.title
      })

      test('タイトルとして表示', () => {
        const { container, getByTestId } = render(AppSection, options)

        expect(container).toMatchSnapshot()
        within(getByTestId('title')).getByText('title')
      })

      test('titleもslot#titleもなければタイトルを描画しない', () => {
        props.title = null
        const { container, queryByTestId } = render(AppSection, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('title')).not.toBeInTheDocument()
      })
    })

    describe('tag', () => {
      test('デフォルトはsection', () => {
        const { container, queryByTestId } = render(AppSection, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('section')!.tagName).toBe('SECTION')
      })

      test('指定があればそのタグで描画', () => {
        props.tag = 'div'
        const { container, queryByTestId } = render(AppSection, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('section')).toBeInstanceOf(HTMLDivElement)
      })
    })
  })
})
