export const convertProviderSymbol = (sym: string) => symbolProviderMap[sym]

const symbolProviderMap = {
  zuora: 'Zuora Z-Commerce Platform',
  aws: 'Amazon Web Services',
  gcm: 'Google Cloud Platform',
  azure: 'Microsoft Azure',
}

export const REGIONS = [
  {
    label: 'US West (Oregon)',
    group: symbolProviderMap['aws'],
    value: 'https://us-west-2-1.aws.cloud2.influxdata.com',
  },
  {
    label: 'US East (Virginia)',
    group: symbolProviderMap['aws'],
    value: 'https://us-east-1-1.aws.cloud2.influxdata.com',
  },
  {
    label: 'Europe West (Frankfurt)',
    group: symbolProviderMap['aws'],
    value: 'https://eu-central-1-1.aws.cloud2.influxdata.com',
  },
  {
    label: 'US Central (Iowa)',
    group: symbolProviderMap['gcm'],
    value: 'https://us-central1-1.gcp.cloud2.influxdata.com',
  },
  {
    label: 'Europe West (Belgium)',
    group: symbolProviderMap['gcm'],
    value: 'https://europe-west1-1.gcp.cloud2.influxdata.com',
  },
  {
    label: 'US East (Virginia)',
    group: symbolProviderMap['azure'],
    value: 'https://eastus-1.azure.cloud2.influxdata.com',
  },
  {
    label: 'Europe West (Amsterdam)',
    group: symbolProviderMap['azure'],
    value: 'https://westeurope-1.azure.cloud2.influxdata.com',
  },
  {
    label: 'Tools Cluster',
    group: 'Development',
    flag: 'local-dev',
    value: 'https://influxdb.aws.influxdata.io',
  },
  {
    label: 'Local Kind Cluster',
    group: 'Development',
    flag: 'local-dev',
    value: 'https://twodotoh.a.influxcloud.dev.local',
  },
  {label: 'Current Region', value: 'self'},
  {label: 'Self Hosted', value: 'self-hosted'},
]
