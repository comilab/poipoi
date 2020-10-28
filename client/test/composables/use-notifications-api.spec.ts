import axiosMock from 'axios'
import { mocked } from 'ts-jest/utils'

import useNotificationsApi from '~/composables/use-notifications-api'

jest.mock('axios')

describe('composables/use-notifications-api', () => {
  test('baseUrl is /notifications', async () => {
    const { create } = useNotificationsApi()

    mocked(axiosMock.post).mockResolvedValueOnce({ data: {} })

    await create()

    expect(axiosMock.post).toBeCalledWith('/notifications', {})
  })

  test('returns notifications', () => {
    const api = useNotificationsApi()

    expect(api.notifications).toBe(api.items)
  })
})
