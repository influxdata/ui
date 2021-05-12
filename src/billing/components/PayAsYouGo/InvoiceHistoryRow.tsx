import React, {FC} from 'react'
import classnames from 'classnames'

import {FlexBox, FlexDirection, JustifyContent} from '@influxdata/clockface'

import {Invoice} from 'src/types/billing'

interface Props {
  invoice: Invoice
}

const getPreviousMonth = date => {
  const currentMonth = date.getUTCMonth()
  date.setMonth(currentMonth - 1)
  return date.toLocaleString('default', {month: 'long'})
}

const InvoiceHistoryRow: FC<Props> = ({
  invoice: {status, amount, targetDate, filesId},
}) => {
  const invoiceName = `${getPreviousMonth(new Date(targetDate))} ${new Date(
    targetDate
  ).getFullYear()} Invoice`
  const link = `/billing/invoices/${filesId}`
  const statusClassName = classnames('invoice-details invoice-status', {
    ['paid']: status === 'Paid',
  })

  return (
    <FlexBox
      className="list-item"
      direction={FlexDirection.Row}
      justifyContent={JustifyContent.SpaceBetween}
      stretchToFitWidth={true}
    >
      {/*
        TODO(ariel): see if this is necessary or if we can link to the row internally:
        https://github.com/influxdata/ui/issues/1405
      */}
      <a href={link} target="_blank" rel="noreferrer">
        {invoiceName}
      </a>
      <FlexBox direction={FlexDirection.Row}>
        <strong className="invoice-details">${amount.toFixed(2)}</strong>
        <strong className={statusClassName}>{status}</strong>
      </FlexBox>
    </FlexBox>
  )
}

export default InvoiceHistoryRow
