// Constants
import {NATIVE_METHODS} from 'src/shared/constants/routes'

// Types
import {WriteDataItem, WriteDataSection} from 'src/writeData/constants'

// Graphics
import arduinoLogo from 'src/writeData/graphics/arduinoLogo.svg'
import csharpLogo from 'src/writeData/graphics/csharpLogo.svg'

export const WRITE_DATA_NATIVE_METHODS: WriteDataItem[] = [
  {
    id: 'csv',
    name: 'Annotated CSV',
    url: `${NATIVE_METHODS}/csv`,
    image: arduinoLogo,
  },
  {
    id: 'lp',
    name: 'Line Protocol',
    url: `${NATIVE_METHODS}/lp`,
    image: csharpLogo,
  },
]

const WRITE_DATA_NATIVE_METHODS_SECTION: WriteDataSection = {
  id: NATIVE_METHODS,
  name: 'Native Methods',
  description:
    'Upload line protocol or Annotated CSVs with the click of a button',
  items: WRITE_DATA_NATIVE_METHODS,
  featureFlag: 'load-data-client-libraries',
}

export default WRITE_DATA_NATIVE_METHODS_SECTION
