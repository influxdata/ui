// Libraries
import React, {PureComponent} from 'react'
import memoizeOne from 'memoize-one'
import isEqual from 'lodash/isEqual'

// Components
import {Overlay, ResourceList} from '@influxdata/clockface'
import {TokenRow} from 'src/authorizations/components/TokenRow'
import EditTokenOverlay from 'src/authorizations/components/EditTokenOverlay'

// Types
import {Authorization} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'

// Utils
import {getSortedResources} from 'src/shared/utils/sort'

type SortKey = keyof Authorization

interface Props {
  auths: Authorization[]
  emptyState: JSX.Element
  searchTerm: string
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  onClickColumn: (nextSort: Sort, sortKey: SortKey) => void
}

interface State {
  isTokenOverlayVisible: boolean
  authInView: Authorization
}

export class TokenList extends PureComponent<Props, State> {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  constructor(props) {
    super(props)
    this.state = {
      isTokenOverlayVisible: false,
      authInView: null,
    }
  }

  public componentDidUpdate(prevProps) {
    const {auths: prevAuths} = prevProps
    const {auths: nextAuths} = this.props

    if (!isEqual(prevAuths, nextAuths)) {
      const authInView = nextAuths.find(
        auth => auth.id === this.state.authInView?.id
      )
      this.setState({authInView})
    }
  }

  public render() {
    const {isTokenOverlayVisible, authInView} = this.state

    return (
      <>
        <ResourceList>
          <ResourceList.Body
            emptyState={this.props.emptyState}
            testID="token-list"
          >
            {this.rows}
          </ResourceList.Body>
        </ResourceList>

        <Overlay visible={isTokenOverlayVisible}>
          <EditTokenOverlay
            auth={authInView}
            onDismissOverlay={this.handleDismissOverlay}
          />
        </Overlay>
      </>
    )
  }

  private get rows(): JSX.Element[] {
    const {auths, sortDirection, sortKey, sortType} = this.props
    const sortedAuths = this.memGetSortedResources(
      auths,
      sortKey,
      sortDirection,
      sortType
    )

    return sortedAuths.map(auth => (
      <TokenRow
        key={auth.id}
        auth={auth}
        onClickDescription={this.handleClickDescription}
      />
    ))
  }

  private handleDismissOverlay = () => {
    this.setState({isTokenOverlayVisible: false})
  }

  private handleClickDescription = (authID: string): void => {
    const authInView = this.props.auths.find(auth => auth.id === authID)
    this.setState({isTokenOverlayVisible: true, authInView})
  }
}
