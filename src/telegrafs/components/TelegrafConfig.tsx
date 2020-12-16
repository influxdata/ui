// Libraries
import React, {lazy, PureComponent, Suspense} from 'react'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const Editor = lazy(() => import('src/shared/components/TomlMonacoEditor'))

interface Props {
  config: string
  onChangeConfig: (config: string) => void
}

@ErrorHandling
export class TelegrafConfig extends PureComponent<Props> {
  public render() {
    const {config, onChangeConfig} = this.props

    return (
      <Suspense fallback={<div>loading...</div>}>
        <Editor
          script={config}
          onChangeScript={onChangeConfig}
          readOnly={isFlagEnabled('editTelegrafs') === false}
        />
      </Suspense>
    )
  }
}

export default TelegrafConfig
