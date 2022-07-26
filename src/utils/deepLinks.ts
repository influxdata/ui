import {Organization} from 'src/client'
import {PROJECT_NAME_PLURAL} from 'src/flows'

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
  [`/me/${PROJECT_NAME_PLURAL.toLowerCase()}`]: `/orgs/${
    org.id
  }/${PROJECT_NAME_PLURAL.toLowerCase()}`,
  '/me/notebooks': `/orgs/${org.id}/${PROJECT_NAME_PLURAL.toLowerCase()}`,
  '/me/pythonclient': `/orgs/${org.id}/load-data/client-libraries/python`,
  '/me/secrets': `/orgs/${org.id}/settings/secrets`,
  '/me/setup-cli': `/orgs/${org.id}/new-user-setup/cli`,
  '/me/setup-golang': `/orgs/${org.id}/new-user-setup/golang`,
  '/me/setup-nodejs': `/orgs/${org.id}/new-user-setup/nodejs`,
  '/me/setup-python': `/orgs/${org.id}/new-user-setup/python`,
  '/me/tasks': `/orgs/${org.id}/tasks`,
  '/me/telegraf-mqtt': `/orgs/${org.id}/load-data/telegraf-plugins/mqtt_consumer`,
  '/me/telegrafs': `/orgs/${org.id}/load-data/telegrafs`,
  '/me/templates': `/orgs/${org.id}/settings/templates`,
  '/me/tokens': `/orgs/${org.id}/load-data/tokens`,
  '/me/usage': `/orgs/${org.id}/usage`,
  '/me/users': `/orgs/${org.id}/users`,
  '/me/variables': `/orgs/${org.id}/settings/variables`,
})
