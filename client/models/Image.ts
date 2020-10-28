import dayjs, { Dayjs } from 'dayjs'

export default class Image {
  id: number
  postId: number
  filename: string
  extension: string
  weight: number
  createdAt: Dayjs|null = null
  updatedAt: Dayjs|null = null
  publicPaths: {
    original: string
    large: string
    medium: string
    small: string
  }

  constructor (data: any) {
    this.id = data.id
    this.postId = data.postId
    this.filename = data.filename
    this.extension = data.extension
    this.weight = data.weight
    this.publicPaths = data.publicPaths
    if (data.createdAt) {
      this.createdAt = dayjs.utc(data.createdAt).local()
    }
    if (data.updatedAt) {
      this.updatedAt = dayjs.utc(data.updatedAt).local()
    }
  }

  get paths () {
    return {
      original: `${process.env.apiUrl}${this.publicPaths.original}`,
      large: `${process.env.apiUrl}${this.publicPaths.large}`,
      medium: `${process.env.apiUrl}${this.publicPaths.medium}`,
      small: `${process.env.apiUrl}${this.publicPaths.small}`
    }
  }
}
