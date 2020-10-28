import { render } from '@testing-library/vue'
import dayjs from 'dayjs'
import faker from 'faker'

import AppPostBadges from '~/components/organisms/AppPostBadges.vue'
import postFactory from '~/test/factories/post'

describe('components/organisms/AppPostBadges', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true
      }
    }
  })

  test('renders correctly', () => {
    options.props.post = postFactory.build({
      pinned: true,
      rating: 'nsfw',
      scope: 'public',
      publishStart: null,
      publishEnd: null
    })
    const { container } = render(AppPostBadges, options)

    expect(container).toMatchSnapshot()
  })

  test('pinned', async () => {
    options.props.post = postFactory.build({
      pinned: true
    })
    const { queryByLabelText, updateProps } = render(AppPostBadges, options)

    expect(queryByLabelText('固定')).toBeInTheDocument()

    await updateProps({
      post: postFactory.build({
        pinned: false
      })
    })
    expect(queryByLabelText('固定')).not.toBeInTheDocument()
  })

  describe('rating', () => {
    test('none', () => {
      options.props.post = postFactory.build({
        rating: null
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('閲覧注意')).not.toBeInTheDocument()
      expect(queryByText('R-18')).not.toBeInTheDocument()
    })

    test('nsfw', () => {
      options.props.post = postFactory.build({
        rating: 'nsfw'
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('閲覧注意')).toBeInTheDocument()
      expect(queryByText('R-18')).not.toBeInTheDocument()
    })

    test('r18', () => {
      options.props.post = postFactory.build({
        rating: 'r18'
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('閲覧注意')).not.toBeInTheDocument()
      expect(queryByText('R-18')).toBeInTheDocument()
    })
  })

  describe('scope', () => {
    test('public', () => {
      options.props.post = postFactory.build({
        scope: 'public'
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('パスワード')).not.toBeInTheDocument()
      expect(queryByText('非公開')).not.toBeInTheDocument()
    })

    test('password', () => {
      options.props.post = postFactory.build({
        scope: 'password'
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('パスワード')).toBeInTheDocument()
      expect(queryByText('非公開')).not.toBeInTheDocument()
    })

    test('private', () => {
      options.props.post = postFactory.build({
        scope: 'private'
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('パスワード')).not.toBeInTheDocument()
      expect(queryByText('非公開')).toBeInTheDocument()
    })
  })

  describe('公開期間外', () => {
    test('publishStartが現在以降なら表示', () => {
      options.props.post = postFactory.build({
        publishStart: dayjs(faker.date.future()),
        publishEnd: null
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('公開期間外')).toBeInTheDocument()
    })

    test('publishEndが現在以前なら表示', () => {
      options.props.post = postFactory.build({
        publishStart: null,
        publishEnd: dayjs(faker.date.past())
      })
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('公開期間外')).toBeInTheDocument()
    })

    test.each([
      { publishStart: null, publishEnd: null },
      { publishStart: faker.date.past(), publishEnd: null },
      { publishStart: null, publishEnd: faker.date.future() }
    ])('それ以外なら表示しない', (attributes: any) => {
      options.props.post = postFactory.build(attributes)
      const { queryByText } = render(AppPostBadges, options)

      expect(queryByText('公開期間外')).not.toBeInTheDocument()
    })
  })
})
