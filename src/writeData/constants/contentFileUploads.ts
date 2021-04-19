// Constants
import {FILE_UPLOAD} from 'src/shared/constants/routes'
import LPMarkdown from 'src/writeData/components/fileUploads/LP.md'
import CSVMarkdown from 'src/writeData/components/fileUploads/CSV.md'

// Graphics
import CSVLogo from 'src/writeData/graphics/csv.svg'
import LPLogo from 'src/writeData/graphics/lp.svg'

// Types
import {WriteDataItem, WriteDataSection} from 'src/writeData/constants'

export const WRITE_DATA_FILE_UPLOAD: WriteDataItem[] = [
  {
    id: 'csv',
    name: 'Annotated CSV',
    url: `${FILE_UPLOAD}/csv`,
    image: CSVLogo,
    markdown: CSVMarkdown,
  },
  {
    id: 'lp',
    name: 'Line Protocol',
    url: `${FILE_UPLOAD}/lp`,
    image: LPLogo,
    markdown: LPMarkdown,
  },
]

const WRITE_DATA_FILE_UPLOAD_SECTION: WriteDataSection = {
  id: FILE_UPLOAD,
  name: 'File Upload',
  description:
    'Upload line protocol or Annotated CSVs with the click of a button',
  items: WRITE_DATA_FILE_UPLOAD,
  featureFlag: 'load-data-client-libraries',
}

export default WRITE_DATA_FILE_UPLOAD_SECTION
