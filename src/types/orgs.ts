import {Organization} from 'src/client'

interface OrgWithCloudProvider extends Organization {
  provider?: string
}

export {OrgWithCloudProvider as Organization}
