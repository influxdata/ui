import React, {FC, useRef, useContext} from 'react'

// Components
import {
  Popover,
  PopoverInteraction,
  PopoverPosition,
  Appearance,
  ComponentColor,
  ComponentSize,
  List,
  ListItemRef,
} from '@influxdata/clockface'
import CreateBucketOverlay from 'src/flows/pipes/QueryBuilder/CreateBucketOverlay'
import {BucketContext} from 'src/shared/contexts/buckets'

const CreateBucket: FC = () => {
  const {createBucket} = useContext(BucketContext)
  const triggerRef = useRef<ListItemRef>(null)

  return (
    <>
      <List.Item
        className="selector-list--item"
        testID="selector-list add-bucket"
        title="Click to create a bucket"
        ref={triggerRef}
        onClick={() => {}}
        wrapText={false}
        size={ComponentSize.ExtraSmall}
      >
        + Create Bucket
      </List.Item>
      <Popover
        triggerRef={triggerRef}
        appearance={Appearance.Outline}
        color={ComponentColor.Primary}
        position={PopoverPosition.Above}
        showEvent={PopoverInteraction.Click}
        hideEvent={PopoverInteraction.Click}
        testID="create-bucket-popover"
        contents={onHide => (
          <CreateBucketOverlay
            onCancel={onHide}
            onCreate={bucket => {
              createBucket(bucket)
              onHide()
            }}
          />
        )}
      />
    </>
  )
}

export default CreateBucket
