// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import {nanoid} from 'nanoid'

// Components
import {
  Columns,
  ComponentSize,
  EmptyState,
  FormElement,
  Grid,
  IconFont,
  Input,
  SquareGrid,
} from '@influxdata/clockface'
import BucketDropdown from 'src/dataLoaders/components/BucketsDropdown'
import CreateBucketButton from 'src/buckets/components/CreateBucketButton'
import {ErrorHandling} from 'src/shared/decorators/errors'
import WriteDataItem from 'src/writeData/components/WriteDataItem'

// Constants
import {
  CREATE_A_BUCKET_ID,
  createBucketOption,
  isSystemBucket,
} from 'src/buckets/constants'
import {
  WRITE_DATA_TELEGRAF_PLUGINS,
  TelegrafPluginAssets,
} from 'src/writeData/constants/contentTelegrafPlugins'

// Types
import {Bucket, BundleName, ConfigurationState} from 'src/types'
import {TelegrafPlugin} from 'src/types/dataLoaders'

// Utils
import {event} from 'src/cloud/utils/reporting'

export interface Props {
  buckets: Bucket[]
  currentStepIndex: number
  onSelectBucket: (bucket: Bucket) => void
  onTogglePluginBundle: (plugin: TelegrafPlugin) => void
  pluginBundles: BundleName[]
  selectedBucketID: string
  setSubstepIndex: (currentStepIndex: number, substepIndex: number) => void
  telegrafPlugins: any
}

interface State {
  gridSizerUpdateFlag: string
  isExistingBucket: boolean
  searchTerm: string
  selectedBucket: Bucket
  sortedBuckets: Array<Bucket>
}

@ErrorHandling
class TelegrafUIRefreshSelector extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      gridSizerUpdateFlag: nanoid(),
      isExistingBucket: true,
      searchTerm: '',
      selectedBucket: null,
      sortedBuckets: [createBucketOption as Bucket, ...props.buckets],
    }
  }

  public componentDidMount() {
    this.setState({
      isExistingBucket: false,
      selectedBucket: this.props.buckets.find(
        bucket => bucket.id === this.props.selectedBucketID
      ),
    })
  }

  public componentDidUpdate(prevProps: Props) {
    const addFirst =
      prevProps.telegrafPlugins.length === 0 &&
      this.props.telegrafPlugins.length > 0

    const removeLast =
      prevProps.telegrafPlugins.length > 0 &&
      this.props.telegrafPlugins.length === 0

    if (addFirst || removeLast) {
      const gridSizerUpdateFlag = nanoid()
      this.setState({gridSizerUpdateFlag})
    }

    if (prevProps.selectedBucketID !== this.props.selectedBucketID) {
      /* Sort only when:
       * - not on the first render because buckets start as sorted on mount
       * - not an existing bucket selected by the user
       * - a new bucket is successfully created by an API call
       */
      if (this.state.isExistingBucket === false) {
        const nonSystemBuckets =
          this.props.buckets?.filter(bucket => !isSystemBucket(bucket.name)) ||
          []
        this.setState({
          sortedBuckets: [
            createBucketOption as Bucket,
            ...nonSystemBuckets.sort((firstBucket, secondBucket) => {
              if (
                firstBucket.name.toLocaleLowerCase() >
                secondBucket.name.toLocaleLowerCase()
              ) {
                return 1
              }
              if (
                firstBucket.name.toLocaleLowerCase() <
                secondBucket.name.toLocaleLowerCase()
              ) {
                return -1
              }
              return 0
            }),
          ],
        })
      }
      const selectedBucket = this.props.buckets.find(
        bucket => bucket.id === this.props.selectedBucketID
      )
      this.props.onSelectBucket(selectedBucket)
      this.setState({
        isExistingBucket: false, // get ready for an API call
        selectedBucket,
      })
    }
  }

  public render() {
    const {searchTerm, selectedBucket, sortedBuckets} = this.state

    return (
      <div className="wizard-step--grid-container_telegrafUiRefresh">
        {sortedBuckets.length ? (
          <>
            <Grid.Row>
              <Grid.Column widthSM={Columns.Six}>
                <FormElement label="Bucket" required={true}>
                  <BucketDropdown
                    selectedBucketID={selectedBucket?.id}
                    buckets={sortedBuckets}
                    emptyOriginal={!selectedBucket}
                    onSelectBucket={this.handleSelectBucket}
                  />
                </FormElement>
              </Grid.Column>
            </Grid.Row>
            <FormElement label="">
              <Input
                className="wizard-step--filter"
                size={ComponentSize.Small}
                icon={IconFont.Search_New}
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
                  style={item.style}
                  url={`${item.id}`}
                  selected={this.isCardChecked(item.id)}
                  onClick={this.handleToggle}
                  testID={`telegraf-plugins--${item.name}`}
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

  private handleSelectBucket = (bucket: Bucket) => {
    const {id} = bucket
    if (id === CREATE_A_BUCKET_ID) {
      this.props.setSubstepIndex(this.props.currentStepIndex, 1)
    } else {
      this.props.onSelectBucket(bucket)
      this.setState({
        isExistingBucket: true, // user selected an existing bucket, so prevent sorting
        selectedBucket: bucket,
      })
    }
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

  private get filteredBundles(): TelegrafPluginAssets[] {
    const {searchTerm} = this.state

    return WRITE_DATA_TELEGRAF_PLUGINS.sort((plugin1, plugin2) => {
      // sort the plugins array alphabetically
      if (plugin1.name.toLocaleLowerCase() < plugin2.name.toLocaleLowerCase()) {
        return -1
      }
      if (plugin1.name.toLocaleLowerCase() > plugin2.name.toLocaleLowerCase()) {
        return 1
      }
      return 0
    }).filter(plugin =>
      plugin.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    )
  }

  private isCardChecked(bundle): boolean {
    const {telegrafPlugins} = this.props

    if (telegrafPlugins.find(b => b.name === bundle)) {
      return true
    }
    return false
  }

  private handleToggle = (plugin: string): void => {
    const pluginBuild = {
      name: plugin,
      active: false,
      configured: ConfigurationState.Configured,
    }
    this.props.onTogglePluginBundle(pluginBuild)
    event(`telegraf_page.create_new_config.plugin_selected`, {plugin})
  }

  private handleFilterChange = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value})
  }

  private handleFilterBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    this.setState({searchTerm: e.target.value})
  }
}

export default TelegrafUIRefreshSelector
