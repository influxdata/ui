import {Organization} from 'src/client'

export const buildDeepLinkingMap = (org: Organization) => ({
  '/me/about': `/orgs/${org.id}/about`,
  '/me/alerts': `/orgs/${org.id}/alerting`,
  '/me/billing': `/orgs/${org.id}/billing`,
  '/me/buckets': `/orgs/${org.id}/load-data/buckets`,
  '/me/csharpclient': `/orgs/${org.id}/load-data/client-libraries/csharp`,
  '/me/dashboards': `/orgs/${org.id}/dashboards-list`,
  '/me/data-explorer': `/orgs/${org.id}/data-explorer`,
  '/me/goclient': `/orgs/${org.id}/load-data/client-libraries/go`,
  '/me/home': `/orgs/${org.id}`,
  '/me/javaclient': `/orgs/${org.id}/load-data/client-libraries/java`,
  '/me/labels': `/orgs/${org.id}/settings/labels`,
  '/me/load-data': `/orgs/${org.id}/load-data/sources`,
  '/me/nodejsclient': `/orgs/${org.id}/load-data/client-libraries/javascript-node`,
  '/me/notebooks': `/orgs/${org.id}/notebooks`,
  '/me/pythonclient': `/orgs/${org.id}/load-data/client-libraries/python`,
  '/me/secrets': `/orgs/${org.id}/settings/secrets`,
  '/me/tasks': `/orgs/${org.id}/tasks`,
  '/me/telegraf-mqtt': `/orgs/${org.id}/load-data/telegraf-plugins/mqtt_consumer`,
  '/me/telegrafs': `/orgs/${org.id}/load-data/telegrafs`,
  '/me/templates': `/orgs/${org.id}/settings/templates`,
  '/me/tokens': `/orgs/${org.id}/load-data/tokens`,
  '/me/usage': `/orgs/${org.id}/usage`,
  '/me/users': `/orgs/${org.id}/users`,
  '/me/variables': `/orgs/${org.id}/settings/variables`,
})
