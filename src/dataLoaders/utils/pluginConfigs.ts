import {get} from 'lodash'

// Constants
import {
  telegrafPluginsInfo,
  pluginsByBundle,
} from 'src/dataLoaders/constants/pluginConfigs'

// Types
import {
  BundleName,
  ConfigFields,
  Plugin,
  TelegrafPlugin,
  TelegrafPluginName,
} from 'src/types/dataLoaders'

export const getConfigFields = (
  pluginName: TelegrafPluginName
): ConfigFields => {
  return telegrafPluginsInfo[pluginName].fields
}

export const updateConfigFields = <T extends Plugin>(
  plugin: T,
  fieldName: string,
  value: string[] | string
): T => {
  return Object.assign({}, plugin, {
    config: Object.assign({}, get(plugin, 'config', {}), {
      [fieldName]: value,
    }),
  })
}

export const createNewPlugin = (plugin: TelegrafPlugin): Plugin => {
  if (telegrafPluginsInfo[plugin?.name]) {
    return telegrafPluginsInfo[plugin.name].defaults
  }
  const {
    plugin: {type: pluginType} = {
      type: 'input',
    },
  } = plugin
  return {
    name: plugin.name ? plugin.name : 'plugin-input',
    type: pluginType,
  }
}

export const isPluginUniqueToBundle = (
  telegrafPlugin: TelegrafPluginName,
  bundle: BundleName,
  bundles: BundleName[]
): boolean => {
  return bundles.reduce((acc: boolean, b) => {
    if (b === bundle) {
      return acc
    }

    pluginsByBundle[b].forEach(p => {
      if (p === telegrafPlugin) {
        acc = false
      }
    })

    return acc
  }, true)
}

export const isPluginInBundle = (
  telegrafPlugin: TelegrafPluginName,
  bundle: BundleName
) => {
  return !!pluginsByBundle[bundle].find(p => p === telegrafPlugin)
}
