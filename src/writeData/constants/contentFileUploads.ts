// Constants
import LPMarkdown from 'src/writeData/components/fileUploads/LP.md'
import AnnotatedCSVMarkdown from 'src/writeData/components/fileUploads/AnnotatedCSV.md'
import CSVMarkdown from 'src/writeData/components/fileUploads/CSV.md'

// Graphics
import CSVLogo from 'src/writeData/graphics/csv.svg'
import LPLogo from 'src/writeData/graphics/lp.svg'

// Types
export interface FileUpload {
  id: string
  name: string
  image?: string
  markdown?: string
}

export const WRITE_DATA_FILE_UPLOADS: FileUpload[] = [
  {
    id: 'annotated_csv',
    name: 'Flux Annotated CSV',
    image: CSVLogo,
    markdown: AnnotatedCSVMarkdown,
  },
  {
    id: 'lp',
    name: 'Line Protocol',
    image: LPLogo,
    markdown: LPMarkdown,
  },
  {
    id: 'csv',
    name: 'CSV Data (CLI)',
    image: CSVLogo,
    markdown: CSVMarkdown,
  },
]

export const search = (term: string): FileUpload[] =>
  WRITE_DATA_FILE_UPLOADS.filter(item =>
    item.name.toLowerCase().includes(term.toLowerCase())
  )
