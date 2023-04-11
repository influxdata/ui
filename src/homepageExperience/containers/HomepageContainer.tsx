// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import {HomepageContents} from 'src/homepageExperience/containers/HomepageContents'
import {HomepageContentsTSM} from 'src/homepageExperience/containers/HomepageContentsTSM'

// Utils
import {isOrgIOx} from 'src/organizations/selectors'

export const HomepageContainer: FC = () => {
  const homepageContents = useSelector(isOrgIOx) ? (
    <HomepageContents />
  ) : (
    <HomepageContentsTSM />
  )

  return <>{homepageContents}</>
}
