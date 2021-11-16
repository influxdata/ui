// Libraries
import React, {FC, useContext} from 'react'
import {
  ComponentStatus,
  DapperScrollbars,
  Dropdown,
  IconFont,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Contexts
import {PipeContext} from 'src/flows/context/pipe'

// Components
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import SelectorList from 'src/timeMachine/components/SelectorList'

const QueryBuilder: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  return (
    <Context resizes>
      <div className="query-builder" data-testid="query-builder">
        <div className="query-builder--cards">
          <DapperScrollbars noScrollY={true}>
            <div className="builder-card--list">
              <BuilderCard testID="bucket-selector">
                <BuilderCard.Header title="From" />
                <BuilderCard.Menu>
                  <Dropdown
                    button={(active, onClick) => (
                      <Dropdown.Button
                        onClick={onClick}
                        active={active}
                        icon={IconFont.BucketSolid}
                        status={ComponentStatus.Disabled}
                      >
                        {!!data?.buckets?.length && data?.buckets?.[0]?.name
                          ? data.buckets[0].name
                          : 'No Bucket Selected'}
                      </Dropdown.Button>
                    )}
                    menu={onCollapse => (
                      <Dropdown.Menu onCollapse={onCollapse} />
                    )}
                    style={{width: '250px', flex: '0 0 250px'}}
                  />
                </BuilderCard.Menu>
              </BuilderCard>
              {data.tags.map(tag => (
                <BuilderCard key={tag.key}>
                  <BuilderCard.Header
                    title={tag.aggregateFunctionType.toUpperCase()}
                  />
                  <Dropdown
                    button={(active, onClick) => (
                      <Dropdown.Button
                        onClick={onClick}
                        active={active}
                        icon={
                          tag.aggregateFunctionType === 'filter'
                            ? IconFont.FunnelSolid
                            : IconFont.Link
                        }
                        status={ComponentStatus.Disabled}
                      >
                        {tag.key}
                      </Dropdown.Button>
                    )}
                    menu={onCollapse => (
                      <Dropdown.Menu onCollapse={onCollapse} />
                    )}
                    style={{width: '250px'}}
                  />
                  <SelectorList
                    items={tag.values}
                    selectedItems={tag.values}
                    onSelectItem={() => {}}
                    multiSelect
                  />
                </BuilderCard>
              ))}
            </div>
          </DapperScrollbars>
        </div>
      </div>
    </Context>
  )
}

export default QueryBuilder
