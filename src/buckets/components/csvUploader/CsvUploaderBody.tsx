import React, {FC, useContext} from 'react'
import DragAndDrop from 'src/buckets/components/csvUploader/DragAndDrop'
import {ProgressBar} from '@influxdata/clockface'
import {CsvUploaderContext} from 'src/buckets/components/context/csvUploaderProvider'

const CsvUploaderBody: FC = () => {
  const {handleDrop, hasFile, value} = useContext(CsvUploaderContext)

  return (
    <>
      <div>{hasFile && <ProgressBar value={value} max={100} />}</div>
      <DragAndDrop className="line-protocol--content" onSetBody={handleDrop} />
    </>
  )
}

export default CsvUploaderBody
