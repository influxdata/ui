import React, {FC, ReactElement} from 'react'
import {useSelector} from 'react-redux'

import {timeZone} from 'src/shared/selectors/app'

import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

interface Props {
  format: string
  date: Date
}

/*
 * This component is a higher level wrapper around the core formatting functionality.
 * It is aware of the user's preference for timezone, either local or UTC
 */
export const FormattedDateTime: FC<Props> = (props): ReactElement => {
  const formatter = createDateTimeFormatter(props.format, useSelector(timeZone))

  return <>{formatter.format(props.date)}</>
}
