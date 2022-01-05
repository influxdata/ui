// Types
import {
  TelegrafPluginName,
  TelegrafPluginInfo,
  ConfigFieldType,
  BundleName,
} from 'src/types'
import {
  LogoCpu,
  LogoDocker,
  LogoKubernetes,
  LogoNginx,
  LogoRedis,
} from 'src/dataLoaders/graphics'

export const QUICKSTART_SCRAPER_TARGET_URL = `${window.location.origin}/metrics`

interface PluginBundles {
  [bundleName: string]: TelegrafPluginName[]
}

export const pluginsByBundle: PluginBundles = {
  [BundleName.System]: [
    'cpu',
    'disk',
    'diskio',
    'system',
    'mem',
    'net',
    'processes',
    'swap',
  ],
  [BundleName.Docker]: ['docker'],
  [BundleName.Kubernetes]: ['kubernetes'],
  [BundleName.Nginx]: ['nginx'],
  [BundleName.Redis]: ['redis'],
}

export const telegrafPluginsInfo: TelegrafPluginInfo = {
  cpu: {
    fields: null,
    defaults: {
      name: 'cpu',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  disk: {
    fields: null,
    defaults: {
      name: 'disk',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  diskio: {
    fields: null,
    defaults: {
      name: 'diskio',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  docker: {
    fields: {
      endpoint: {
        type: ConfigFieldType.String,
        isRequired: true,
      },
    },
    defaults: {
      name: 'docker',
      type: 'input',
      config: {endpoint: ''},
    },
    templateID: '0000000000000002',
  },
  file: {
    fields: {
      files: {
        type: ConfigFieldType.StringArray,
        isRequired: true,
      },
    },
    defaults: {
      name: 'file',
      type: 'input',
      config: {files: []},
    },
  },
  kernel: {
    fields: null,
    defaults: {
      name: 'kernel',
      type: 'input',
    },
  },
  kubernetes: {
    fields: {
      url: {
        type: ConfigFieldType.Uri,
        isRequired: true,
      },
    },
    defaults: {
      name: 'kubernetes',
      type: 'input',
      config: {url: ''},
    },
    templateID: '0000000000000005',
  },
  logparser: {
    fields: {files: {type: ConfigFieldType.StringArray, isRequired: true}},
    defaults: {
      name: 'logparser',
      type: 'input',
      config: {files: []},
    },
  },
  mem: {
    fields: null,
    defaults: {
      name: 'mem',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  net: {
    fields: null,
    defaults: {
      name: 'net',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  net_response: {
    fields: null,
    defaults: {
      name: 'net_response',
      type: 'input',
    },
  },
  nginx: {
    fields: {urls: {type: ConfigFieldType.UriArray, isRequired: true}},
    defaults: {
      name: 'nginx',
      type: 'input',
    },
    templateID: '0000000000000006',
  },
  ['processes']: {
    fields: null,
    defaults: {
      name: 'processes',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  procstat: {
    fields: {exe: {type: ConfigFieldType.String, isRequired: true}},
    defaults: {
      name: 'procstat',
      type: 'input',
      config: {exe: ''},
    },
  },
  prometheus: {
    fields: {urls: {type: ConfigFieldType.UriArray, isRequired: true}},
    defaults: {
      name: 'prometheus',
      type: 'input',
      config: {urls: []},
    },
  },
  redis: {
    fields: {
      servers: {type: ConfigFieldType.StringArray, isRequired: true},
      password: {type: ConfigFieldType.String, isRequired: false},
    },
    defaults: {
      name: 'redis',
      type: 'input',
      config: {servers: [], password: ''},
    },
    templateID: '0000000000000008',
  },
  syslog: {
    fields: {server: {type: ConfigFieldType.String, isRequired: true}},
    defaults: {
      name: 'syslog',
      type: 'input',
      config: {server: ''},
    },
  },
  swap: {
    fields: null,
    defaults: {
      name: 'swap',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  system: {
    fields: null,
    defaults: {
      name: 'system',
      type: 'input',
    },
    templateID: '0000000000000009',
  },
  tail: {
    fields: null,
    defaults: {
      name: 'tail',
      type: 'input',
    },
  },
}

export const BUNDLE_LOGOS = {
  [BundleName.System]: LogoCpu,
  [BundleName.Docker]: LogoDocker,
  [BundleName.Kubernetes]: LogoKubernetes,
  [BundleName.Nginx]: LogoNginx,
  [BundleName.Redis]: LogoRedis,
}

export const PLUGIN_BUNDLE_OPTIONS: BundleName[] = [
  BundleName.System,
  BundleName.Docker,
  BundleName.Kubernetes,
  BundleName.Nginx,
  BundleName.Redis,
]
