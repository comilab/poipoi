import { Factory, IFactory } from 'rosie'

import Notification from '~/models/Notification'
import Post from '~/models/Post'
import postFactory from '~/test/factories/post'
import { fakeEmoji } from '~/test/helper'

const notificationFactory: IFactory<Notification> = Factory.define('notification', Notification)
  .sequence('id')
  .attrs({
    emoji: fakeEmoji,
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
    post: () => postFactory.build()
  })
  .attr('postId', ['post'], (post: Post) => post.id)

export default notificationFactory
