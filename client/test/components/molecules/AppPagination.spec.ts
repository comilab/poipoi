import { fireEvent, render } from '@testing-library/vue'

import AppPagination from '~/components/molecules/AppPagination.vue'
import Pagination from '~/models/Pagination'
import paginationFactory from '~/test/factories/pagination'

describe('components/molecules/AppPagination', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        pagination: paginationFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true
      }
    }
  })

  test('renders correctly', () => {
    options.props.pagination = new Pagination({
      currentPage: 5,
      from: 51,
      lastPage: 10,
      path: '/',
      perPage: 10,
      to: 60,
      total: 100
    })
    const { container } = render(AppPagination, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    describe('pagination', () => {
      test('currentPageが1ならpage-firstはクリック不可', () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 1
        })
        const { getByTestId } = render(AppPagination, options)

        expect(getByTestId('page-first')).toHaveClass('pointer-events-none')
      })

      test('currentPageとlastPageが等しければpage-lastはクリック不可', () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 1,
          lastPage: 1
        })
        const { getByTestId } = render(AppPagination, options)

        expect(getByTestId('page-last')).toHaveClass('pointer-events-none')
      })

      test('ページボタンはcurrentPageを中心に5個まで表示', () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 7,
          lastPage: 100
        })
        const { queryByTestId } = render(AppPagination, options)
        expect(queryByTestId('page-4')).not.toBeInTheDocument()
        expect(queryByTestId('page-5')).toBeInTheDocument()
        expect(queryByTestId('page-6')).toBeInTheDocument()
        expect(queryByTestId('page-7')).toBeInTheDocument()
        expect(queryByTestId('page-8')).toBeInTheDocument()
        expect(queryByTestId('page-9')).toBeInTheDocument()
        expect(queryByTestId('page-10')).not.toBeInTheDocument()
      })

      test('currentPageが2以下の場合は1ページ目から5ページ目まで表示', () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 2,
          lastPage: 100
        })
        const { queryByTestId } = render(AppPagination, options)
        expect(queryByTestId('page-1')).toBeInTheDocument()
        expect(queryByTestId('page-2')).toBeInTheDocument()
        expect(queryByTestId('page-3')).toBeInTheDocument()
        expect(queryByTestId('page-4')).toBeInTheDocument()
        expect(queryByTestId('page-5')).toBeInTheDocument()
        expect(queryByTestId('page-6')).not.toBeInTheDocument()
      })

      test('lastPageが4以下の場合は1ページ目からlastPageページ目まで表示', () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 4,
          lastPage: 4
        })
        const { queryByTestId } = render(AppPagination, options)
        expect(queryByTestId('page-1')).toBeInTheDocument()
        expect(queryByTestId('page-2')).toBeInTheDocument()
        expect(queryByTestId('page-3')).toBeInTheDocument()
        expect(queryByTestId('page-4')).toBeInTheDocument()
        expect(queryByTestId('page-5')).not.toBeInTheDocument()
      })

      test('lastPageを超えて描画しない', () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 1,
          lastPage: 3
        })
        const { queryByTestId } = render(AppPagination, options)
        expect(queryByTestId('page-4')).not.toBeInTheDocument()
      })

      test('ページボタンが2以上から始まっている場合はleft-ellipsisを表示', async () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 1
        })
        const { queryByTestId, updateProps } = render(AppPagination, options)
        expect(queryByTestId('left-ellipsis')).not.toBeInTheDocument()

        await updateProps({
          pagination: paginationFactory.build({
            currentPage: 4,
            lastPage: 6
          })
        })
        expect(queryByTestId('page-1')).not.toBeInTheDocument()
        expect(queryByTestId('left-ellipsis')).toBeInTheDocument()
      })

      test('最後に表示されるページボタンがlastPageと異なる場合はright-ellipsisを表示', async () => {
        options.props.pagination = paginationFactory.build({
          currentPage: 5,
          lastPage: 7
        })
        const { queryByTestId, updateProps } = render(AppPagination, options)
        expect(queryByTestId('right-ellipsis')).not.toBeInTheDocument()

        await updateProps({
          pagination: paginationFactory.build({
            currentPage: 5,
            lastPage: 8
          })
        })
        expect(queryByTestId('right-ellipsis')).toBeInTheDocument()
      })
    })
  })

  describe('event', () => {
    test('page-firstをクリックするとselected(1)イベントを発火', async () => {
      options.props.pagination = paginationFactory.build({
        currentPage: 2
      })
      const { getByTestId, emitted } = render(AppPagination, options)
      await fireEvent.click(getByTestId('page-first'))

      expect(emitted().selected).toHaveLength(1)
      expect(emitted().selected[0]).toStrictEqual([1])
    })

    test('page-lastをクリックするとselected(lastPage)イベントを発火', async () => {
      options.props.pagination = paginationFactory.build({
        currentPage: 1,
        lastPage: 10
      })
      const { getByTestId, emitted } = render(AppPagination, options)
      await fireEvent.click(getByTestId('page-last'))

      expect(emitted().selected).toHaveLength(1)
      expect(emitted().selected[0]).toStrictEqual([10])
    })

    test('page-{num}をクリックするとselected(num)イベントを発火', async () => {
      options.props.pagination = paginationFactory.build({
        currentPage: 1,
        lastPage: 10
      })
      const { getByTestId, emitted } = render(AppPagination, options)
      await fireEvent.click(getByTestId('page-2'))

      expect(emitted().selected).toHaveLength(1)
      expect(emitted().selected[0]).toStrictEqual([2])
    })
  })
})
