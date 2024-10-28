/*
  FOR LOCAL USE only. See ./README.md for detailed instructions.

  This is a node script whose purpose is to update the Telegraf Input Plugins
  found at the Load Data > Sources page.
*/
import https from 'https'
import fs, {read} from 'fs'
import logSymbols from 'log-symbols'

const inputPluginsList = [
  'activemq',
  'aerospike',
  'aliyuncms',
  'amd_rocm_smi',
  'amqp_consumer',
  'apache',
  'apcupsd',
  'aurora',
  'azure_storage_queue',
  'bcache',
  'beanstalkd',
  'beat',
  'bind',
  'bond',
  'burrow',
  'cassandra',
  'ceph',
  'cgroup',
  'chrony',
  'cisco_telemetry_mdt',
  'clickhouse',
  'cloud_pubsub',
  'cloud_pubsub_push',
  'cloudwatch',
  'cloudwatch_metric_streams',
  'conntrack',
  'consul',
  'consul_agent',
  'couchbase',
  'couchdb',
  'cpu',
  'csgo',
  'dcos',
  'directory_monitor',
  'disk',
  'diskio',
  'disque',
  'dmcache',
  'dns_query',
  'docker',
  'docker_log',
  'dovecot',
  'dpdk',
  'ecs',
  'elasticsearch',
  'elasticsearch_query',
  'ethtool',
  'eventhub_consumer',
  'exec',
  'execd',
  'fail2ban',
  'fibaro',
  'file',
  'filecount',
  'filestat',
  'fireboard',
  'fluentd',
  'github',
  'gnmi',
  'graylog',
  'haproxy',
  'hddtemp',
  'http',
  'http_listener_v2',
  'http_response',
  'httpjson',
  'hugepages',
  'icinga2',
  'infiniband',
  'influxdb',
  'influxdb_listener',
  'influxdb_v2_listener',
  'intel_pmu',
  'intel_powerstat',
  'intel_rdt',
  'internal',
  'internet_speed',
  'interrupts',
  'ipmi_sensor',
  'ipset',
  'iptables',
  'ipvs',
  'jenkins',
  'jolokia',
  'jolokia2_agent',
  'jolokia2_proxy',
  'jti_openconfig_telemetry',
  'kafka_consumer',
  'kafka_consumer_legacy',
  'kapacitor',
  'kernel',
  'kernel_vmstat',
  'kibana',
  'kinesis_consumer',
  'knx_listener',
  'kube_inventory',
  'kubernetes',
  'lanz',
  'leofs',
  'linux_cpu',
  'linux_sysctl_fs',
  'logparser',
  'logstash',
  'lustre2',
  'lvm',
  'mailchimp',
  'marklogic',
  'mcrouter',
  'mdstat',
  'mem',
  'memcached',
  'mesos',
  'minecraft',
  'mock',
  'modbus',
  'mongodb',
  'monit',
  'multifile',
  'mysql',
  'nats',
  'nats_consumer',
  'neptune_apex',
  'net',
  'net_response',
  'netstat',
  'nfsclient',
  'nginx',
  'nginx_plus',
  'nginx_plus_api',
  'nginx_sts',
  'nginx_upstream_check',
  'nginx_vts',
  'nomad',
  'nsd',
  'nsq',
  'nsq_consumer',
  'nstat',
  'ntpq',
  'nvidia_smi',
  'opcua',
  'openldap',
  'openntpd',
  'opensmtpd',
  'openstack',
  'opentelemetry',
  'openweathermap',
  'passenger',
  'pf',
  'pgbouncer',
  'phpfpm',
  'ping',
  'postfix',
  'postgresql',
  'postgresql_extensible',
  'powerdns',
  'powerdns_recursor',
  'processes',
  'procstat',
  'prometheus',
  'proxmox',
  'puppetagent',
  'rabbitmq',
  'raindrops',
  'ras',
  'ravendb',
  'redfish',
  'redis',
  'redis_sentinel',
  'rethinkdb',
  'riak',
  'riemann_listener',
  'salesforce',
  'sensors',
  'sflow',
  'slab',
  'smart',
  'snmp',
  'snmp_legacy',
  'snmp_trap',
  'socket_listener',
  'socketstat',
  'solr',
  'sql',
  'sqlserver',
  'stackdriver',
  'statsd',
  'supervisor',
  'suricata',
  'swap',
  'synproxy',
  'syslog',
  'sysstat',
  'system',
  'systemd_units',
  'tail',
  'tcp_listener',
  'teamspeak',
  'temp',
  'tengine',
  'tomcat',
  'trig',
  'twemproxy',
  'udp_listener',
  'unbound',
  'upsd',
  'uwsgi',
  'varnish',
  'vault',
  'vsphere',
  'webhooks',
  'win_eventlog',
  'win_perf_counters',
  'win_services',
  'wireguard',
  'wireless',
  'x509_cert',
  'xtremio',
  'zfs',
  'zipkin',
  'zookeeper',
]

