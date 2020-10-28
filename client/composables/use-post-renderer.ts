import { CreateElement } from 'vue'

import Post from '~/models/Post'
import AppImageZoomable from '~/components/molecules/AppImageZoomable.vue'

const markupPattern = /((?:\r\n|\r|\n)|(?:#\S+)|(?:\[\S+?:.+?\]\]?))/

export const markupPatterns = {
  break: /(\r\n|\r|\n)/,
  hashtag: /(#\S+)/,
  chapter: /\[chapter:(.+?)\]/,
  image: /\[image:(\d+?)\]/,
  jump: /\[jump:(\d+?)\]/,
  ruby: /\[\[rb:(.+?)>(.+?)\]\]/,
  jumpuri: /\[\[jumpuri:(.+?)>(.+?)\]\]/
}

export type MarkupPatternsKeys = keyof typeof markupPatterns

export default function usePostRenderer (vm: Vue, createElement: CreateElement) {
  const post: Post = vm.$props.post
  const pages = post.textPages

  const replace = (text: string, patternKeys: MarkupPatternsKeys[]) => {
    let matches!: RegExpMatchArray|null
    const key = patternKeys.find((key) => {
      matches = text.match(markupPatterns[key])
      return !!matches
    })
    if (!matches) {
      return text
    }
    if (key === 'break') {
      return createElement('br')
    } else if (key === 'hashtag') {
      return createElement('nuxt-link', {
        props: {
          to: { path: '/', query: { keyword: matches.shift() } }
        }
      }, matches.shift())
    } else if (key === 'chapter') {
      return createElement('h3', matches.pop())
    } else if (key === 'image') {
      const key = parseInt(matches.pop()!) - 1
      const image = post.images[key]
      if (image) {
        return createElement(AppImageZoomable, {
          props: {
            src: image.paths.large,
            largeSrc: image.paths.original
          }
        })
      }
    } else if (key === 'jump') {
      const key = parseInt(matches.pop()!) - 1
      const page = pages[key]
      if (page) {
        return createElement('a', {
          on: { click: () => vm.$emit('jump', key) }
        }, `${key + 1}ページ目へ`)
      }
    } else if (key === 'ruby') {
      const [base, text] = matches.slice(1)
      return createElement('ruby', [base.trim(), createElement('rt', text.trim())])
    } else if (key === 'jumpuri') {
      const [title, url] = matches.slice(1)
      return createElement('a', {
        attrs: {
          href: url.trim(),
          target: '_blank'
        }
      }, title.trim())
    }
    return text
  }

  const split = (text: string, patternKeys: MarkupPatternsKeys[]) => {
    return text.split(markupPattern)
      .filter(splitted => !!splitted)
      .map((splitted) => {
        if (markupPattern.test(splitted)) {
          return replace(splitted, patternKeys)
        }
        return splitted
      })
  }

  return {
    replace,
    split
  }
}
