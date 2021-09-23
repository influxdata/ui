// Types
import {
  TelegrafPluginInputCpu,
  TelegrafPluginInputDisk,
  TelegrafPluginInputDiskio,
  TelegrafPluginInputDocker,
  TelegrafPluginInputFile,
  TelegrafPluginInputKernel,
  TelegrafPluginInputKubernetes,
  TelegrafPluginInputLogParser,
  TelegrafPluginInputMem,
  TelegrafPluginInputNet,
  TelegrafPluginInputNetResponse,
  TelegrafPluginInputNginx,
  TelegrafPluginInputProcesses,
  TelegrafPluginInputProcstat,
  TelegrafPluginInputPrometheus,
  TelegrafPluginInputRedis,
  TelegrafPluginInputSyslog,
  TelegrafPluginInputSwap,
  TelegrafPluginInputSystem,
  TelegrafPluginInputTail,
  TelegrafPluginOutputFile,
  TelegrafPluginOutputInfluxDBV2,
  TelegrafPluginInputDockerConfig,
  TelegrafPluginInputFileConfig,
  TelegrafPluginInputKubernetesConfig,
  TelegrafPluginInputLogParserConfig,
  TelegrafPluginInputProcstatConfig,
  TelegrafPluginInputPrometheusConfig,
  TelegrafPluginInputRedisConfig,
  TelegrafPluginInputSyslogConfig,
  TelegrafPluginOutputFileConfig,
  TelegrafPluginOutputInfluxDBV2Config,
} from '@influxdata/influx'

export enum DataLoaderStep {
  'Configure',
}

export enum CollectorsStep {
  'Select',
  'Configure',
  'Verify',
}

export enum LineProtocolStep {
  'Configure',
  'Verify',
}

export enum PluginCreateConfigurationStep {
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

export type PluginConfig =
  | TelegrafPluginInputDockerConfig
  | TelegrafPluginInputFileConfig
  | TelegrafPluginInputKubernetesConfig
  | TelegrafPluginInputLogParserConfig
  | TelegrafPluginInputProcstatConfig
  | TelegrafPluginInputPrometheusConfig
  | TelegrafPluginInputRedisConfig
  | TelegrafPluginInputSyslogConfig
  | TelegrafPluginOutputFileConfig
  | TelegrafPluginOutputInfluxDBV2Config

export type Plugin =
  | TelegrafPluginInputCpu
  | TelegrafPluginInputDisk
  | TelegrafPluginInputDiskio
  | TelegrafPluginInputDocker
  | TelegrafPluginInputFile
  | TelegrafPluginInputKernel
  | TelegrafPluginInputKubernetes
  | TelegrafPluginInputLogParser
  | TelegrafPluginInputMem
  | TelegrafPluginInputNet
  | TelegrafPluginInputNetResponse
  | TelegrafPluginInputNginx
  | TelegrafPluginInputProcesses
  | TelegrafPluginInputProcstat
  | TelegrafPluginInputPrometheus
  | TelegrafPluginInputRedis
  | TelegrafPluginInputSyslog
  | TelegrafPluginInputSwap
  | TelegrafPluginInputSystem
  | TelegrafPluginInputTail
  | TelegrafPluginOutputFile
  | TelegrafPluginOutputInfluxDBV2
  | TelegrafPluginGeneric

export type TelegrafPluginGeneric = {
  name: string
  type: string
  comment?: string
}

export interface TelegrafPlugin {
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

export enum LineProtocolStatus {
  ImportData = 'importData',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

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
