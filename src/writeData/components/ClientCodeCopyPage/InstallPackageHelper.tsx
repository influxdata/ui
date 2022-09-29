// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Heading,
  HeadingElement,
  FontWeight,
  Icon,
  IconFont,
} from '@influxdata/clockface'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

// Styles
import 'src/writeData/components/ClientCodeCopyPage/InstallPackageHelper.scss'

interface Props {
  text: string
  codeRenderer: any
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
      <div
        className={`install-package-helper--heading install-package-helper--heading__${mode}`}
        onClick={handleToggleClick}
      >
        <Icon
          glyph={IconFont.CaretRight_New}
          className="install-package-helper--caret"
        />
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Medium}
          selectable={true}
        >
          Installation Instructions
        </Heading>
      </div>
      {mode === 'expanded' && (
        <MarkdownRenderer
          text={text}
          cloudRenderers={{code: codeRenderer}}
          escapeHtml={false}
        />
      )}
    </div>
  )
}

export default InstallPackageHelper
