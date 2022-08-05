import {IconFont} from '@influxdata/clockface'
import {keyboardCopyTriggered} from 'src/utils/crossPlatform'
import {userSelection} from 'src/utils/crossPlatform'

export const HOMEPAGE_NAVIGATION_STEPS = [
  {
    name: 'Overview',
    glyph: IconFont.BookOutline,
  },
  {
    name: 'Install\n Dependencies',
    glyph: IconFont.Install,
  },
  {
    name: 'Tokens',
    glyph: IconFont.CopperCoin,
  },
  {
    name: 'Initialize\n Client',
    glyph: IconFont.CogSolid_New,
  },
  {
    name: 'Write\n Data',
    glyph: IconFont.Pencil,
  },
  {
    name: 'Execute a\n Simple Query',
    glyph: IconFont.Play,
  },
  {
    name: 'Execute an\n Aggregate Query',
    glyph: IconFont.Play,
  },
  {
    name: 'Finish',
    glyph: IconFont.StarSmile,
  },
]

export const HOMEPAGE_NAVIGATION_STEPS_SHORT = [
  {
    name: 'Overview',
    glyph: IconFont.BookOutline,
  },
  {
    name: 'Install\n Dependencies',
    glyph: IconFont.Install,
  },
  {
    name: 'Initialize\n Client',
    glyph: IconFont.CogSolid_New,
  },
  {
    name: 'Write\n Data',
    glyph: IconFont.Pencil,
  },
  {
    name: 'Execute\n Flux Query',
    glyph: IconFont.Play,
  },
  {
    name: 'Execute\n Aggregate',
    glyph: IconFont.Play,
  },
  {
    name: 'Finished!',
    glyph: IconFont.StarSmile,
  },
]

export const copyListener = terms => {
  const fireKeyboardCopyEvent = event => {
    if (event.repeat) return
    console.log('here')
    terms.forEach(item => {
      if (keyboardCopyTriggered(event) && item.includes(userSelection())) {
        console.log('copied')
        return true
      }
    })
  }
  document.addEventListener('keydown', fireKeyboardCopyEvent)
  return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
}
