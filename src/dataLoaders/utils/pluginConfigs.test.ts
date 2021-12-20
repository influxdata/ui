// Utils
import {
  isPluginInBundle,
  isPluginUniqueToBundle,
} from 'src/dataLoaders/utils/pluginConfigs'

// Types
import {BundleName} from 'src/types/dataLoaders'

describe('Onboarding.Utils.PluginConfig', () => {
  describe('if plugin is found in only one bundle', () => {
    it('isPluginUniqueToBundle returns true', () => {
      const telegrafPlugin = 'cpu'
      const bundle = BundleName.System
      const bundles = [BundleName.System, BundleName.Docker]

      const actual = isPluginUniqueToBundle(telegrafPlugin, bundle, bundles)

      expect(actual).toBe(true)
    })
  })

  describe('if plugin is not in bundle', () => {
    it('isPluginInBundle returns false', () => {
      const telegrafPlugin = 'system'
      const bundle = BundleName.Docker

      const actual = isPluginInBundle(telegrafPlugin, bundle)

      expect(actual).toBe(false)
    })
  })

  describe('if plugin is in bundle', () => {
    it('isPluginInBundle returns true', () => {
      const telegrafPlugin = 'system'
      const bundle = BundleName.System

      const actual = isPluginInBundle(telegrafPlugin, bundle)

      expect(actual).toBe(true)
    })
  })
})
