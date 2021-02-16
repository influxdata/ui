import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

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

// utils
import {getOrg} from 'src/organizations/selectors'

interface Props {
  id: string
  name: string
}

const FunctionCard: FC<Props> = ({id, name}) => {
  const {id: orgID} = useSelector(getOrg)
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
