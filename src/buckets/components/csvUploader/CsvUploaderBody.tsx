import React, {FC} from 'react'
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'
import {ProgressBar} from '@influxdata/clockface'

type Props = {
  handleDrop: (csv: string) => void
  hasFile: boolean
  value: number
}

const CsvUploaderBody: FC<Props> = ({handleDrop, hasFile, value}) => (
  <>
    <div>{hasFile && <ProgressBar value={value} max={100} />}</div>
    <DragAndDrop className="line-protocol--content" onSetBody={handleDrop} />
  </>
)

export default CsvUploaderBody
