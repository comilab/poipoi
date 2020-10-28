import { Factory, IFactory } from 'rosie'
import faker from 'faker'

import Pagination from '~/models/Pagination'

const paginationFactory: IFactory<Pagination> = Factory.define('pagination', Pagination)
  .attrs({
    currentPage: 1,
    path: faker.internet.url,
    perPage: faker.random.number,
    total: () => faker.random.number({ min: 1 })
  })
  .attr('lastPage', ['perPage', 'total'], (perPage: number, total: number) => {
    return Math.ceil(total / perPage)
  })
  .attr('from', ['currentPage', 'perPage'], (currenPage: number, perPage: number) => {
    return perPage * (currenPage - 1) + 1
  })
  .attr('to', ['from', 'perPage'], (from: number, perPage: number) => from + perPage - 1)

export default paginationFactory
