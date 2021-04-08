// Constants
import {FILE_UPLOAD} from 'src/shared/constants/routes'

// Types
import {WriteDataItem, WriteDataSection} from 'src/writeData/constants'

export const WRITE_DATA_FILE_UPLOAD: WriteDataItem[] = [
  {
    id: 'csv',
    name: 'Annotated CSV',
    url: `${FILE_UPLOAD}/csv`,
  },
  {
    id: 'lp',
    name: 'Line Protocol',
    url: `${FILE_UPLOAD}/lp`,
  },
]

const WRITE_DATA_FILE_UPLOAD_SECTION: WriteDataSection = {
  id: FILE_UPLOAD,
  name: 'Native Methods',
  description:
    'Upload line protocol or Annotated CSVs with the click of a button',
  items: WRITE_DATA_FILE_UPLOAD,
  featureFlag: 'load-data-client-libraries',
}

export default WRITE_DATA_FILE_UPLOAD_SECTION
