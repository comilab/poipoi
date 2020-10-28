import { Factory, IFactory } from 'rosie'

import Reaction from '~/models/Reaction'
import postFactory from '~/test/factories/post'
import { fakeEmoji } from '~/test/helper'

const reactionFactory: IFactory<Reaction> = Factory.define('reaction', Reaction)
  .sequence('id')
  .attrs({
    postId: () => postFactory.build().id,
    emoji: fakeEmoji,
    createdAt: () => new Date(),
    updatedAt: () => new Date()
  })

export default reactionFactory
