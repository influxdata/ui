// Libraries
import React, {FC, useContext} from 'react'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'

// Utils
import {CopyToClipboardContext} from 'src/flows/context/panel'

const CopyToClipboardButton: FC = () => {
  const {visible, setVisibility} = useContext(CopyToClipboardContext)

  return (
    <SquareButton
      className="flows-copycb-cell"
      testID="flows-copycb-cell"
      icon={IconFont.Duplicate}
      titleText="Copy to Clipboard"
      onClick={() => setVisibility(!visible)}
    />
  )
}

export default CopyToClipboardButton
