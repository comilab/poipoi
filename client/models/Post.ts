import dayjs, { Dayjs } from 'dayjs'

import Image from '~/models/Image'
import Reaction from '~/models/Reaction'

export type ScopeUnion = 'public'|'password'|'private'

export type RatingUnion = null|'nsfw'|'r18'

export default class Post {
  id: number
  userId: number
  title: string
  caption: string
  showImagesList: boolean
  text: string
  scope: ScopeUnion
  password: string|null
  publishStart: Dayjs|null = null
  publishEnd: Dayjs|null = null
  rating: RatingUnion
  pinned: boolean
  showThumbnail: boolean
  denyRobot: boolean|null
  enableReaction: boolean|null
  allowedEmojis: string[]|null
  deniedEmojis: string[]|null
  enableTwitterShare: boolean|null
  createdAt: Dayjs|null = null
  updatedAt: Dayjs|null = null

  url: string
  textCount: number
  actualDenyRobot: boolean
  actualEnableReaction: boolean
  actualAllowedEmojis: string[]
  actualDeniedEmojis: string[]
  actualEnableTwitterShare: boolean
  emojis: string[] = []

  images: Image[] = []
  imagesCount: number

  reactions: Reaction[] = []
  reactionsCount: number

  constructor (data: any) {
    this.id = data.id
    this.userId = data.userId
    this.title = data.title
    this.caption = data.caption
    this.showImagesList = data.showImagesList
    this.text = data.text
    this.scope = data.scope
    this.password = data.password
    if (data.publishStart) {
      this.publishStart = dayjs.utc(data.publishStart).local()
    }
    if (data.publishEnd) {
      this.publishEnd = dayjs.utc(data.publishEnd).local()
    }
    this.rating = data.rating
    this.pinned = data.pinned
    this.showThumbnail = data.showThumbnail
    this.denyRobot = data.denyRobot
    this.enableReaction = data.enableReaction
    this.allowedEmojis = data.allowedEmojis
    this.deniedEmojis = data.deniedEmojis
    this.enableTwitterShare = data.enableTwitterShare
    if (data.createdAt) {
      this.createdAt = dayjs.utc(data.createdAt).local()
    }
    if (data.updatedAt) {
      this.updatedAt = dayjs.utc(data.updatedAt).local()
    }

    this.url = data.url
    this.textCount = data.textCount
    this.actualDenyRobot = data.actualDenyRobot
    this.actualEnableReaction = data.actualEnableReaction
    this.actualAllowedEmojis = data.actualAllowedEmojis
    this.actualDeniedEmojis = data.actualDeniedEmojis
    this.actualEnableTwitterShare = data.actualEnableTwitterShare
    this.emojis = data.emojis

    if (data.images) {
      this.images = data.images.map((image: any) => new Image(image))
    }
    this.imagesCount = data.imagesCount

    if (data.reactions) {
      this.reactions = data.reactions.map((reaction: any) => new Reaction(reaction))
    }
    this.reactionsCount = data.reactionsCount
  }

  get path () {
    return `/posts/${this.id}`
  }

  get textPages () {
    return (this.text || '').split('[newpage]').map(page => page.trim())
  }
}
