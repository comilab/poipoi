import dayjs, { Dayjs } from 'dayjs'

export default class User {
  id: number
  name: string
  email: string
  createdAt: Dayjs|null
  updatedAt: Dayjs|null

  constructor (data: any) {
    this.id = data.id
    this.name = data.name
    this.email = data.email
    if (data.createdAt) {
      this.createdAt = dayjs.utc(data.createdAt).local()
    } else {
      this.createdAt = null
    }
    if (data.updatedAt) {
      this.updatedAt = dayjs.utc(data.updatedAt).local()
    } else {
      this.updatedAt = null
    }
  }
}
