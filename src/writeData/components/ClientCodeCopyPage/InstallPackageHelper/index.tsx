// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Panel,
  InfluxColors,
  Heading,
  HeadingElement,
  FontWeight,
  Icon,
  IconFont,
  ComponentSize,
} from '@influxdata/clockface'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'
import {Renderer} from 'react-markdown'

import 'src/writeData/components/ClientCodeCopyPage/InstallPackageHelper/index.scss'

interface Props {
  text: string
  codeRenderer: Renderer<HTMLPreElement>
}

const InstallPackageHelper: FC<Props> = ({text, codeRenderer}) => {
  const [mode, changeMode] = useState<'expanded' | 'collapsed'>('collapsed')

  const handleToggleClick = (): void => {
    if (mode === 'expanded') {
      changeMode('collapsed')
    } else {
      changeMode('expanded')
    }
  }

  return (
    <div className="install-package--container">
      <Panel backgroundColor={InfluxColors.Castle}>
        <Panel.Header size={ComponentSize.ExtraSmall}>
          <div
            className={`install-package-helper--heading install-package-helper--heading__${mode}`}
            onClick={handleToggleClick}
          >
            <Icon
              glyph={IconFont.CaretRight}
              className="install-package-helper--caret"
            />
            <Heading
              element={HeadingElement.H5}
              weight={FontWeight.Regular}
              selectable={true}
            >
              Installation Instructions
            </Heading>
          </div>
        </Panel.Header>
        {mode === 'expanded' && (
          <Panel.Body size={ComponentSize.ExtraSmall}>
            <MarkdownRenderer
              text={text}
              cloudRenderers={{code: codeRenderer}}
            />
          </Panel.Body>
        )}
      </Panel>
    </div>
  )
}

export default InstallPackageHelper
