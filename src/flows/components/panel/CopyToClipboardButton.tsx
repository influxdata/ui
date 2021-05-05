// Libraries
import React, {FC, useContext} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'

// Utils
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'
import {CopyToClipboardContext} from 'src/flows/context/panel'

const CopyToClipboardButton: FC = () => {
  const {visible, setVisibility} = useContext(CopyToClipboardContext)
  // TODO
  // 1. Create an ovelay just like https://twodotoh.a.influxcloud.dev.local/orgs/3b5e6d0f3881fd11/load-data/client-libraries/python to show
  // Code Sample Options where the users can create a token/bucket
  // 2. Talk to Russ about the issue where _monitoring/_tasks etc buckets aren't visible and we will be overwriting their query bucket with
  // the bucket selected in this overlay. Which means the user would have to copy and then overwrite their bucket manually.
  // 3. Only copy initialize and execute.

  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    const text = copiedText.slice(0, 30).trimRight()
    const truncatedText = `${text}...`

    if (isSuccessful) {
      notify(copyToClipboardSuccess(truncatedText, 'Client Code'))
    } else {
      notify(copyToClipboardFailed(truncatedText, 'Client Code'))
    }
  }

  // return (
  //   <CopyToClipboard text={getPanelQuery(panelId)} onCopy={handleCopyAttempt}>
  //     <span className="copy-bucket-id" title="Click to Copy to Clipboard">
  //       <SquareButton
  //         className="flows-copycb-cell"
  //         testID="flows-copycb-cell"
  //         icon={IconFont.Duplicate}
  //         titleText="Copy to Clipboard"
  //       />
  //     </span>
  //   </CopyToClipboard>
  // )
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
