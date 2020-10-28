import { Factory, IFactory } from 'rosie'
import faker from 'faker'

import Image from '~/models/Image'
import postFactory from '~/test/factories/post'

const imageFactory: IFactory<Image> = Factory.define('image', Image)
  .sequence('id')
  .attrs({
    postId: () => postFactory.build().id,
    filename: faker.system.fileName,
    extension: faker.system.fileExt,
    weight: faker.random.number,
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
    publicPaths: {
      original: faker.internet.url(),
      large: faker.internet.url(),
      medium: faker.internet.url(),
      small: faker.internet.url()
    }
  })

export default imageFactory
