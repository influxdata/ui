// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  IconFont,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  Input,
  Heading,
  HeadingElement,
  FontWeight,
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
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        stretchToFitWidth={false}
        testID="organization-profile--panel"
        margin={ComponentSize.Large}
      >
        <h4>Organization Profile</h4>

        <Heading
          element={HeadingElement.H4}
          weight={FontWeight.Regular}
          style={{marginBottom: '4px'}}
        >
          Name
        </Heading>
        <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Medium}>
          <Input
            value={org.name}
            data-testid="danger-zone--org-name"
            testID="danger-zone--org-name"
          ></Input>
          <Button
            testID="rename-org--button"
            text="Rename"
            icon={IconFont.Pencil}
            onClick={handleShowEditOverlay}
          />
        </FlexBox>

        <FlexBox.Child testID="common-ids--panel">
          <h4>Common IDs</h4>

          <Heading
            element={HeadingElement.H4}
            style={{marginBottom: '4px'}}
            weight={FontWeight.Regular}
          >
            User ID
          </Heading>
          <div className="code-snippet" data-testid="code-snippet--userid">
            <div className="code-snippet--text">
              <pre>
                <code>{me.id}</code>
              </pre>
            </div>
            <FlexBox
              className="code-snippet--footer"
              margin={ComponentSize.Medium}
            >
              <CopyButton
                text={me.id}
                testID="copy-btn--userid"
                onCopy={generateCopyText('User ID', me.id)}
              />
              <label className="code-snippet--label">
                {`${me.name} |`} <b>User ID</b>
              </label>
            </FlexBox>
          </div>
          <Heading
            element={HeadingElement.H4}
            style={{marginTop: '16px', marginBottom: '4px'}}
            weight={FontWeight.Regular}
          >
            Organization ID
          </Heading>
          <div className="code-snippet" data-testid="code-snippet--orgid">
            <div className="code-snippet--text">
              <pre>
                <code>{org.id}</code>
              </pre>
            </div>
            <FlexBox
              className="code-snippet--footer"
              margin={ComponentSize.Medium}
            >
              <CopyButton
                text={org.id}
                onCopy={generateCopyText('Organization ID', org.id)}
                testID="copy-btn--orgid"
              />
              <label
                className="code-snippet--label"
                data-testid="org-profile--name"
              >
                {`${org.name} |`} <b> Organization ID </b>
              </label>
            </FlexBox>
          </div>
        </FlexBox.Child>
        {CLOUD && isFlagEnabled('uiUnificationFlag') && (
          <UsersProvider>
            <OrgProfileDeletePanel />
          </UsersProvider>
        )}
      </FlexBox>
    </>
  )
}

export default OrgProfileTab
