import React from 'react'

import {render} from '@testing-library/react'

function setup(
  override = {CLOUD: true, text: '\n![](https://i.imgur.com/k3wIaNU.gif)\n'}
) {
  const {CLOUD, text} = override
  jest.mock('src/shared/constants', () => ({CLOUD}))
  const {
    MarkdownRenderer,
  } = require('src/shared/components/views/MarkdownRenderer.tsx')

  const wrapper = render(<MarkdownRenderer text={text} />)

  return wrapper
}

describe('the MarkdownRenderer wrapper around ReactMarkdown', () => {
  describe('image rendering behavior', () => {
    describe('in cloud contexts', () => {
      it('renders the image markdown literal, rather than rendering the image', () => {
        const {getByText} = setup()
        expect(getByText('![](https://i.imgur.com/k3wIaNU.gif)'))
      })

      it('renders the image markdown literal, when given image html tag', () => {
        const {getByText} = setup({
          CLOUD: true,
          text: '<img src="https://i.random.com/k3wIaNU.gif" />',
        })

        const markdown = getByText(/gif/)
        expect(markdown).toBeTruthy()
      })
    })

    describe('in oss contexts', () => {
      it('renders the image', () => {
        const {container} = setup({
          CLOUD: false,
          text: '\n![](https://i.imgur.com/k3wIaNU.gif)\n',
        })

        expect(
          container.querySelector('img[src*="https://i.imgur.com/k3wIaNU.gif"]')
        )
      })
    })
  })
})
