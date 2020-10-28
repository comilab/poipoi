export default class Setting {
  siteTitle: string
  siteDescription: string
  perPage: number
  denyRobot: boolean
  enableFeed: boolean
  postDefault: {
    denyRobotScope: string[]
    enableReaction: boolean
    enableTwitterShare: boolean
    allowedEmojis: string[]
    deniedEmojis: string[]
  }

  constructor (data: any) {
    this.siteTitle = data.siteTitle
    this.siteDescription = data.siteDescription
    this.perPage = data.perPage
    this.denyRobot = data.denyRobot
    this.enableFeed = data.enableFeed
    this.postDefault = {
      denyRobotScope: data.postDefault.denyRobotScope,
      enableReaction: data.postDefault.enableReaction,
      enableTwitterShare: data.postDefault.enableTwitterShare,
      allowedEmojis: data.postDefault.allowedEmojis,
      deniedEmojis: data.postDefault.deniedEmojis
    }
  }
}
