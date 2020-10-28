import dayjs, { Dayjs } from 'dayjs'

import Post from '~/models/Post'

export default class Notification {
  id: number
  postId: number
  emoji: string
  createdAt: Dayjs|null = null
  updatedAt: Dayjs|null = null

  post: Post|null = null

  constructor (data: any) {
    this.id = data.id
    this.postId = data.postId
    this.emoji = data.emoji
    if (data.createdAt) {
      this.createdAt = dayjs.utc(data.createdAt).local()
    }
    if (data.updatedAt) {
      this.updatedAt = dayjs.utc(data.updatedAt).local()
    }

    if (data.post) {
      this.post = new Post(data.post)
    }
  }
}
