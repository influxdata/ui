import React, {FC} from 'react'

const Schema: FC = () => {
  return (
    <div>
      <div>Data Selection</div>
      <div>
        <div>Bucket</div>
        <div>[Bucket dropdown]</div>
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
