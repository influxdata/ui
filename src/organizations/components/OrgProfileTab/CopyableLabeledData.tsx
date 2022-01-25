// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  FlexBox,
  ComponentSize,
  Heading,
  HeadingElement,
  FontWeight,
  JustifyContent,
} from '@influxdata/clockface'
import CopyButton from 'src/shared/components/CopyButton'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Utils
import {copyToClipboardSuccess} from 'src/shared/copy/notifications'
import 'src/organizations/components/OrgProfileTab/style.scss'

interface Props {
  id: string
  label: string
  src: string
  name?: string
}

const CopyableLabeledData: FC<Props> = ({id, label, src, name}) => {
  const dispatch = useDispatch()
  const generateCopyText = () => {
    dispatch(notify(copyToClipboardSuccess(label, src)))
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