/*
  Plugin names that should NOT display in the UI
    - already included in another plugin, or
    - deprecated
*/
const inputPluginsExceptions = ['http_listener']

const formatConfigurationText = configurationText => {
  const configurationLines = configurationText.split('\n')
  const isCommented = configurationLines.every(
    line => line[0] === '#' || line === ''
  )

  if (isCommented) {
    return (
      configurationLines
        .map(text => {
          let sliceCounter = 0
          if (text[0] === '#') {
            sliceCounter += 1
          }
          if (text[1] === ' ') {
            sliceCounter += 1
          }
          return text.slice(sliceCounter)
        })
        .join('\n') + '\n'
    )
  }
  return configurationText + '\n'
}

const formatReadmeText = readmeText => {
  // Change all relative links to Github links
  const relativeLinkReplacements = new Map()
  relativeLinkReplacements.set(
    '(https://github.com/influxdata/telegraf/tree/master/plugins/',
    /\(\/plugins\//gi
  )
  relativeLinkReplacements.set(
    '(https://github.com/influxdata/telegraf/tree/master/plugins/parsers/',
    /\(\.\.\/\.\.\/parsers\//gi
  )
  relativeLinkReplacements.set(
    '(https://github.com/influxdata/telegraf/tree/master/docs/',
    /\(\.\.\/\.\.\/\.\.\/docs\//gi
  )

  return readmeText
    .map(line => {
      return [...relativeLinkReplacements.entries()].reduce(
        (modifiedLine, replacementPair) => {
          return modifiedLine.replace(replacementPair[1], replacementPair[0])
        },
        line
      )
    })
    .join()
}

const GITHUB_TELEGRAF_RELEASE_API_PATH =
  'https://api.github.com/repos/influxdata/telegraf/releases'

const getVersion = new Promise((resolve, reject) => {
  const version = process.argv.slice(2)
  if (String(version).length === 0) {
    console.log(
      logSymbols.warning + ' \x1b[33m%s\x1b[0m',
      'No version number provided, using latest release... '
    )
    https.get(
      GITHUB_TELEGRAF_RELEASE_API_PATH,
      {
        headers: {
          'User-Agent': 'request',
        },
      },
      response => {
        let contents = ''
        response.on('data', chunk => {
          contents += chunk
        })

        response.on('error', error => {
          reject(error)
        })

        response.on('end', () => {
          const versions = JSON.parse(String(contents))
          const latestVersion = Array.isArray(versions)
            ? versions[0].name
            : 'master'
          console.log(
            logSymbols.warning + ' \x1b[33m%s\x1b[0m',
            latestVersion + '\n'
          )
          resolve(latestVersion)
        })
      }
    )
  } else {
    resolve(version)
  }
})

const parsedPluginsConfigPath =
  'src/writeData/components/telegrafInputPluginsConfigurationText/'

const parsedPluginsReadmePath = 'src/writeData/components/telegrafPlugins/'

const fetch = (path, parsedPath) => {
  return new Promise((resolve, reject) => {
    https.get(path, response => {
      let contents = ''
      if (response.statusCode !== 200) {
        reject(`Error: status code: ${response.statusCode} for ${path}`)
      }

      response.on('data', chunk => {
        contents += chunk.toString()
      })
      response.on('error', error => {
        reject(error)
      })
      response.on('end', () => {
        if (!fs.existsSync(parsedPath)) {
          fs.mkdirSync(parsedPath)
        }

        resolve(contents.split('\n' + '\n' + '\n'))
      })
    })
  })
}

let newPluginsCount = 0

console.log(
  '\x1b[36m%s\x1b[0m',
  '................................................................................\n'
)

getVersion.then(version => {
  const telegrafConfigFilePath = `https://raw.githubusercontent.com/influxdata/telegraf/${version}/etc/telegraf.conf`

  const telegrafWindowsConfigFilePath = `https://raw.githubusercontent.com/influxdata/telegraf/${version}/etc/telegraf_windows.conf`

  console.log(
    logSymbols.info + ' \x1b[36m%s\x1b[0m',
    `Parsing Telegraf Plugins at ${telegrafConfigFilePath}\n`
  )

  const noConfigs = []

  const parseTelegrafConf = new Promise((resolve, reject) => {
    fetch(telegrafConfigFilePath, parsedPluginsConfigPath).then(
      parsedPluginsText => {
        if (Array.isArray(parsedPluginsText)) {
          const parsedPluginsNames = []
          parsedPluginsText.forEach(pluginText => {
            const pattern = /(.*)\[\[inputs.(.*)\]\]/g
            const match = pluginText.match(pattern)
            if (match) {
              const pluginName = match[0]
                .replace(/(.*)\[\[inputs./g, '')
                .replace(/\]\](.*)/g, '')
              parsedPluginsNames.push(pluginName)
              const destinationFilePath =
                parsedPluginsConfigPath + pluginName + '.conf'
              fs.writeFile(
                destinationFilePath,
                formatConfigurationText(pluginText),
                () => {}
              )
            }
          })
          const noPluginEntry = parsedPluginsNames.filter(
            pluginName =>
              !inputPluginsList.includes(pluginName) &&
              !inputPluginsExceptions.includes(pluginName)
          )
          newPluginsCount = noPluginEntry.length

          if (noPluginEntry.length) {
            console.log(
              logSymbols.warning +
                ' Plugins not listed in the Data > Sources page of the UI:',
              noPluginEntry,
              '\n'
            )
          } else {
            console.log(
              logSymbols.success + ' \x1b[32m%s\x1b[0m',
              'No new plugins detected.\n'
            )
          }

          inputPluginsList.forEach(pluginName => {
            const pattern = new RegExp(`\\binputs.${pluginName}\\b`, 'gi')
            const result = parsedPluginsText.find(config =>
              config.match(pattern)
            )
            if (!result) {
              noConfigs.push(pluginName)
            }
          })

          if (noConfigs.length) {
            console.log(
              logSymbols.warning +
                ' Could not find the following existing plugins in telegraf.conf:',
              noConfigs,
              '\n'
            )
          }
          resolve(noConfigs)
        } else {
          console.log(
            logSymbols.error + ' \x1b[31m%s\x1b[0m',
            'ERROR: Unexpected result: the fetched file was not parsed into an array'
          )
          reject(parsedPluginsText)
        }
      },
      fetchError => reject(fetchError)
    )
  })

  parseTelegrafConf.then(
    nonWindowsPlugins => {
      console.log('Searching elsewhere...')
      console.log(
        logSymbols.info + ' \x1b[36m%s\x1b[0m',
        ` Parsing Telegraf Windows Plugins at ${telegrafWindowsConfigFilePath}\n`
      )
      fetch(telegrafWindowsConfigFilePath, parsedPluginsConfigPath).then(
        parsedPluginsText => {
          if (Array.isArray(parsedPluginsText)) {
            const parsedWindowsPluginsNames = []
            parsedPluginsText.forEach(pluginText => {
              const pattern = /(.*)\[\[inputs.(.*)\]\]/g
              const match = pluginText.match(pattern)
              if (match) {
                const pluginName = match[0]
                  .replace(/(.*)\[\[inputs./g, '')
                  .replace(/\]\](.*)/g, '')

                if (
                  Array.isArray(nonWindowsPlugins) &&
                  nonWindowsPlugins.includes(pluginName)
                ) {
                  parsedWindowsPluginsNames.push(pluginName)
                  const destinationFilePath =
                    parsedPluginsConfigPath + pluginName + '.conf'
                  fs.writeFile(
                    destinationFilePath,
                    formatConfigurationText(pluginText),
                    () => {}
                  )
                }
              }
            })

            const noPluginEntry = parsedWindowsPluginsNames.filter(
              pluginName => !inputPluginsList.includes(pluginName)
            )

            console.log(
              logSymbols.success + ' Found:',
              parsedWindowsPluginsNames,
              '\n'
            )

            const windowsPluginsNotUpdated = noConfigs.filter(
              pluginName => !parsedWindowsPluginsNames.includes(pluginName)
            )

            if (windowsPluginsNotUpdated.length) {
              console.log(
                logSymbols.error + ' \x1b[31m%s\x1b[0m',
                'Unable to update',
                windowsPluginsNotUpdated,
                '\n'
              )
            }

            if (noPluginEntry.length) {
              console.log(
                logSymbols.warning +
                  ' Windows plugins not in the Data > Sources page of the UI:',
                noPluginEntry,
                '\n'
              )
            } else {
              console.log(
                logSymbols.success + ' \x1b[32m%s\x1b[0m',
                ` All plugins are accounted for${
                  windowsPluginsNotUpdated.length
                    ? ' but may not be updated '
                    : ' '
                }in the Load Data > Sources page of the UI\n`
              )
            }
          } else {
            console.log(
              logSymbols.error + ' \x1b[31m%s\x1b[0m',
              'ERROR: Unexpected result: the fetched file was not parsed into an array'
            )
          }

          console.log(
            logSymbols.success + ' \x1b[32m%s\x1b[0m',
            `${inputPluginsList.length} existing plugins`
          )
          console.log(
            newPluginsCount === 0
              ? logSymbols.info + ' \x1b[33m%s\x1b[0m'
              : logSymbols.error + ' \x1b[31m%s\x1b[0m',
            `${newPluginsCount} new plugins\n`
          )
          console.log(
            '\x1b[36m%s\x1b[0m',
            '................................................................................\n'
          )
          console.log(
            logSymbols.warning + ' \x1b[36m%s\x1b[0m',
            'Checking for updates on README markdown files...'
          )
        },
        fetchError => {
          console.error(logSymbols.error, ' ERROR:', fetchError)
        }
      )
    },
    fetchError => {
      console.error(logSymbols.error, ' ERROR:', fetchError)
    }
  )

  const telegrafPluginsReadmeUpdates = []
  const successPrefix = 'success:'
  const failurePrefix = 'failed:'

  inputPluginsList.forEach(pluginName => {
    const telegrafReadmeFilePath = `https://raw.githubusercontent.com/influxdata/telegraf/${version}/plugins/inputs/${pluginName}/README.md`

    telegrafPluginsReadmeUpdates.push(
      fetch(telegrafReadmeFilePath, parsedPluginsReadmePath).then(
        parsedReadme => {
          const destinationFilePath =
            parsedPluginsReadmePath + pluginName + '.md'
          fs.writeFile(
            destinationFilePath,
            formatReadmeText(parsedReadme),
            () => {}
          )
          return `${successPrefix}${pluginName}`
        },
        () => `${failurePrefix}${pluginName}`
      )
    )
  })

  Promise.all(telegrafPluginsReadmeUpdates).then(updateStatuses => {
    const failedStatuses = updateStatuses.filter(updateStatus =>
      updateStatus.startsWith(failurePrefix)
    )

    failedStatuses.forEach(failureStatus => {
      console.log(
        logSymbols.error + ' \x1b[31m%s\x1b[0m',
        'Unable to find README for plugin:',
        failureStatus.slice(failurePrefix.length),
        '\n'
      )
    })

    if (failedStatuses.length) {
      console.log(
        logSymbols.error + ' \x1b[31m%s\x1b[0m',
        '^^^ File paths for the above may be incorrect. You may want to check & update them manually by looking in github at:'
      )
      console.log(
        logSymbols.warning + ' \x1b[36m%s\x1b[0m',
        'https://github.com/influxdata/telegraf/tree/master/plugins/inputs\n'
      )
    }
    console.log(
      logSymbols.success + ' \x1b[32m%s\x1b[0m',
      `${
        updateStatuses.length - failedStatuses.length
      } README files were successfully checked`
    )
    console.log(
      failedStatuses.length
        ? logSymbols.error + ' \x1b[31m%s\x1b[0m'
        : logSymbols.success + ' \x1b[32m%s\x1b[0m',
      `${failedStatuses.length} README files were unsuccessful\n`
    )
  })
})
