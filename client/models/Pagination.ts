export default class Pagination {
  currentPage: number
  from: number
  lastPage: number
  path: string
  perPage: number
  to: number
  total: number

  constructor (data: any) {
    this.currentPage = data.currentPage
    this.from = data.from
    this.lastPage = data.lastPage
    this.path = data.path
    this.perPage = data.perPage
    this.to = data.to
    this.total = data.total
  }
}
