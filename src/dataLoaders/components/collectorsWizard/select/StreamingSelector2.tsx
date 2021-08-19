// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import uuid from 'uuid'

// Components
import {
  Input,
  EmptyState,
  FormElement,
  Grid,
  IconFont,
  SquareGrid,
} from '@influxdata/clockface'
import {ErrorHandling} from 'src/shared/decorators/errors'
import CreateBucketButton from 'src/buckets/components/CreateBucketButton'
// Constants
import BucketDropdown from 'src/dataLoaders/components/BucketsDropdown'
import {
  WRITE_DATA_TELEGRAF_PLUGINS,
  TelegrafPlugin,
} from 'src/writeData/constants/contentTelegrafPlugins'

// Types

import {Bucket, BundleName} from 'src/types'
import {Columns, ComponentSize} from '@influxdata/clockface'
import WriteDataItem from 'src/writeData/components/WriteDataItem'

export interface Props {
  buckets: Bucket[]
  selectedBucketName: string
  pluginBundles: BundleName[]
  telegrafPlugins: any
  onTogglePluginBundle: (bundle: string) => void
  onSelectBucket: (bucket: Bucket) => void
}

interface State {
  gridSizerUpdateFlag: string
  searchTerm: string
  emptyOriginal: boolean
}

@ErrorHandling
class StreamingSelectorTelegrafUiRefresh extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      gridSizerUpdateFlag: uuid.v4(),
      searchTerm: '',
      emptyOriginal: true,
    }
  }

  public componentDidUpdate(prevProps) {
    const addFirst =
      prevProps.telegrafPlugins.length === 0 &&
      this.props.telegrafPlugins.length > 0

    const removeLast =
      prevProps.telegrafPlugins.length > 0 &&
      this.props.telegrafPlugins.length === 0

    if (addFirst || removeLast) {
      const gridSizerUpdateFlag = uuid.v4()
      this.setState({gridSizerUpdateFlag})
    }
  }

  public render() {
    const {buckets} = this.props
    const {searchTerm} = this.state

    return (
      <div className="wizard-step--grid-container_telegrafUiRefresh">
        {buckets.length ? (
          <>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Six}>
                <FormElement label="Bucket">
                  <BucketDropdown
                    selectedBucketID={this.selectedBucketID}
                    buckets={buckets}
                    onSelectBucket={this.handleSelectBucket}
                    emptyOriginal={this.state.emptyOriginal}
                  />
                </FormElement>
              </Grid.Column>
            </Grid.Row>
            <FormElement label="">
              <Input
                className="wizard-step--filter"
                size={ComponentSize.Small}
                icon={IconFont.Search}
                value={searchTerm}
                onBlur={this.handleFilterBlur}
                onChange={this.handleFilterChange}
                placeholder="Filter sources..."
              />
            </FormElement>
            <SquareGrid cardSize="150px" gutter={ComponentSize.Small}>
              {this.filteredBundles.map(item => (
                <WriteDataItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  url={`${item.id}`}
                  selected={this.isCardChecked(item.id)}
                  onClick={this.handleToggle}
                  testID={`telegraf-plugins--${item}`}
                />
              ))}
            </SquareGrid>
          </>
        ) : (
          <>
            <Grid.Row style={{width: 'auto'}}>
              <CreateBucketButton />
            </Grid.Row>
            <h3 data-testid="create-bucket-prompt">
              Create a Bucket To Show Telegraf Plugins
            </h3>
          </>
        )}
        {this.emptyState}
      </div>
    )
  }

  private get selectedBucketID(): string {
    const {buckets, selectedBucketName} = this.props

    return buckets.find(b => b.name === selectedBucketName).id
  }

  private handleSelectBucket = (bucket: Bucket) => {
    this.props.onSelectBucket(bucket)
    this.setState({emptyOriginal: false})
  }

  private get emptyState(): JSX.Element {
    const {searchTerm} = this.state

    const noMatches = this.filteredBundles.length === 0

    if (searchTerm && noMatches) {
      return (
        <EmptyState size={ComponentSize.Medium}>
          <EmptyState.Text>No plugins match your search</EmptyState.Text>
        </EmptyState>
      )
    }
  }

  private get filteredBundles(): TelegrafPlugin[] {
    const {searchTerm} = this.state

    return WRITE_DATA_TELEGRAF_PLUGINS.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  private isCardChecked(bundle): boolean {
    const {telegrafPlugins} = this.props

    if (telegrafPlugins.find(b => b === bundle)) {
      return true
    }
    return false
  }

  private handleToggle = (bundle): void => {
    this.props.onTogglePluginBundle(bundle)
  }

  private handleFilterChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value})
  }

  private handleFilterBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value})
  }
}

export default StreamingSelectorTelegrafUiRefresh
