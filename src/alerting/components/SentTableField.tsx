// Libraries
import React, {FC} from 'react'
import {Icon, IconFont} from '@influxdata/clockface'

// Types
import {NotificationRow} from 'src/types'

interface Props {
  row: NotificationRow
}

const SentTableField: FC<Props> = ({row: {sent}}) => {
  const modifier = sent === 'true' ? 'sent' : 'not-sent'

  return (
    <div
      className={`sent-table-field sent-table-field--${modifier}`}
      data-testid={`sent-table-field ${modifier}`}
    >
      {sent === 'true' ? (
        <Icon glyph={IconFont.CheckMark_New} />
      ) : (
        <Icon glyph={IconFont.AlertTriangle} />
      )}
    </div>
  )
}

export default SentTableField
