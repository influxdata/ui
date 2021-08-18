import {SimpleTableViewProperties} from 'src/types'
import {defaultViewQuery} from 'src/views/helpers/index'

export default {
  type: 'simple-table',
  showAll: false,
  queries: [defaultViewQuery()],
  shape: 'chronograf-v2',
  note: '',
  showNoteWhenEmpty: false,
} as SimpleTableViewProperties
