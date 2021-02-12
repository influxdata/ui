import React, {FC} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexDirection,
  ResourceCard,
  FlexBox,
} from '@influxdata/clockface'
import FunctionContextMenu from 'src/functions/components/FunctionContextMenu'
import LastRunFunctionStatus from 'src/functions/components/LastRunFunctionStatus'

interface Props {
  id: string
  name: string
}

const FunctionCard: FC<Props> = ({id, name}) => {
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleClick = () => {
    history.push(`/orgs/${orgID}/functions/${id}/edit`)
  }

  return (
    <ResourceCard
      key={`function-card--${id}`}
      testID={`function-card--${name}`}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Large}
      direction={FlexDirection.Row}
      contextMenu={<FunctionContextMenu id={id} name={name} />}
    >
      <LastRunFunctionStatus
        lastRunError={undefined}
        lastRunStatus={'success'}
      />
      <FlexBox
        alignItems={AlignItems.FlexStart}
        direction={FlexDirection.Column}
        margin={ComponentSize.Medium}
      >
        <ResourceCard.Name name={name} onClick={handleClick} />
        <ResourceCard.Meta>
          <>Last triggered 3 minutes ago</>
          <>Trigger URL: http://moo.influxdata.com/yerfunctionisawesome</>
        </ResourceCard.Meta>
      </FlexBox>
    </ResourceCard>
  )
}

export default FunctionCard
