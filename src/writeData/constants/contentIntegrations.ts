// Constants
import {INTEGRATIONS} from 'src/shared/constants/routes'

// Types
import {WriteDataItem, WriteDataSection} from 'src/writeData/constants'

import fitbitLogo from 'src/writeData/graphics/fitbitLogo.svg'

export const WRITE_DATA_INTEGRATIONS: WriteDataItem[] = [
  {
    id: 'fitbit',
    name: 'Fitbit',
    url: `${INTEGRATIONS}/fitbit`,
    image: fitbitLogo,
  },
]

const WRITE_DATA_INTEGRATIONS_SECTION: WriteDataSection = {
  id: INTEGRATIONS,
  name: 'Integrations',
  description: 'integrate with other datasources',
  items: WRITE_DATA_INTEGRATIONS,
  featureFlag: 'load-data-integrations',
}

export default WRITE_DATA_INTEGRATIONS_SECTION
