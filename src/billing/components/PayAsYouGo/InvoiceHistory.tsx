import React, {FC, useContext, useState} from 'react'

import {
  EmptyState,
  ResourceList,
  Sort,
  FlexDirection,
  JustifyContent,
  FlexBox,
} from '@influxdata/clockface'
import {BillingContext} from 'src/billing/context/billing'

import InvoiceHistoryRows from 'src/billing/components/PayAsYouGo/InvoiceHistoryRows'
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'
import {Invoice} from 'src/types/billing'

const sortType = (sortKey: string): SortTypes => {
  switch (sortKey) {
    case 'status':
    case 'targetDate':
      return SortTypes.String
    case 'amount':
      return SortTypes.Float
  }
}

const InvoiceHistory: FC = () => {
  const {invoices} = useContext(BillingContext)
  const [sortDirection, setSortDirection] = useState(Sort.Descending)
  const [sortKey, setSortKey] = useState('targetDate')

  const sortedInvoices: Invoice[] = getSortedResources(
    invoices,
    sortKey,
    sortDirection,
    sortType(sortKey)
  )

  let invoiceRows = null

  if (invoices.length) {
    invoiceRows = <InvoiceHistoryRows sortedInvoices={sortedInvoices} />
  }

  const handleSort = (nextSortDirection: Sort, sKey: string) => {
    if (sortKey !== sKey) {
      setSortKey(sKey)
    }

    setSortDirection(nextSortDirection)
  }

  return (
    <>
      {!!invoices.length && (
        <ResourceList.Header className="invoice-headers">
          <FlexBox
            className="invoice-headers--sorters"
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.SpaceBetween}
            stretchToFitWidth={true}
          >
            <FlexBox direction={FlexDirection.Row}>
              <ResourceList.Sorter
                name="Invoice Date"
                onClick={handleSort}
                sort={sortKey === 'targetDate' ? sortDirection : Sort.None}
                sortKey="targetDate"
                className="invoice-header"
                testID="invoice-date--sorter"
              />
              <ResourceList.Sorter
                name="Amount"
                onClick={handleSort}
                sort={sortKey === 'amount' ? sortDirection : Sort.None}
                sortKey="amount"
                className="invoice-header"
                testID="invoice-amount--sorter"
              />
              <ResourceList.Sorter
                name="Status"
                onClick={handleSort}
                sort={sortKey === 'status' ? sortDirection : Sort.None}
                sortKey="status"
                className="invoice-header status"
                testID="invoice-status--sorter"
              />
            </FlexBox>
          </FlexBox>
        </ResourceList.Header>
      )}
      <ResourceList.Body
        emptyState={
          <EmptyState>
            <EmptyState.Text>
              Your invoices will appear here after each billing period
            </EmptyState.Text>
          </EmptyState>
        }
      >
        {invoiceRows}
      </ResourceList.Body>
    </>
  )
}

export default InvoiceHistory
