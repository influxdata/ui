// Libraries
import React, {FC, useContext} from 'react'
import {ComponentStatus, Dropdown, IconFont} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'

const ToBucket: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  return (
    <Context>
      <div className="data-source--controls">
        <div className="data-source--bucket">
          <Dropdown
            button={(active, onClick) => (
              <Dropdown.Button
                onClick={onClick}
                active={active}
                icon={IconFont.BucketSolid}
                status={ComponentStatus.Disabled}
              >
                {data?.bucket?.name ?? 'No Bucket Selected'}
              </Dropdown.Button>
            )}
            menu={onCollapse => <Dropdown.Menu onCollapse={onCollapse} />}
            style={{width: '250px', flex: '0 0 250px'}}
          />
        </div>
      </div>
    </Context>
  )
}

export default ToBucket
