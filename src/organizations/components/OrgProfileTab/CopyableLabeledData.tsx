// Libraries
import React, {FC} from 'react'

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
  const generateCopyText = (title, text) => () => {
    return copyToClipboardSuccess(text, title)
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
        className="code-snippet"
        style={{width: '100%'}}
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
