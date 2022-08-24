import {event} from 'src/cloud/utils/reporting'
import {PointFields, PointTags} from 'src/cloud/apis/reporting'

export const multiOrgEvent = (name: string, fields?: PointFields) => {
  const tags: PointTags = {
    initiative: 'multiOrg',
  }
  event(name, tags, fields)
}
