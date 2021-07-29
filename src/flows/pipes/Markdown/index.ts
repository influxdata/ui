import MarkdownPanel from './view'
import './style.scss'

export type MarkdownMode = 'edit' | 'preview'

export default register => {
  register({
    type: 'markdown',
    family: 'passThrough',
    component: MarkdownPanel,
    featureFlag: 'flow-panel--markdown',
    button: 'Markdown',
    initial: () => ({
      text: '',
      mode: 'edit',
    }),
  })
}
