// Libraries
import {get} from 'lodash'
import {normalize} from 'normalizr'

// APIs
import {client} from 'src/utils/api'
import {ScraperTargetRequest, PermissionResource} from '@influxdata/influx'
import {createAuthorization} from 'src/authorizations/apis'

// Schemas
import {authSchema} from 'src/schemas'
import {telegrafSchema} from 'src/schemas/telegrafs'

// Utils
import {createNewPlugin} from 'src/dataLoaders/utils/pluginConfigs'
import {getDataLoaders, getSteps} from 'src/dataLoaders/selectors'
import {getBucketByName} from 'src/buckets/selectors'
import {getByID} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'

// Constants
import {
  pluginsByBundle,
  telegrafPluginsInfo,
} from 'src/dataLoaders/constants/pluginConfigs'

// Types
import {
  TelegrafPlugin,
  TelegrafPluginName,
  DataLoaderType,
  Plugin,
  BundleName,
  ConfigurationState,
} from 'src/types/dataLoaders'
import {
  GetState,
  Authorization,
  AuthEntities,
  ResourceType,
  TelegrafEntities,
  Telegraf,
} from 'src/types'
import {
  TelegrafRequest,
  TelegrafPluginOutputInfluxDBV2,
  Permission,
} from '@influxdata/influx'
import {Dispatch} from 'redux'

// Actions
import {addTelegraf, editTelegraf} from 'src/telegrafs/actions/creators'
import {addAuthorization} from 'src/authorizations/actions/creators'
import {notify} from 'src/shared/actions/notifications'
import {
  TelegrafConfigCreationError,
  TelegrafConfigCreationSuccess,
  TokenCreationError,
} from 'src/shared/copy/notifications'

const DEFAULT_COLLECTION_INTERVAL = 10000

export type Action =
  | SetDataLoadersType
  | SetTelegrafConfigID
  | UpdateTelegrafPluginConfig
  | AddConfigValue
  | RemoveConfigValue
  | SetActiveTelegrafPlugin
  | UpdateTelegrafPlugin
  | AddPluginBundle
  | AddTelegrafTelegrafUiRefresh
  | AddTelegrafPluginsTelegrafUiRefresh
  | AddTelegrafPlugins
  | RemoveBundlePlugins
  | RemovePluginBundle
  | SetPluginConfiguration
  | SetConfigArrayValue
  | SetScraperTargetBucket
  | SetScraperTargetURL
  | SetScraperTargetName
  | SetScraperTargetID
  | ClearDataLoaders
  | SetTelegrafConfigName
  | SetTelegrafConfigDescription
  | SetToken

interface SetDataLoadersType {
  type: 'SET_DATA_LOADERS_TYPE'
  payload: {type: DataLoaderType}
}

export const setDataLoadersType = (
  type: DataLoaderType
): SetDataLoadersType => ({
  type: 'SET_DATA_LOADERS_TYPE',
  payload: {type},
})

interface ClearDataLoaders {
  type: 'CLEAR_DATA_LOADERS'
}

export const clearDataLoaders = (): ClearDataLoaders => ({
  type: 'CLEAR_DATA_LOADERS',
})

interface SetTelegrafConfigName {
  type: 'SET_TELEGRAF_CONFIG_NAME'
  payload: {name: string}
}

export const setTelegrafConfigName = (name: string): SetTelegrafConfigName => ({
  type: 'SET_TELEGRAF_CONFIG_NAME',
  payload: {name},
})

interface SetTelegrafConfigDescription {
  type: 'SET_TELEGRAF_CONFIG_DESCRIPTION'
  payload: {description: string}
}

export const setTelegrafConfigDescription = (
  description: string
): SetTelegrafConfigDescription => ({
  type: 'SET_TELEGRAF_CONFIG_DESCRIPTION',
  payload: {description},
})

interface UpdateTelegrafPluginConfig {
  type: 'UPDATE_TELEGRAF_PLUGIN_CONFIG'
  payload: {name: string; field: string; value: string}
}

export const updateTelegrafPluginConfig = (
  name: string,
  field: string,
  value: string
): UpdateTelegrafPluginConfig => ({
  type: 'UPDATE_TELEGRAF_PLUGIN_CONFIG',
  payload: {name, field, value},
})

interface UpdateTelegrafPlugin {
  type: 'UPDATE_TELEGRAF_PLUGIN'
  payload: {plugin: Plugin}
}

export const updateTelegrafPlugin = (plugin: Plugin): UpdateTelegrafPlugin => ({
  type: 'UPDATE_TELEGRAF_PLUGIN',
  payload: {plugin},
})

