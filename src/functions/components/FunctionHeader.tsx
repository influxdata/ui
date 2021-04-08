// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import CopyToClipboard from 'react-copy-to-clipboard'

// Components
import {Page, Button, ComponentColor} from '@influxdata/clockface'
import {FunctionListContext} from 'src/functions/context/function.list'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {notify} from 'src/shared/actions/notifications'
import {copyFunctionURL} from 'src/shared/copy/notifications'

const FunctionHeader: FC = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const {id: orgID} = useSelector(getOrg)

  const {
    draftFunction: {name, id},
    saveDraftFunction,
  } = useContext(FunctionListContext)

  const closeFunction = () => {
    history.push(`/orgs/${orgID}/functions/`)
    // TODO dont allow routing away if unsaved changes exist
  }

  const functionURL = `https://stag-us-east-1-3.aws.cloud2.influxdata.com/api/v2/functions/${id}/invoke`
  const notifyCopied = () => {
    dispatch(notify(copyFunctionURL()))
  }

  return (
    <>
      <Page.Header fullWidth={false} testID="functions-edit-page--header">
        <Page.Title title={name} />
      </Page.Header>
      <Page.ControlBar fullWidth={true}>
        {id && (
          <Page.ControlBarLeft>
            URL:
            <CopyToClipboard text={functionURL} onCopy={notifyCopied}>
              <div className="code-snippet--text" style={{fontSize: '13px'}}>
                <pre>
                  <code>{functionURL}</code>
                </pre>
              </div>
            </CopyToClipboard>
          </Page.ControlBarLeft>
        )}
        <Page.ControlBarRight>
          <Button
            color={ComponentColor.Default}
            text="Close"
            onClick={closeFunction}
            testID="function-cancel-btn"
          />
          <Button
            color={ComponentColor.Success}
            text="Save"
            onClick={saveDraftFunction}
            testID="function-save-btn"
          />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default FunctionHeader
