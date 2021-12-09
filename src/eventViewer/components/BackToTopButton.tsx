// Libraries
import React, {FC} from 'react'
import {Button, IconFont} from '@influxdata/clockface'

// Utils
import {refresh} from 'src/eventViewer/components/EventViewer.reducer'

// Types
import {EventViewerChildProps} from 'src/types'

const BackToTopButton: FC<EventViewerChildProps> = ({
  state,
  dispatch,
  loadRows,
}) => {
  if (state.scrollTop === 0) {
    return (
      <Button
        className="back-to-top-button"
        icon={IconFont.Refresh_New}
        text="Refresh"
        onClick={() => refresh(state, dispatch, loadRows)}
      />
    )
  }

  return (
    <Button
      className="back-to-top-button"
      icon={IconFont.CaretUp_New}
      text="Back to Top"
      onClick={() => dispatch({type: 'CLICKED_BACK_TO_TOP'})}
    />
  )
}

export default BackToTopButton
