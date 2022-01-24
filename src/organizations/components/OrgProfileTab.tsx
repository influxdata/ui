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
  JustifyContent,
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

const stretchStyle = {width: '100%'}
const sectionStyle = {margin: ComponentSize.Large}
const headingStyle = {marginTop: '24px', marginBottom: '8px'}

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

  const expectQuartzData = CLOUD && isFlagEnabled('uiUnificationFlag')

  return (
    <div style={{width: '60%'}}>
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.FlexStart}
        stretchToFitWidth={true}
        testID="organization-profile--panel"
        margin={ComponentSize.Large}
      >
        <FlexBox.Child
          style={{...stretchStyle, ...sectionStyle}}
          testID="org-profile--panel"
        >
          <h4>Organization Profile</h4>

          <Heading
            element={HeadingElement.H4}
            weight={FontWeight.Regular}
            style={headingStyle}
          >
            Name
          </Heading>
          <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Medium}>
            <Input
              value={org.name}
              style={{width: 'max-content'}}
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
          {expectQuartzData && (
            <>
              <FlexBox
                direction={FlexDirection.Row}
                margin={ComponentSize.Medium}
                justifyContent={JustifyContent.SpaceBetween}
                stretchToFitWidth={true}
                style={{width: '85%'}}
              >
                {[
                  {
                    label: 'Provider',
                    // TODO: replace with pretty print name, when available in API
                    src: me.quartzMe?.billingProvider,
                  },
                  {label: 'Region', src: me.quartzMe?.regionCode},
                  {label: 'Location', src: me.quartzMe?.regionName},
                ].map(({label, src}) => {
                  if (!!src) {
                    return (
                      <FlexBox
                        key={`org-${label.toLowerCase()}`}
                        direction={FlexDirection.Column}
                        margin={ComponentSize.Large}
                        alignItems={AlignItems.FlexStart}
                      >
                        <Heading
                          element={HeadingElement.H4}
                          weight={FontWeight.Regular}
                          style={headingStyle}
                        >
                          {label}
                        </Heading>
                        <span
                          style={{fontWeight: FontWeight.Light, width: '100%'}}
                        >
                          {src}
                        </span>
                      </FlexBox>
                    )
                  } else {
                    return null
                  }
                })}
              </FlexBox>
              {!!me.quartzMe?.clusterHost && (
                <>
                  <Heading
                    element={HeadingElement.H4}
                    style={headingStyle}
                    weight={FontWeight.Regular}
                  >
                    Cluster URL
                  </Heading>
                  <div
                    className="code-snippet"
                    style={stretchStyle}
                    data-testid="code-snippet--userid"
                  >
                    <div className="code-snippet--text">
                      <pre>
                        <code>{me.quartzMe.clusterHost}</code>
                      </pre>
                    </div>
                    <FlexBox
                      className="code-snippet--footer"
                      margin={ComponentSize.Medium}
                      stretchToFitWidth={true}
                    >
                      <CopyButton
                        text={me.id}
                        testID="copy-btn--organizationUrl"
                        onCopy={generateCopyText(
                          'Organization URL',
                          me.quartzMe.clusterHost
                        )}
                      />
                    </FlexBox>
                  </div>
                </>
              )}
            </>
          )}
        </FlexBox.Child>

        <FlexBox.Child
          style={{...stretchStyle, ...sectionStyle}}
          testID="common-ids--panel"
        >
          <h4>Common IDs</h4>
          {[
            {id: 'userid', label: 'User ID', src: me.id, name: me.name},
            {
              id: 'orgid',
              label: 'Organization ID',
              src: org.id,
              name: org.name,
            },
          ].map(({id, label, src, name}) => (
            <div key={`org-${name.toLowerCase()}`}>
              <Heading
                element={HeadingElement.H4}
                style={headingStyle}
                weight={FontWeight.Regular}
              >
                User ID
              </Heading>
              <div
                className="code-snippet"
                style={stretchStyle}
                data-testid={`code-snippet--${id}`}
              >
                <div className="code-snippet--text">
                  <pre>
                    <code>{src}</code>
                  </pre>
                </div>
                <FlexBox
                  className="code-snippet--footer"
                  margin={ComponentSize.Medium}
                  stretchToFitWidth={true}
                  justifyContent={JustifyContent.SpaceBetween}
                >
                  <CopyButton
                    text={src}
                    testID={`copy-btn--${id}`}
                    onCopy={generateCopyText(label, src)}
                  />
                  <label className="code-snippet--label">
                    {`${name} |`} <b>{label}</b>
                  </label>
                </FlexBox>
              </div>
            </div>
          ))}
        </FlexBox.Child>
        {expectQuartzData && (
          <FlexBox.Child style={sectionStyle}>
            <UsersProvider>
              <OrgProfileDeletePanel />
            </UsersProvider>
          </FlexBox.Child>
        )}
      </FlexBox>
    </div>
  )
}

export default OrgProfileTab
