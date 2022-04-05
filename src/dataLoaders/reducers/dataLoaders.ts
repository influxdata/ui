// Libraries
import {uniqBy, sortBy, get, isEmpty} from 'lodash'

// Utils
import {
  createNewPlugin,
  updateConfigFields,
  isPluginInBundle,
  isPluginUniqueToBundle,
  getConfigFields,
} from 'src/dataLoaders/utils/pluginConfigs'
import {getDeep} from 'src/utils/wrappers'
import {validateURI} from 'src/shared/utils/validateURI'

// Types
import {Action} from 'src/dataLoaders/actions/dataLoaders'
import {
  DataLoaderType,
  DataLoadersState,
  ConfigurationState,
  ConfigFieldType,
  Plugin,
} from 'src/types/dataLoaders'
import {QUICKSTART_SCRAPER_TARGET_URL} from 'src/dataLoaders/constants/pluginConfigs'

export const INITIAL_STATE: DataLoadersState = {
  telegrafPlugins: [],
  type: DataLoaderType.Empty,
  telegrafConfigID: null,
  pluginBundles: [],
  scraperTarget: {
    bucket: '',
    url: QUICKSTART_SCRAPER_TARGET_URL,
    name: 'Name this Scraper Target',
  },
  telegrafConfigName: 'Name this Configuration',
  telegrafConfigDescription: '',
  token: '',
  locationOnDismiss: '',
}

