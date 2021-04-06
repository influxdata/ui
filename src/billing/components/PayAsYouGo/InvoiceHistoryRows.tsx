import React, {FC} from 'react'
import {DapperScrollbars} from '@influxdata/clockface'

// Components
import InvoiceHistoryRow from 'src/billing/components/PayAsYouGo/InvoiceHistoryRow'

// Types
import {Invoice} from 'src/types/billing'

type Props = {
  sortedInvoices: Invoice[]
}

const InvoiceHistoryRows: FC<Props> = ({sortedInvoices}) => {
  return (
    <DapperScrollbars
      autoHide
      autoSize
      style={{
        maxHeight: '350px',
        minWidth: '100%',
        maxWidth: '100%',
        width: '100%',
      }}
    >
      {sortedInvoices.map(invoice => (
        <InvoiceHistoryRow key={invoice.targetDate} invoice={invoice} />
      ))}
    </DapperScrollbars>
  )
}

export default InvoiceHistoryRows
