// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'
import {get} from 'lodash'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import CreateScraperForm from 'src/scrapers/components/CreateScraperForm'

// Actions
import {createScraper} from 'src/scrapers/actions/thunks'

// Types
import {AppState, Bucket, ResourceType, ScraperTargetRequest} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

interface OwnProps {
  visible: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps &
  ReduxProps &
  RouteComponentProps<{orgID: string; bucketID: string}>

interface State {
  scraper: ScraperTargetRequest
}

class CreateScraperOverlay extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const {
      match: {
        params: {bucketID, orgID},
      },
      buckets,
    } = this.props

    // The first two buckets are system buckets
    const firstBucketID = get(buckets, '2.id', '')

    this.state = {
      scraper: {
        name: 'Name this Scraper',
        type: 'prometheus',
        url: `${this.origin}/metrics`,
        orgID,
        bucketID: bucketID ? bucketID : firstBucketID,
      },
    }
  }

  public render() {
    const {scraper} = this.state
    const {buckets} = this.props

    return (
      <Overlay visible={true}>
        <Overlay.Container maxWidth={600}>
          <Overlay.Header title="Create Scraper" onDismiss={this.onDismiss} />
          <Overlay.Body>
            <h5 className="wizard-step--sub-title">
              Scrapers collect data from multiple targets at regular intervals
              and to write to a bucket
            </h5>
            <CreateScraperForm
              buckets={buckets}
              url={scraper.url}
              name={scraper.name}
              selectedBucketID={scraper.bucketID}
              onInputChange={this.handleInputChange}
              onSelectBucket={this.handleSelectBucket}
              onSubmit={this.handleFormSubmit}
              onDismiss={this.onDismiss}
            />
          </Overlay.Body>
        </Overlay.Container>
      </Overlay>
    )
  }

  private handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const key = e.target.name
    const scraper = {...this.state.scraper, [key]: value}

    this.setState({
      scraper,
    })
  }

  private handleSelectBucket = (bucket: Bucket) => {
    const {orgID, id} = bucket

    const scraper = {...this.state.scraper, orgID: orgID, bucketID: id}

    this.setState({scraper})
  }

  private handleFormSubmit = (e: FormEvent<HTMLFormElement>): void => {
    const {onCreateScraper} = this.props
    const {scraper} = this.state
    e.preventDefault()
    onCreateScraper(scraper)
    this.onDismiss()
  }

  private get origin(): string {
    return window.location.origin
  }

  private onDismiss = (): void => {
    this.props.history.goBack()
  }
}

const mstp = (state: AppState) => ({
  buckets: getAll<Bucket>(state, ResourceType.Buckets),
})

const mdtp = {
  onCreateScraper: createScraper,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(CreateScraperOverlay))