interface AddConfigValue {
  type: 'ADD_TELEGRAF_PLUGIN_CONFIG_VALUE'
  payload: {
    pluginName: string
    fieldName: string
    value: string
  }
}

export const addConfigValue = (
  pluginName: string,
  fieldName: string,
  value: string
): AddConfigValue => ({
  type: 'ADD_TELEGRAF_PLUGIN_CONFIG_VALUE',
  payload: {pluginName, fieldName, value},
})

interface RemoveConfigValue {
  type: 'REMOVE_TELEGRAF_PLUGIN_CONFIG_VALUE'
  payload: {
    pluginName: string
    fieldName: string
    value: string
  }
}

export const removeConfigValue = (
  pluginName: string,
  fieldName: string,
  value: string
): RemoveConfigValue => ({
  type: 'REMOVE_TELEGRAF_PLUGIN_CONFIG_VALUE',
  payload: {pluginName, fieldName, value},
})

interface SetConfigArrayValue {
  type: 'SET_TELEGRAF_PLUGIN_CONFIG_VALUE'
  payload: {
    pluginName: TelegrafPluginName
    field: string
    valueIndex: number
    value: string
  }
}

export const setConfigArrayValue = (
  pluginName: TelegrafPluginName,
  field: string,
  valueIndex: number,
  value: string
): SetConfigArrayValue => ({
  type: 'SET_TELEGRAF_PLUGIN_CONFIG_VALUE',
  payload: {pluginName, field, valueIndex, value},
})

interface SetTelegrafConfigID {
  type: 'SET_TELEGRAF_CONFIG_ID'
  payload: {id: string}
}

export const setTelegrafConfigID = (id: string): SetTelegrafConfigID => ({
  type: 'SET_TELEGRAF_CONFIG_ID',
  payload: {id},
})

interface AddPluginBundle {
  type: 'ADD_PLUGIN_BUNDLE'
  payload: {bundle: BundleName}
}

interface AddTelegrafTelegrafUiRefresh {
  type: 'ADD_TELEGRAF_telegrafUiRefresh'
  payload: {plugin: string}
}

export const addPluginBundle = (bundle: BundleName): AddPluginBundle => ({
  type: 'ADD_PLUGIN_BUNDLE',
  payload: {bundle},
})

export const addTelegraf_telegrafUiRefresh = (
  plugin: string
): AddTelegrafTelegrafUiRefresh => ({
  type: 'ADD_TELEGRAF_telegrafUiRefresh',
  payload: {plugin},
})

interface RemovePluginBundle {
  type: 'REMOVE_PLUGIN_BUNDLE'
  payload: {bundle: BundleName}
}

export const removePluginBundle = (bundle: BundleName): RemovePluginBundle => ({
  type: 'REMOVE_PLUGIN_BUNDLE',
  payload: {bundle},
})
interface AddTelegrafPlugins {
  type: 'ADD_TELEGRAF_PLUGINS'
  payload: {telegrafPlugins: TelegrafPlugin[]}
}
interface AddTelegrafPluginsTelegrafUiRefresh {
  type: 'ADD_TELEGRAF_PLUGINS_telegrafUiRefresh'
  payload: {telegrafPlugins}
}

export const addTelegrafPlugins = (
  telegrafPlugins: TelegrafPlugin[]
): AddTelegrafPlugins => ({
  type: 'ADD_TELEGRAF_PLUGINS',
  payload: {telegrafPlugins},
})

export const addTelegrafPlugins_telegrafUiRefresh = (
  telegrafPlugins
): AddTelegrafPluginsTelegrafUiRefresh => ({
  type: 'ADD_TELEGRAF_PLUGINS_telegrafUiRefresh',
  payload: {telegrafPlugins},
})

interface RemoveBundlePlugins {
  type: 'REMOVE_BUNDLE_PLUGINS'
  payload: {bundle: BundleName}
}

export const removeBundlePlugins = (
  bundle: BundleName
): RemoveBundlePlugins => ({
  type: 'REMOVE_BUNDLE_PLUGINS',
  payload: {bundle},
})

interface SetScraperTargetBucket {
  type: 'SET_SCRAPER_TARGET_BUCKET'
  payload: {bucket: string}
}

export const setScraperTargetBucket = (
  bucket: string
): SetScraperTargetBucket => ({
  type: 'SET_SCRAPER_TARGET_BUCKET',
  payload: {bucket},
})

interface SetScraperTargetURL {
  type: 'SET_SCRAPER_TARGET_URL'
  payload: {url: string}
}

