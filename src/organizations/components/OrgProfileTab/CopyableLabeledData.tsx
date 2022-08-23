// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  FlexBox,
  ComponentSize,
  Heading,
  HeadingElement,
  FontWeight,
  JustifyContent,
  Button,
  IconFont,
} from '@influxdata/clockface'
import CopyButton from 'src/shared/components/CopyButton'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Utils
import {copyToClipboardSuccess} from 'src/shared/copy/notifications'
import 'src/organizations/components/OrgProfileTab/style.scss'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  id: string
  label: string
  src: string
  name?: string
  isRenameableOrg?: boolean
}

const CopyableLabeledData: FC<Props> = ({
  id,
  label,
  src,
  name,
  isRenameableOrg,
}) => {
  const dispatch = useDispatch()
  const org = useSelector(getOrg)
  const history = useHistory()

  const generateCopyText = () => {
    dispatch(notify(copyToClipboardSuccess(label, src)))
  }

  const handleShowEditOverlay = () => {
    history.push(`/orgs/${org.id}/org-settings/rename`)
  }

  return (
    <>
      <Heading
        element={HeadingElement.H4}
        className="org-profile-tab--heading"
        weight={FontWeight.Regular}
      >
        {label}
      </Heading>
      <div
        className="code-snippet org-profile-tab--copyableText"
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
            onCopy={generateCopyText}
          />
          {isRenameableOrg && (
            <Button
              testID="rename-org--button"
              text="Rename"
              icon={IconFont.Pencil}
              onClick={handleShowEditOverlay}
              size={ComponentSize.ExtraSmall}
            />
          )}
          {name && (
            <label
              className="code-snippet--label"
              data-testid="org-profile--name"
            >
              {`${name} |`} <b>{label}</b>
            </label>
          )}
        </FlexBox>
      </div>
    </>
  )
}

export default CopyableLabeledData
