import {IconFont} from '@influxdata/clockface'
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
    description: 'Add details and information',
    icon: IconFont.Text_New,
    initial: () => ({
      text: '',
      mode: 'edit',
    }),
  })
}