export const setScraperTargetURL = (url: string): SetScraperTargetURL => ({
  type: 'SET_SCRAPER_TARGET_URL',
  payload: {url},
})

interface SetScraperTargetName {
  type: 'SET_SCRAPER_TARGET_NAME'
  payload: {name: string}
}

export const setScraperTargetName = (name: string): SetScraperTargetName => ({
  type: 'SET_SCRAPER_TARGET_NAME',
  payload: {name},
})

interface SetScraperTargetID {
  type: 'SET_SCRAPER_TARGET_ID'
  payload: {id: string}
}

export const setScraperTargetID = (id: string): SetScraperTargetID => ({
  type: 'SET_SCRAPER_TARGET_ID',
  payload: {id},
})

interface SetToken {
  type: 'SET_TOKEN'
  payload: {token: string}
}

export const setToken = (token: string): SetToken => ({
  type: 'SET_TOKEN',
  payload: {token},
})

export const addPluginBundleWithPlugins = (bundle: BundleName) => dispatch => {
  dispatch(addPluginBundle(bundle))
  const plugins = pluginsByBundle[bundle]
  dispatch(
    addTelegrafPlugins(
      plugins.map(p => {
        const isConfigured = !!telegrafPluginsInfo[p].fields
          ? ConfigurationState.Unconfigured
          : ConfigurationState.Configured

        return {
          name: p,
          active: false,
          configured: isConfigured,
          templateID: telegrafPluginsInfo[p].templateID,
        }
      })
    )
  )
}

export const addTelegrafPlugin_telegrafUiRefresh = (
  plugin: string
) => dispatch => {
  dispatch(addTelegraf_telegrafUiRefresh(plugin))
  dispatch(addTelegrafPlugins_telegrafUiRefresh(plugin))
}

export const removePluginBundleWithPlugins = (
  bundle: BundleName
) => dispatch => {
  dispatch(removePluginBundle(bundle))
  dispatch(removeBundlePlugins(bundle))
}

export const createOrUpdateTelegrafConfigAsync = () => async (
  dispatch,
  getState: GetState
) => {
  const {
    telegrafPlugins,
    telegrafConfigID,
    telegrafConfigName,
    telegrafConfigDescription,
  } = getDataLoaders(getState())
  const {name} = getOrg(getState())
  const {bucket} = getSteps(getState())

  const influxDB2Out = {
    name: TelegrafPluginOutputInfluxDBV2.NameEnum.InfluxdbV2,
    type: TelegrafPluginOutputInfluxDBV2.TypeEnum.Output,
    config: {
      urls: [`${window.location.origin}`],
      token: '$INFLUX_TOKEN',
      organization: name,
      bucket,
    },
  }

  const plugins = telegrafPlugins.reduce(
    (acc, tp) => {
      if (tp.configured === ConfigurationState.Configured) {
        return [...acc, tp.plugin || createNewPlugin(tp)]
      }

      return acc
    },
    [influxDB2Out]
  )

  if (telegrafConfigID) {
    const telegraf = await client.telegrafConfigs.update(telegrafConfigID, {
      name: telegrafConfigName,
      description: telegrafConfigDescription,
      plugins,
    })

    const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
      telegraf,
      telegrafSchema
    )

    dispatch(editTelegraf(normTelegraf))
    dispatch(setTelegrafConfigID(telegrafConfigID))
    event(
      `telegraf.config.${normalizeEventName(telegrafConfigName)}.edit.success`,
      {id: telegraf?.id}
    )
    return
  }

  createTelegraf(dispatch, getState, plugins)
}

export const generateTelegrafToken = (configID: string) => async (
  dispatch,
  getState: GetState
) => {
  let telegrafName: string = ''
  let bucketName: string = ''
  try {
    const state = getState()
    const orgID = getOrg(state).id
    const telegraf = getByID<Telegraf>(state, ResourceType.Telegrafs, configID)
    telegrafName = telegraf.name
    bucketName = get(telegraf, 'metadata.buckets[0]', '')

    if (bucketName === '') {
      throw new Error(
        'A token cannot be generated without a corresponding bucket; no buckets are assigned'
      )
    }

    const bucket = getBucketByName(state, bucketName)

    if (!bucket || !bucket.id) {
      throw new Error(`there is no bucket present with name ${bucketName}`)
    }
    const permissions = [
      {
        action: Permission.ActionEnum.Write,
        resource: {
          type: PermissionResource.TypeEnum.Buckets,
          id: bucket.id,
          orgID,
        },
      },
      {
        action: Permission.ActionEnum.Read,
        resource: {
          type: PermissionResource.TypeEnum.Telegrafs,
          id: configID,
          orgID,
        },
      },
    ]

    const token = {
      name: `${telegraf.name} token`,
      orgID,
      description: `WRITE ${bucketName} bucket / READ ${telegraf.name} telegraf config`,
      permissions,
    }

    // create token
    const createdToken = await createAuthorization(token)
    event('token.create.success', {name: telegrafName, bucket: bucketName})
    // add token to data loader state
    dispatch(setToken(createdToken.token))
  } catch (error) {
    console.error(error)
    event('token.create.failure', {name: telegrafName, bucket: bucketName})
    if (error.message) {
      const customNotification = {
        ...TokenCreationError,
        message: `${TokenCreationError.message}: ${error.message}`,
      }
      dispatch(notify(customNotification))
    } else {
      dispatch(notify(TokenCreationError))
    }
  }
}

