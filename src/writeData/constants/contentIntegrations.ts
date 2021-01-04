// Constants
import {INTEGRATIONS} from 'src/shared/constants/routes'

// Types
import {WriteDataItem, WriteDataSection} from 'src/writeData/constants'

export const WRITE_DATA_INTEGRATIONS: WriteDataItem[] = [
  {
    id: 'fitbit',
    name: 'Fitbit',
    url: `${INTEGRATIONS}/fitbit`,
  },
]

const WRITE_DATA_INTEGRATIONS_SECTION: WriteDataSection = {
  id: INTEGRATIONS,
  name: 'Integrations',
  description: 'Description goes here',
  items: WRITE_DATA_INTEGRATIONS,
  featureFlag: 'load-data-integrations',
}

export default WRITE_DATA_INTEGRATIONS_SECTION
