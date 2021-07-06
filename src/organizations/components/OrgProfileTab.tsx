// Libraries
import React, {FC, useContext} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  ComponentSize,
  Panel,
  IconFont,
  FlexBox,
  AlignItems,
  FlexDirection,
  Gradients,
  InfluxColors,
  JustifyContent,
  Grid,
  Columns,
} from '@influxdata/clockface'
import CopyButton from 'src/shared/components/CopyButton'
import PageSpinner from 'src/perf/components/PageSpinner'
import {UsersContext} from 'src/users/context/users'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {copyToClipboardSuccess} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'
import {deleteAccountWarning} from 'src/shared/copy/notifications'

// Types
import {getMe, getQuartzMe} from 'src/me/selectors'

const OrgProfileTab: FC = () => {
  const me = useSelector(getMe)
  const quartzMe = useSelector(getQuartzMe)
  const org = useSelector(getOrg)
  const history = useHistory()
  const {status, users} = useContext(UsersContext)
  const dispatch = useDispatch()

  const handleShowEditOverlay = () => {
    history.push(`/orgs/${org.id}/about/rename`)
  }

  const handleShowDeleteOverlay = () => {
    history.push(`/orgs/${org.id}/about/delete`)
  }

  const handleShowWarning = () => {
    dispatch(notify(deleteAccountWarning()))
  }

  const generateCopyText = (title, text) => () => {
    return copyToClipboardSuccess(text, title)
  }

  let handleDeleteClick = handleShowDeleteOverlay

  if (users.length > 1) {
    handleDeleteClick = handleShowWarning
  }

  return (
    <PageSpinner loading={status}>
      <>
        <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Six}>
          <Panel backgroundColor={InfluxColors.Onyx}>
            <Panel.Header size={ComponentSize.Small}>
              <h4>Organization Profile</h4>
            </Panel.Header>
            <Panel.Body size={ComponentSize.Small}>
              <Panel gradient={Gradients.DocScott}>
                <Panel.Header size={ComponentSize.ExtraSmall}>
                  <h5>Danger Zone!</h5>
                </Panel.Header>
                <Panel.Body size={ComponentSize.ExtraSmall}>
                  <FlexBox
                    stretchToFitWidth={true}
                    alignItems={AlignItems.Center}
                    direction={FlexDirection.Row}
                    justifyContent={JustifyContent.SpaceBetween}
                  >
                    <div>
                      <h5 style={{marginBottom: '0'}}>
                        Rename Organization {org.name}
                      </h5>
                      <p style={{marginTop: '2px'}}>
                        This action can have wide-reaching unintended
                        consequences.
                      </p>
                    </div>
                    <Button
                      testID="rename-org--button"
                      text="Rename"
                      icon={IconFont.Pencil}
                      onClick={handleShowEditOverlay}
                    />
                  </FlexBox>
                </Panel.Body>
                {quartzMe?.accountType === 'free' && (
                  <Panel.Body size={ComponentSize.ExtraSmall}>
                    <FlexBox
                      stretchToFitWidth={true}
                      alignItems={AlignItems.Center}
                      direction={FlexDirection.Row}
                      justifyContent={JustifyContent.SpaceBetween}
                    >
                      <div>
                        <h5 style={{marginBottom: '0'}}>
                          Delete Organization {org.name}
                        </h5>
                        <p style={{marginTop: '2px'}}>
                          Delete your Free InfluxDB Cloud account and remove any
                          data that you have loaded.
                        </p>
                      </div>
                      <Button
                        testID="delete-org--button"
                        text="Delete"
                        icon={IconFont.Trash}
                        onClick={handleDeleteClick}
                      />
                    </FlexBox>
                  </Panel.Body>
                )}
              </Panel>
            </Panel.Body>
          </Panel>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Six}>
          <Panel>
            <Panel.Header size={ComponentSize.ExtraSmall}>
              <h4>Common Ids</h4>
            </Panel.Header>
            <Panel.Body>
              <div className="code-snippet" data-testid="code-snippet">
                <div className="code-snippet--text">
                  <pre>
                    <code>{me.id}</code>
                  </pre>
                </div>
                <div className="code-snippet--footer">
                  <CopyButton
                    text={me.id}
                    onCopy={generateCopyText('User ID', me.id)}
                  />
                  <label className="code-snippet--label">{`${me.name} | User ID`}</label>
                </div>
              </div>
              <div className="code-snippet" data-testid="code-snippet">
                <div className="code-snippet--text">
                  <pre>
                    <code>{org.id}</code>
                  </pre>
                </div>
                <div className="code-snippet--footer">
                  <CopyButton
                    text={org.id}
                    onCopy={generateCopyText('Organization ID', org.id)}
                  />
                  <label className="code-snippet--label">{`${org.name} | Organization ID`}</label>
                </div>
              </div>
            </Panel.Body>
          </Panel>
        </Grid.Column>
      </>
    </PageSpinner>
  )
}

export default OrgProfileTab
