import {TelegrafPlugin as GenTelegrafPlugin} from 'src/client'

export interface Plugin extends Omit<GenTelegrafPlugin, 'config'> {
  config?: any
}

export enum CollectorsStep {
  'Select',
  'Configure',
  'Verify',
}

export enum PluginConfigurationStep {
  'Configure',
  'Customize',
  'Verify',
}

interface ScraperTarget {
  bucket: string
  url: string
  name: string
  id?: string
}

export interface DataLoadersState {
  telegrafPlugins: TelegrafPlugin[]
  pluginBundles: BundleName[]
  type: DataLoaderType
  telegrafConfigID: string
  scraperTarget: ScraperTarget
  telegrafConfigName: string
  telegrafConfigDescription: string
  token: string
}

export enum ConfigurationState {
  Unconfigured = 'unconfigured',
  InvalidConfiguration = 'invalid',
  Configured = 'configured',
}

export enum DataLoaderType {
  CSV = 'CSV',
  Streaming = 'Streaming',
  ClientLibrary = 'Client Library',
  Scraping = 'Scraping',
  Empty = '',
}

export interface TelegrafPlugin extends GenTelegrafPlugin {
  name: TelegrafPluginName
  configured: ConfigurationState
  active: boolean
  plugin?: Plugin
  templateID?: string
}

export enum BundleName {
  System = 'System',
  Docker = 'Docker',
  Kubernetes = 'Kubernetes',
  Nginx = 'NGINX',
  Redis = 'Redis',
}

export type TelegrafPluginName = string

export enum Precision {
  Milliseconds = 'Milliseconds',
  Seconds = 'Seconds',
  Microseconds = 'Microseconds',
  Nanoseconds = 'Nanoseconds',
}

export enum ConfigFieldType {
  String = 'string',
  StringArray = 'string array',
  Uri = 'uri',
  UriArray = 'uri array',
}

export interface ConfigFields {
  [field: string]: {
    type: ConfigFieldType
    isRequired: boolean
  }
}

export interface TelegrafPluginInfo {
  [name: string]: {
    fields: ConfigFields
    defaults: Plugin
    templateID?: string
  }
}

export type Substep = number | 'streaming' | 'config'