const createTelegraf = async (dispatch, getState: GetState, plugins) => {
  let configName = ''
  let bucketName = ''
  try {
    const state = getState()
    const {telegrafConfigName, telegrafConfigDescription} = getDataLoaders(
      state
    )
    configName = telegrafConfigName
    const {bucket, bucketID} = getSteps(state)
    bucketName = bucket
    const org = getOrg(getState())

    const telegrafRequest: TelegrafRequest = {
      name: telegrafConfigName,
      description: telegrafConfigDescription,
      agent: {collectionInterval: DEFAULT_COLLECTION_INTERVAL},
      orgID: org.id,
      plugins,
    }

    // create telegraf config
    const tc = await client.telegrafConfigs.create(telegrafRequest)

    const permissions = [
      {
        action: Permission.ActionEnum.Write,
        resource: {
          type: PermissionResource.TypeEnum.Buckets,
          id: bucketID,
          orgID: org.id,
        },
      },
      {
        action: Permission.ActionEnum.Read,
        resource: {
          type: PermissionResource.TypeEnum.Telegrafs,
          id: tc.id,
          orgID: org.id,
        },
      },
    ]

    const token = {
      name: `${telegrafConfigName} token`,
      orgID: org.id,
      description: `WRITE ${bucket} bucket / READ ${telegrafConfigName} telegraf config`,
      permissions,
    }

    // create token
    const createdToken = await createAuthorization(token)

    // add token to data loader state
    dispatch(setToken(createdToken.token))

    const normAuth = normalize<Authorization, AuthEntities, string>(
      createdToken,
      authSchema
    )

    // add token to authorizations state
    dispatch(addAuthorization(normAuth))

    const normTelegraf = normalize<Telegraf, TelegrafEntities, string>(
      tc,
      telegrafSchema
    )

    dispatch(setTelegrafConfigID(tc.id))
    dispatch(addTelegraf(normTelegraf))
    dispatch(notify(TelegrafConfigCreationSuccess))
    event(`telegraf.config.${normalizeEventName(configName)}.create.success`, {
      id: tc.id,
      bucket: bucketName,
    })
  } catch (error) {
    event(`telegraf.config.${normalizeEventName(configName)}.create.failure`, {
      bucket: bucketName,
    })
    console.error(error.message)
    dispatch(notify(TelegrafConfigCreationError))
  }
}

interface SetActiveTelegrafPlugin {
  type: 'SET_ACTIVE_TELEGRAF_PLUGIN'
  payload: {telegrafPlugin: string}
}

export const setActiveTelegrafPlugin = (
  telegrafPlugin: string
): SetActiveTelegrafPlugin => ({
  type: 'SET_ACTIVE_TELEGRAF_PLUGIN',
  payload: {telegrafPlugin},
})

interface SetPluginConfiguration {
  type: 'SET_PLUGIN_CONFIGURATION_STATE'
  payload: {telegrafPlugin: TelegrafPluginName}
}

export const setPluginConfiguration = (
  telegrafPlugin: TelegrafPluginName
): SetPluginConfiguration => ({
  type: 'SET_PLUGIN_CONFIGURATION_STATE',
  payload: {telegrafPlugin},
})

export const saveScraperTarget = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
) => {
  const {
    dataLoading: {
      dataLoaders: {
        scraperTarget: {url, id, name},
      },
      steps: {bucketID, orgID},
    },
  } = getState()

  try {
    if (id) {
      await client.scrapers.update(id, {url, bucketID})
    } else {
      const newTarget = await client.scrapers.create({
        name,
        type: ScraperTargetRequest.TypeEnum.Prometheus,
        url,
        bucketID,
        orgID,
      })
      dispatch(setScraperTargetID(newTarget.id))
    }
  } catch (error) {
    console.error()
  }
}
