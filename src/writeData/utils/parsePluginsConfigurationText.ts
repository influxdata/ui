/*
  This file is a node utility for local use only.
  Its purpose is to update the configuration text of Telegraf Input Plugins
  which live here:
  Updates are committed and submitted as a pull request periodically.

  Follow the two steps to update. The commit as a pull request.
*/
import https from 'https'
import fs from 'fs'

/*
  STEP 1:
  inputPluginsList is a map of the 'id' for WRITE_DATA_TELEGRAF_PLUGINS
    from src/writeData/constants/contentTelegrafPlugins.ts
    which has import statements not supported by Node.
    Therefore, we need to re-create this array manually by copy/paste-ing,
    deleting the unnecessary properties, and the destructuring the 'id'
*/
const inputPluginsList = [
  'activemq',
  'aerospike',
  'aliyuncms',
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
  'icinga2',
  'infiniband',
  'influxdb',
  'influxdb_listener',
  'influxdb_v2_listener',
  'intel_powerstat',
  'intel_rdt',
  'internal',
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
  'KNXListener',
  'kube_inventory',
  'kubernetes',
  'lanz',
  'leofs',
  'linux_sysctl_fs',
  'logparser',
  'logstash',
  'lustre2',
  'mailchimp',
  'marklogic',
  'mcrouter',
  'mem',
  'memcached',
  'mesos',
  'minecraft',
  'modbus',
  'mongodb',
  'monit',
  'mqtt_consumer',
  'multifile',
  'mysql',
  'nats',
  'nats_consumer',
  'neptune_apex',
  'net_response',
  'nfsclient',
  'nginx',
  'nginx_plus',
  'nginx_plus_api',
  'nginx_sts',
  'nginx_upstream_check',
  'nginx_vts',
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
  'udp_listener',
  'unbound',
  'uwsgi',
  'varnish',
  'vsphere',
  'webhooks',
  'win_eventlog',
  'win_perf_counters',
  'win_services',
  'wireguard',
  'wireless',
  'x509_cert',
  'zfs',
  'zipkin',
  'zookeeper',
]

const telegrafConfigFilePath = `https://raw.githubusercontent.com/influxdata/telegraf/${process.argv.slice(
  2
)}/etc/telegraf.conf`

const parsedPluginsPath =
  'src/writeData/components/telegrafInputPluginsConfigurationText/'

/*
  // STEP 2: on the command line, run with the desired release version, for example: v1.19.3
  yarn telegraf-plugins:update TELEGRAF_RELEASE_VERSION
 */
https.get(telegrafConfigFilePath, response => {
  let contents = ''
  response.on('data', chunk => {
    contents += chunk.toString()
  })
  response.on('error', error => {
    console.error('ERROR:', error)
  })
  response.on('end', () => {
    if (!fs.existsSync(parsedPluginsPath)) {
      fs.mkdirSync(parsedPluginsPath)
    }

    const parsedPluginsText = contents.split('\n' + '\n' + '\n')

    const parsedPluginsNames = []
    parsedPluginsText.forEach(pluginText => {
      const pattern = /(.*)\[\[inputs.(.*)\]\]/g
      const match = pluginText.match(pattern)
      if (match) {
        const pluginName = match[0]
          .replace(/(.*)\[\[inputs./g, '')
          .replace(/\]\](.*)/g, '')
        parsedPluginsNames.push(pluginName)
        const destinationFilPath = parsedPluginsPath + pluginName + '.conf'
        fs.writeFile(destinationFilPath, pluginText, () => {})
      }
    })

    const noPluginEntry = parsedPluginsNames.filter(
      pluginName => !inputPluginsList.includes(pluginName)
    )

    console.warn(
      'The following are not listed in the Data > Sources page of the UI:',
      noPluginEntry,
      '\n'
    )

    const noConfigs = []
    inputPluginsList.forEach(pluginName => {
      const pattern = new RegExp(`\\binputs.${pluginName}\\b`, 'gi')
      const result = parsedPluginsText.find(config => config.match(pattern))
      if (!result) {
        noConfigs.push(pluginName)
      }
    })
    console.warn(
      'Could not find',
      noConfigs,
      'in',
      telegrafConfigFilePath,
      '\n'
    )
  })
})
