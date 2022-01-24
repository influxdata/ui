import MarkdownPanel from './view'
import ReadOnly from './readOnly'
import './style.scss'

export type MarkdownMode = 'edit' | 'preview'

export default register => {
  register({
    type: 'markdown',
    family: 'passThrough',
    component: MarkdownPanel,
    readOnlyComponent: ReadOnly,
    button: 'Note',
    initial: () => ({
      text: '',
      mode: 'edit',
    }),
  })
}
