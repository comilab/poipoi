import faker from 'faker'
import EmojiPack from '@kevinfaguiar/vue-twemoji-picker/src/interfaces/EmojiPack'
import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/ja/emoji-all-groups.json'
import { render } from '@testing-library/vue'

import useValidationProviderStub from '~/test/stubs/ValidationProvider'

const emojis = (EmojiAllData as EmojiPack[])
  .map((pack) => {
    return pack.emojiList.map(emojiData => emojiData.unicode)
  })
  .flat()

export function allEmojis () {
  return [...emojis]
}

export function fakeEmoji (count?: number) {
  if (!count) {
    return faker.random.arrayElement(emojis)
  }
  return faker.random.arrayElements(emojis, count)
}

export function fakeEmojis (count?: number) {
  return faker.random.arrayElements(emojis, count)
}

export function fakeText (length: number) {
  let text = ''
  do {
    text += faker.lorem.word()
  } while (text.length < length)
  return text.substr(0, length)
}

export function getRules (component: any, identifier: string, options: any = {}) {
  if (!options.stubs) {
    options.stubs = {}
  }

  const {
    component: ValidationProviderStub,
    propsList
  } = useValidationProviderStub(false)

  options.stubs.ValidationProvider = ValidationProviderStub
  render(component, options)

  return propsList
    .find((props) => {
      return props.name === identifier ||
        props.vid === identifier
    })?.rules
}
