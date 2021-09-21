// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
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
import UsersProvider from 'src/users/context/users'
import OrgProfileDeletePanel from 'src/organizations/components/OrgProfileDeletePanel'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {copyToClipboardSuccess} from 'src/shared/copy/notifications'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

// Types
import {getMe} from 'src/me/selectors'

const OrgProfileTab: FC = () => {
  const me = useSelector(getMe)
  const org = useSelector(getOrg)
  const history = useHistory()

  const handleShowEditOverlay = () => {
    history.push(`/orgs/${org.id}/about/rename`)
  }

  const generateCopyText = (title, text) => () => {
    return copyToClipboardSuccess(text, title)
  }

  return (
    <>
      <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Six}>
        <Panel
          backgroundColor={InfluxColors.Onyx}
          testID="organization-profile--panel"
        >
          <Panel.Header size={ComponentSize.Small}>
            <h4>Organization Profile</h4>
          </Panel.Header>
          <Panel.Body size={ComponentSize.Small}>
            <Panel gradient={Gradients.DocScott}>
              <Panel.Header
                size={ComponentSize.ExtraSmall}
                testID="danger-zone--header"
              >
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
                    <h5
                      style={{marginBottom: '0'}}
                      data-testid="danger-zone--org-name"
                    >
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
              {CLOUD && isFlagEnabled('uiUnificationFlag') && (
                <UsersProvider>
                  <OrgProfileDeletePanel />
                </UsersProvider>
              )}
            </Panel>
          </Panel.Body>
        </Panel>
      </Grid.Column>
      <Grid.Column widthXS={Columns.Twelve} widthSM={Columns.Six}>
        <Panel
          testID="common-ids--panel"
          backgroundColor={InfluxColors.Obsidian}
        >
          <Panel.Header
            size={ComponentSize.ExtraSmall}
            testID="common-ids--header"
          >
            <h4>Common Ids</h4>
          </Panel.Header>
          <Panel.Body>
            <div className="code-snippet" data-testid="code-snippet--userid">
              <div className="code-snippet--text">
                <pre>
                  <code>{me.id}</code>
                </pre>
              </div>
              <div className="code-snippet--footer">
                <CopyButton
                  text={me.id}
                  testID="copy-btn--userid"
                  onCopy={generateCopyText('User ID', me.id)}
                />
                <label className="code-snippet--label">{`${me.name} | User ID`}</label>
              </div>
            </div>
            <div className="code-snippet" data-testid="code-snippet--orgid">
              <div className="code-snippet--text">
                <pre>
                  <code>{org.id}</code>
                </pre>
              </div>
              <div className="code-snippet--footer">
                <CopyButton
                  text={org.id}
                  onCopy={generateCopyText('Organization ID', org.id)}
                  testID="copy-btn--orgid"
                />
                <label
                  className="code-snippet--label"
                  data-testid="org-profile--name"
                >{`${org.name} | Organization ID`}</label>
              </div>
            </div>
          </Panel.Body>
        </Panel>
      </Grid.Column>
    </>
  )
}

export default OrgProfileTab
