// Libraries
import React, {FC, useEffect, useState} from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'

// Components
import {ComponentStatus, Dropdown} from '@influxdata/clockface'

// Types
import {AppState, Telegraf} from 'src/types'
import {PluginConfigurationStepProps} from 'src/writeData/components/AddPluginToConfiguration'

// Selectors
import {getAllBuckets, getAllTelegrafs} from 'src/resources/selectors'
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
  const telegrafs = useSelector(getAllTelegrafs)
  const [sortedTelegrafs, setSortedTelegrafs] = useState<Telegraf[]>(telegrafs)
  useEffect(() => {
    setSortedTelegrafs(
      telegrafs.sort((firstConfig, secondConfig) => {
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
      })
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    buckets,
    setBucketInfo,
    setIsValidConfiguration,
    setPluginConfig,
    setTelegrafConfigDescription,
    setTelegrafConfigID,
    setTelegrafConfigName,
    telegrafConfigID,
  } = props

  const selectedTelegraf = sortedTelegrafs?.find(
    telegraf => telegraf.id === telegrafConfigID
  )

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
      setBucketInfo(orgID, name, id)
    }
    setTelegrafConfigDescription(telegraf.description)
    setTelegrafConfigID(telegraf.id)
    setTelegrafConfigName(telegraf.name)
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
            {sortedTelegrafs.map(telegraf => (
              <Dropdown.Item
                key={telegraf.id}
                onClick={handleSelectTelegrafConfiguration}
                selected={
                  selectedTelegraf && telegraf.id === selectedTelegraf.id
                }
                value={telegraf}
                testID={`telegraf-configuration--${telegraf.name}`}
              >
                {telegraf.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        )}
        testID="plugin-add-to-configuration--select-telegraf"
      />
    </>
  )
}

const mstp = (state: AppState) => {
  const buckets = getAllBuckets(state)
  const {telegrafConfigID} = getDataLoaders(state)

  return {
    buckets,
    telegrafConfigID,
  }
}

const mdtp = {
  setBucketInfo,
  setTelegrafConfigDescription,
  setTelegrafConfigID,
  setTelegrafConfigName,
}

const connector = connect(mstp, mdtp)

export const Configure = connector(ConfigureComponent)
