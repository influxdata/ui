import React, {FC} from 'react'

// Components
import BucketSelector from 'src/dataExplorer/components/BucketSelector'

const Schema: FC = () => {
  return (
    <div>
      <div>Data Selection</div>
      <div>
        <div>Bucket</div>
        <BucketSelector />
      </div>
      <div>
        <div>Measurement</div>
        <div>[Measurement dropdown]</div>
      </div>
      <div>
        <div>[Search bar for fields and tags]</div>
        <div>
          <div>Fields</div>
          <div>[Fields list]</div>
          <div>Load More</div>
        </div>
        <div>
          <div>Tag Keys</div>
          <div>[Tag List]</div>
          <div>Lode More</div>
        </div>
      </div>
    </div>
  )
}

export default Schema
