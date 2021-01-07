import React, {PureComponent} from 'react'

import {
  Panel,
  EmptyState,
  ResourceList,
  Sort,
  DapperScrollbars,
  FlexDirection,
  JustifyContent,
  FlexBox,
} from '@influxdata/clockface'

import InvoiceHistoryRow from './InvoiceHistoryRow'
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'
import {Invoice} from 'src/types'

interface Props {
  invoices: Invoice[]
}

interface State {
  target_date: Sort
  amount: Sort
  status: Sort
  currentSort: string
}

class InvoiceHistory extends PureComponent<Props> {
  public state: State = {
    target_date: Sort.Descending,
    amount: Sort.None,
    status: Sort.None,
    currentSort: 'target_date',
  }

  public render() {
    const {invoices} = this.props
    const {target_date, amount, status} = this.state

    return (
      <Panel>
        <Panel.Header>
          <h4>Past Invoices</h4>
        </Panel.Header>
        <Panel.Body>
          <ResourceList>
            {!!invoices.length && (
              <ResourceList.Header className="invoice-headers">
                <FlexBox
                  className="invoice-headers--sorters"
                  direction={FlexDirection.Row}
                  justifyContent={JustifyContent.SpaceBetween}
                  stretchToFitWidth={true}
                >
                  <ResourceList.Sorter
                    name="Invoice Date"
                    onClick={this.handleSort}
                    sort={target_date}
                    sortKey="target_date"
                    className="invoice-header"
                  />
                  <FlexBox direction={FlexDirection.Row}>
                    <ResourceList.Sorter
                      name="Amount"
                      onClick={this.handleSort}
                      sort={amount}
                      sortKey="amount"
                      className="invoice-header"
                    />
                    <ResourceList.Sorter
                      name="Status"
                      onClick={this.handleSort}
                      sort={status}
                      sortKey="status"
                      className="invoice-header status"
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
              {this.invoiceRows}
            </ResourceList.Body>
          </ResourceList>
        </Panel.Body>
      </Panel>
    )
  }

  // Needs to be a function and not a component right now for empty state check
  private get invoiceRows() {
    const {invoices} = this.props

    // required for resource list empty state check
    if (!invoices.length) {
      return null
    }

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
        {this.sortedInvoices.map(invoice => (
          <InvoiceHistoryRow key={invoice.target_date} invoice={invoice} />
        ))}
      </DapperScrollbars>
    )
  }

  private get sortedInvoices(): Invoice[] {
    const {invoices} = this.props
    const {currentSort} = this.state
    const currentSortDirection = this.state[currentSort]

    return getSortedResources(
      invoices,
      currentSort,
      currentSortDirection,
      this.sortType
    )
  }

  private get sortType(): SortTypes {
    const {currentSort} = this.state

    switch (currentSort) {
      case 'status':
      case 'target_date':
        return SortTypes.String
      case 'amount':
        return SortTypes.Float
    }
  }

  private get sortKeys(): string[] {
    return ['target_date', 'amount', 'status']
  }

  private handleSort = (nextSortDirection: Sort, sortKey: string) => {
    const {currentSort} = this.state

    if (sortKey === currentSort) {
      this.setState({[sortKey]: nextSortDirection})
      return
    }

    const sorting = this.sortKeys.reduce((acc, sk) => {
      acc[sk] = sk === sortKey ? nextSortDirection : Sort.None
      return acc
    }, {})

    this.setState({currentSort: sortKey, ...sorting})
  }
}

export default InvoiceHistory
