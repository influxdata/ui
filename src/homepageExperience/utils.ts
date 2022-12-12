import {IconFont} from '@influxdata/clockface'

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
    name: 'Finish',
    glyph: IconFont.StarSmile,
  },
]

export const HOMEPAGE_NAVIGATION_STEPS_ARDUINO = [
  {
    name: 'Overview',
    glyph: IconFont.BookOutline,
  },
  {
    name: 'Prepare\n Arduino IDE',
    glyph: IconFont.Braces,
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
    name: 'Finish',
    glyph: IconFont.StarSmile,
  },
]

// Each onboarding page in the wizard has a single h1 at the top of it. Attempt to scroll it into view smoothly
// Set a timeout of 0 so that this function call gets run after react has a had a chance to update state and
// re-render on the main thread.
export const scrollNextPageIntoView = () => {
  setTimeout(() => {
    document.querySelector('h1').scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, 0)
}
