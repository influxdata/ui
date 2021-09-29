// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {ComponentStatus, Dropdown} from '@influxdata/clockface'

// Types
import {AppState, Bucket, ResourceType, Telegraf} from 'src/types'
import {PluginConfigurationStepProps} from 'src/writeData/components/PluginAddToExistingConfiguration/Wizard'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getDataLoaders} from 'src/dataLoaders/selectors'

// Actions
import {setBucketInfo} from 'src/dataLoaders/actions/steps'
import {
  setTelegrafConfigDescription,
  setTelegrafConfigID,
  setTelegrafConfigName,
} from 'src/dataLoaders/actions/dataLoaders'

type ReduxProps = ConnectedProps<typeof connector>
type Props = PluginConfigurationStepProps & ReduxProps

const ConfigureComponent: FC<Props> = props => {
  const {
    buckets,
    onSetBucketInfo,
    onSetTelegrafConfigDescription,
    onSetTelegrafConfigID,
    onSetTelegrafConfigName,
    setIsValidConfiguration,
    setPluginConfig,
    telegrafConfigID,
    telegrafs,
  } = props

  const selectedTelegraf = telegrafs?.find(
    telegraf => telegraf.id === telegrafConfigID
  )

  if (!selectedTelegraf) {
    setIsValidConfiguration(false)
  }

  const selectedName = selectedTelegraf
    ? selectedTelegraf.name
    : 'Select a configuration'

  const handleSelectTelegrafConfiguration = (telegraf: Telegraf) => {
    const targetBucketName = Array.isArray(telegraf?.metadata?.buckets)
      ? telegraf.metadata.buckets[0]
      : ''
    const selectedBucket = buckets.find(
      bucket => bucket.name === targetBucketName
    )
    if (selectedBucket) {
      const {orgID, name, id} = selectedBucket
      onSetBucketInfo(orgID, name, id)
    }
    onSetTelegrafConfigDescription(telegraf.description)
    onSetTelegrafConfigID(telegraf.id)
    onSetTelegrafConfigName(telegraf.name)
    setPluginConfig('')
    setIsValidConfiguration(true)
  }

  return (
    <>
      <div>Telegraf Agent Configuration</div>
      <Dropdown
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            status={ComponentStatus.Default}
          >
            {selectedName}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu onCollapse={onCollapse}>
            {telegrafs.map(telegraf => (
              <Dropdown.Item
                key={telegraf.id}
                onClick={handleSelectTelegrafConfiguration}
                selected={
                  selectedTelegraf && telegraf.id === selectedTelegraf.id
                }
                value={telegraf}
              >
                {telegraf.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        )}
      />
    </>
  )
}

const mstp = (state: AppState) => {
  const buckets = getAll<Bucket>(state, ResourceType.Buckets)
  const {telegrafConfigID} = getDataLoaders(state)
  const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)?.sort(
    (firstConfig, secondConfig) => {
      if (
        firstConfig?.name.toLocaleLowerCase() >
        secondConfig?.name.toLocaleLowerCase()
      ) {
        return 1
      }
      if (
        firstConfig?.name.toLocaleLowerCase() <
        secondConfig?.name.toLocaleLowerCase()
      ) {
        return -1
      }
      return 0
    }
  )

  return {
    buckets,
    telegrafConfigID,
    telegrafs,
  }
}

const mdtp = {
  onSetBucketInfo: setBucketInfo,
  onSetTelegrafConfigDescription: setTelegrafConfigDescription,
  onSetTelegrafConfigID: setTelegrafConfigID,
  onSetTelegrafConfigName: setTelegrafConfigName,
}

const connector = connect(mstp, mdtp)

export const Configure = connector(ConfigureComponent)
