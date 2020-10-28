import { Factory, IFactory } from 'rosie'
import faker from 'faker'

import User from '~/models/User'

faker.locale = 'ja'

const userFactory: IFactory<User> = Factory.define('user', User)
  .sequence('id')
  .attrs({
    name: faker.name.findName,
    email: faker.internet.email,
    createdAt: () => new Date(),
    updatedAt: () => new Date()
  })

export default userFactory