export default (state = INITIAL_STATE, action: Action): DataLoadersState => {
  switch (action.type) {
    case 'CLEAR_DATA_LOADERS':
      return {...INITIAL_STATE}
    case 'SET_DATA_LOADERS_TYPE':
      return {
        ...state,
        type: action.payload.type,
      }
    case 'SET_TELEGRAF_CONFIG_ID':
      return {
        ...state,
        telegrafConfigID: action.payload.id,
      }
    case 'ADD_PLUGIN_BUNDLE':
      return {
        ...state,
        pluginBundles: [...state.pluginBundles, action.payload.bundle],
      }
    case 'REMOVE_PLUGIN_BUNDLE':
      return {
        ...state,
        pluginBundles: state.pluginBundles.filter(
          b => b !== action.payload.bundle
        ),
      }
    case 'REMOVE_BUNDLE_PLUGINS':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.filter(tp => {
          if (isPluginInBundle(tp.name, action.payload.bundle)) {
            return !isPluginUniqueToBundle(
              tp.name,
              action.payload.bundle,
              state.pluginBundles
            )
          }

          return true
        }),
      }
    case 'ADD_TELEGRAF_PLUGINS':
      return {
        ...state,
        telegrafPlugins: sortBy(
          uniqBy(
            [...state.telegrafPlugins, ...action.payload.telegrafPlugins],
            'name'
          ),
          ['name']
        ),
      }

    case 'REPLACE_BUNDLE_WITH_PLUGIN':
      const telegrafPlugins = [action.payload.telegrafPlugins]
      return {
        ...state,
        telegrafPlugins,
      }

    case 'UPDATE_TELEGRAF_PLUGIN':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          if (tp.name === action.payload.plugin.name) {
            return {
              ...tp,
              plugin: action.payload.plugin,
            }
          }

          return tp
        }),
      }
    case 'UPDATE_TELEGRAF_PLUGIN_CONFIG':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          if (tp.name === action.payload.name) {
            const plugin = get(tp, 'plugin', createNewPlugin(tp))

            return {
              ...tp,
              plugin: updateConfigFields(
                plugin,
                action.payload.field,
                action.payload.value
              ),
            }
          }
          return tp
        }),
      }
    case 'ADD_TELEGRAF_PLUGIN_CONFIG_VALUE':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          if (tp.name === action.payload.pluginName) {
            const plugin = get(tp, 'plugin', createNewPlugin(tp))

            const config = get(plugin, ['config', action.payload.fieldName], [])

            const updatedConfigFieldValue: string[] = [
              ...config,
              action.payload.value,
            ]

            return {
              ...tp,
              plugin: updateConfigFields(
                plugin,
                action.payload.fieldName,
                updatedConfigFieldValue
              ),
            }
          }
          return tp
        }),
      }
    case 'REMOVE_TELEGRAF_PLUGIN_CONFIG_VALUE':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          if (tp.name === action.payload.pluginName) {
            const plugin = get(tp, 'plugin', createNewPlugin(tp))

            const configFieldValues = get(
              plugin,
              `config.${action.payload.fieldName}`,
              []
            )
            const filteredConfigFieldValue = configFieldValues.filter(
              v => v !== action.payload.value
            )

            return {
              ...tp,
              plugin: updateConfigFields(
                plugin,
                action.payload.fieldName,
                filteredConfigFieldValue
              ),
            }
          }
          return tp
        }),
      }
    case 'SET_TELEGRAF_PLUGIN_CONFIG_VALUE':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          if (tp.name === action.payload.pluginName) {
            const plugin = get(tp, 'plugin', createNewPlugin(tp))
            const configValues = get(
              plugin,
              `config.${action.payload.field}`,
              []
            )
            configValues[action.payload.valueIndex] = action.payload.value
            return {
              ...tp,
              plugin: updateConfigFields(plugin, action.payload.field, [
                ...configValues,
              ]),
            }
          }
          return tp
        }),
      }
    case 'SET_ACTIVE_TELEGRAF_PLUGIN':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          if (tp.name === action.payload.telegrafPlugin) {
            return {...tp, active: true}
          }
          return {...tp, active: false}
        }),
      }
    case 'SET_PLUGIN_CONFIGURATION_STATE':
      return {
        ...state,
        telegrafPlugins: state.telegrafPlugins.map(tp => {
          const name = get(tp, 'name')
          if (name === action.payload.telegrafPlugin) {
            const configFields = getConfigFields(name)
            if (!configFields) {
              return {...tp, configured: ConfigurationState.Configured}
            }

            const plugin = getDeep<Plugin>(tp, 'plugin', createNewPlugin(tp))
            const config = get(plugin, 'config', {})

            let isValidConfig = true

            Object.entries(configFields).forEach(
              ([fieldName, {type: fieldType, isRequired}]) => {
                if (isRequired) {
                  const fieldValue = config[fieldName]

                  switch (fieldType) {
                    case ConfigFieldType.Uri:
                      isValidConfig = validateURI(fieldValue as string)
                      break
                    case ConfigFieldType.String:
                      isValidConfig = (fieldValue as string) !== ''
                      break
                    case ConfigFieldType.StringArray:
                      isValidConfig = !!(fieldValue as string[]).length
                      break
                    case ConfigFieldType.UriArray:
                      isValidConfig =
                        !!(fieldValue as string[]).length &&
                        !fieldValue.find(uri => !validateURI(uri))
                      break
                  }
                }
              }
            )

            if (!isValidConfig || isEmpty(config)) {
              return {
                ...tp,
                configured: ConfigurationState.InvalidConfiguration,
              }
            } else {
              return {...tp, configured: ConfigurationState.Configured}
            }
          }

          return {...tp}
        }),
      }
    case 'SET_TELEGRAF_CONFIG_NAME':
      return {
        ...state,
        telegrafConfigName: action.payload.name,
      }
    case 'SET_TELEGRAF_CONFIG_DESCRIPTION':
      return {
        ...state,
        telegrafConfigDescription: action.payload.description,
      }
    case 'SET_SCRAPER_TARGET_NAME':
      const {name} = action.payload
      return {
        ...state,
        scraperTarget: {...state.scraperTarget, name},
      }
    case 'SET_SCRAPER_TARGET_BUCKET':
      const {bucket} = action.payload
      return {
        ...state,
        scraperTarget: {...state.scraperTarget, bucket},
      }
    case 'SET_SCRAPER_TARGET_URL':
      const {url} = action.payload
      return {
        ...state,
        scraperTarget: {
          ...state.scraperTarget,
          url,
        },
      }
    case 'SET_SCRAPER_TARGET_ID':
      const {id} = action.payload
      return {
        ...state,
        scraperTarget: {
          ...state.scraperTarget,
          id,
        },
      }
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload.token,
      }

    case 'SET_LOCATION_ON_DISMISS':
      return {
        ...state,
        locationOnDismiss: action.payload.locationOnDismiss,
      }
    default:
      return state
  }
}
