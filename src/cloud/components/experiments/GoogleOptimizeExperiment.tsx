// Libraries
import {FC, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'

// Utils
import {getExperimentVariantId} from 'src/cloud/utils/experiments'
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {getMe} from 'src/me/selectors'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  /** Experiment ID found in the Measurements and Objectives section of the Google Optimize experiment Details page */
  experimentID: string
  /** Activation event specified in the Settings section of the Google Optimize experiment Details page */
  activationEvent?: string
  /** Original component to display when experiment is not active (will also be the default first variant when the experiment is running) */
  original?: JSX.Element
  /** Array of elements to be displayed in the A/B or Multivariate test */
  variants: JSX.Element[]
}

export const GoogleOptimizeExperiment: FC<Props> = ({
  experimentID,
  activationEvent,
  original = null,
  variants,
}) => {
  const [variantID, setExperimentVariantId] = useState<string>('')
  const me = useSelector(getMe)
  const org = useSelector(getOrg)

  useEffect(() => {
    setExperimentVariantId(
      getExperimentVariantId(experimentID, activationEvent)
    )

    if (org && me && variantID) {
      event(
        'optimize.user_variant',
        {},
        {
          experiment_id: experimentID,
          variant: variantID,
          user_id: me.id,
          org_id: org.id,
        }
      )
    }
  }, [org, me])

  if (variantID) {
    return [original, ...variants][variantID] || original
  }

  return original
}
