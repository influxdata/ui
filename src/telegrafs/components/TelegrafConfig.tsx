// Libraries
import React, {PureComponent} from 'react'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import Editor from 'src/shared/components/TomlMonacoEditor'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

interface Props {
  config: string
  onChangeConfig: (config: string) => void
}

@ErrorHandling
export class TelegrafConfig extends PureComponent<Props> {
  public render() {
    const {config, onChangeConfig} = this.props

    return (
      <Editor
        script={config}
        onChangeScript={onChangeConfig}
        readOnly={isFlagEnabled('edit-telegrafs') === false}
      />
    )
  }
}

export default TelegrafConfig
