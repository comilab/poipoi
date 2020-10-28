import { Factory, IFactory } from 'rosie'
import faker from 'faker'

import Setting from '~/models/Setting'
import { fakeEmojis } from '~/test/helper'

const settingFactory: IFactory<Setting> = Factory.define('setting', Setting)
  .attrs({
    siteTitle: faker.random.word,
    siteDescription: faker.lorem.sentence,
    perPage: () => faker.random.number({ min: 1 }),
    denyRobot: faker.random.boolean,
    enableFeed: faker.random.boolean,
    postDefault: () => {
      return {
        denyRobotScope: faker.random.arrayElements(['public', 'password', 'nsfw', 'r18']),
        enableReaction: faker.random.boolean(),
        enableTwitterShare: faker.random.boolean(),
        allowedEmojis: fakeEmojis(),
        deniedEmojis: fakeEmojis()
      }
    }
  })

export default settingFactory
