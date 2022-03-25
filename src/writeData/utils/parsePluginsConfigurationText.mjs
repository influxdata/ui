/*
  This file is a node utility for local use only.
  Its purpose is to update the configuration text of Telegraf Input Plugins
  which live here: src/writeData/components/telegrafInputPluginsConfigurationText/
  Updates are committed and submitted as a pull request periodically.

  Follow the two steps to update. Then commit the updated files as a pull request.
*/
import https from 'https'
import fs from 'fs'
import logSymbols from 'log-symbols'

/*
  STEP 1:
  inputPluginsList is a map of the 'id' for WRITE_DATA_TELEGRAF_PLUGINS
    from src/writeData/constants/contentTelegrafPlugins.ts
    which has import statements (of .svg and .md files) not supported by Node.
    Therefore, we need to re-create this array manually by copy/paste-ing,
    deleting the unnecessary properties, and the destructuring the 'id'
*/
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
  'jolokia2',
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
  'mqtt_consumer',
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
  STEP 2:
    on the command line, run
      yarn telegraf-plugins:update [TELEGRAF_RELEASE_VERSION]
        if given, will update plugins for the given Telegraf release
        if omitted, will use the latest Telegraf release

*/

const GITHUB_TELEGRAF_RELEASE_API_PATH =
  'https://api.github.com/repos/influxdata/telegraf/releases'

const getVersion = new Promise((resolve, reject) => {
  const version = process.argv.slice(2)
  if (String(version).length === 0) {
    console.warn(
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
          console.warn(
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

const parsedPluginsPath =
  'src/writeData/components/telegrafInputPluginsConfigurationText/'

const fetch = path => {
  return new Promise((resolve, reject) => {
    https.get(path, response => {
      let contents = ''
      response.on('data', chunk => {
        contents += chunk.toString()
      })
      response.on('error', error => {
        reject(error)
      })
      response.on('end', () => {
        if (!fs.existsSync(parsedPluginsPath)) {
          fs.mkdirSync(parsedPluginsPath)
        }

        resolve(contents.split('\n' + '\n' + '\n'))
      })
    })
  })
}

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

getVersion.then(version => {
  const telegrafConfigFilePath = `https://raw.githubusercontent.com/influxdata/telegraf/${version}/etc/telegraf.conf`

  const telegrafWindowsConfigFilePath = `https://raw.githubusercontent.com/influxdata/telegraf/${version}/etc/telegraf_windows.conf`

  console.warn(
    logSymbols.info + ' \x1b[36m%s\x1b[0m',
    `Parsing Telegraf Plugins at ${telegrafConfigFilePath}\n`
  )

  const noConfigs = []

  const parseTelegrafConf = new Promise((resolve, reject) => {
    fetch(telegrafConfigFilePath).then(
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
              const destinationFilPath =
                parsedPluginsPath + pluginName + '.conf'
              fs.writeFile(
                destinationFilPath,
                formatConfigurationText(pluginText),
                () => {}
              )
            }
          })
          const noPluginEntry = parsedPluginsNames.filter(
            pluginName => !inputPluginsList.includes(pluginName)
          )

          if (noPluginEntry.length) {
            console.warn(
              logSymbols.warning +
                ' Plugins not listed in the Data > Sources page of the UI:',
              noPluginEntry,
              '\n'
            )
          } else {
            console.warn(
              logSymbols.success + ' \x1b[32m%s\x1b[0m',
              'Congratulations! All Plugins accounted for and showing in Data > Sources'
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
            console.warn(
              logSymbols.warning + ' Could not find',
              noConfigs,
              'in telegraf.conf\n'
            )
          }
          resolve(noConfigs)
        } else {
          console.warn(
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
      console.warn('Searching elsewhere...')
      console.warn(
        logSymbols.info + ' \x1b[36m%s\x1b[0m',
        ` Parsing Telegraf Windows Plugins at ${telegrafWindowsConfigFilePath}\n`
      )
      fetch(telegrafWindowsConfigFilePath).then(
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
                  const destinationFilPath =
                    parsedPluginsPath + pluginName + '.conf'
                  fs.writeFile(
                    destinationFilPath,
                    formatConfigurationText(pluginText),
                    () => {}
                  )
                }
              }
            })

            const noPluginEntry = parsedWindowsPluginsNames.filter(
              pluginName => !inputPluginsList.includes(pluginName)
            )

            console.warn(
              logSymbols.success + ' Found:',
              parsedWindowsPluginsNames,
              '\n'
            )

            const windowsPluginsNotUpdated = noConfigs.filter(
              pluginName => !parsedWindowsPluginsNames.includes(pluginName)
            )

            if (windowsPluginsNotUpdated.length) {
              console.warn(
                logSymbols.error + ' \x1b[31m%s\x1b[0m',
                'Unable to update',
                windowsPluginsNotUpdated,
                '\n'
              )
            }

            if (noPluginEntry.length) {
              console.warn(
                logSymbols.warning +
                  ' Windows plugins not in the Data > Sources page of the UI:',
                noPluginEntry,
                '\n'
              )
            } else {
              console.warn(
                logSymbols.success +
                  ` All Windows Plugins are listed${
                    windowsPluginsNotUpdated.length
                      ? ' but may not be updated '
                      : ' '
                  }in the Data > Sources page of the UI\n`
              )
            }
          } else {
            console.warn(
              logSymbols.error + ' \x1b[31m%s\x1b[0m',
              'ERROR: Unexpected result: the fetched file was not parsed into an array'
            )
          }
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
})
