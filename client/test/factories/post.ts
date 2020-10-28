import { Factory, IFactory } from 'rosie'
import faker from 'faker'
import _ from 'lodash'

import Post from '~/models/Post'
import Image from '~/models/Image'
import Reaction from '~/models/Reaction'
import userFactory from '~/test/factories/user'
import imageFactory from '~/test/factories/image'
import reactionFactory from '~/test/factories/reaction'
import { allEmojis, fakeEmojis } from '~/test/helper'

faker.locale = 'ja'

const postFactory: IFactory<Post> = Factory.define('post', Post)
  .sequence('id')
  .attrs({
    userId: () => userFactory.build().id,
    title: faker.lorem.sentence,
    caption: faker.lorem.text,
    showImagesList: faker.random.boolean,
    text: faker.lorem.text,
    scope: () => faker.random.arrayElement(['public', 'password', 'private']),
    password: faker.internet.password,
    publishStart: () => {
      return faker.random.arrayElement([null, faker.date.past()])
    },
    publishEnd: () => {
      return faker.random.arrayElement([null, faker.date.future()])
    },
    rating: () => faker.random.arrayElement([null, 'nsfw', 'r18']),
    pinned: faker.random.boolean,
    showThumbnail: faker.random.boolean,
    denyRobot: () => faker.random.arrayElement([null, true, false]),
    enableReaction: () => faker.random.arrayElement([null, true, false]),
    allowedEmojis: () => faker.random.arrayElement([null, [], fakeEmojis()]),
    deniedEmojis: () => faker.random.arrayElement([null, [], fakeEmojis()]),
    enableTwitterShare: () => faker.random.arrayElement([null, true, false]),
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
    url: faker.internet.url
  })
  .attr('textCount', ['text'], (text: string) => text.length)
  .attr('actualDenyRobot', ['denyRobot'], (denyRobot: boolean|null) => {
    return denyRobot === null ? faker.random.boolean : denyRobot
  })
  .attr('actualEnableReaction', ['enableReaction'], (enableReaction: boolean|null) => {
    return enableReaction === null ? faker.random.boolean : enableReaction
  })
  .attr('actualAllowedEmojis', ['allowedEmojis'], (allowedEmojis: boolean|null) => {
    return allowedEmojis === null ? [] : allowedEmojis
  })
  .attr('actualDeniedEmojis', ['denyRobot'], (deniedEmojis: boolean|null) => {
    return deniedEmojis === null ? [] : deniedEmojis
  })
  .attr('emojis', ['actualAllowedEmojis', 'actualDeniedEmojis'], (actualAllowedEmojis: string[], actualDeniedEmojis: string[]) => {
    if (actualAllowedEmojis.length && actualDeniedEmojis.length) {
      return _.difference(actualAllowedEmojis, actualDeniedEmojis)
    }
    if (actualAllowedEmojis.length) {
      return actualAllowedEmojis
    }
    return _.difference(allEmojis(), actualDeniedEmojis)
  })
  .attr('actualEnableTwitterShare', ['enableTwitterShare'], (enableTwitterShare: boolean|null) => {
    return enableTwitterShare === null ? faker.random.boolean : enableTwitterShare
  })
  .attr('images', ['id', 'images'], (id: number, images?: Image[]) => {
    if (!images) {
      return []
    }
    return images.map(image => imageFactory.build({ ...image, postId: id }))
  })
  .attr('imagesCount', ['images'], (images: Image[]) => images.length)
  .attr('reactions', ['id', 'reactions'], (id: number, reactions?: Image[]) => {
    if (!reactions) {
      return []
    }
    return reactions.map(reaction => reactionFactory.build({ ...reaction, postId: id }))
  })
  .attr('reactionsCount', ['reactions'], (reactions: Reaction[]) => reactions.length)

export default postFactory
