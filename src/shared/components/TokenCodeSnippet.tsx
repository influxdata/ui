// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  IconFont,
  DapperScrollbars,
} from '@influxdata/clockface'

// Components
import CopyButton from 'src/shared/components/CopyButton'

// Constants
import {copyToClipboardSuccess} from 'src/shared/copy/notifications'

// Actions
import {generateTelegrafToken} from 'src/dataLoaders/actions/dataLoaders'
import {notify} from 'src/shared/actions/notifications'

interface Props {
  configID: string
  label: string
  testID?: string
  token: string
}

const TokenCodeSnippet: FC<Props> = ({
  configID,
  label = 'Code Snippet',
  testID,
  token,
}) => {
  const dispatch = useDispatch()

  const handleRefreshClick = () => {
    dispatch(generateTelegrafToken(configID))
  }

  const onCopy = () => {
    dispatch(
      notify(
        copyToClipboardSuccess(`${token.slice(0, 30).trimRight()}...`, 'Script')
      )
    )
  }

  return (
    <div className="code-snippet" data-testid={testID}>
      <DapperScrollbars
        autoHide={false}
        autoSizeHeight={true}
        className="code-snippet--scroll"
      >
        <div className="code-snippet--text">
          <pre>{token}</pre>
        </div>
      </DapperScrollbars>
      <div className="code-snippet--footer">
        <div>
          <CopyButton text={token} onCopy={onCopy} />
          <Button
            size={ComponentSize.ExtraSmall}
            status={
              token.includes('<INFLUX_TOKEN>')
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
            text="Generate New Token"
            titleText="Generate New Token"
            icon={IconFont.Refresh}
            color={ComponentColor.Success}
            onClick={handleRefreshClick}
            className="new-token--btn"
          />
        </div>
        <label className="code-snippet--label">{label}</label>
      </div>
    </div>
  )
}

export default TokenCodeSnippet
