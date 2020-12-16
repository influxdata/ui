// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import {Form} from '@influxdata/clockface'

// Utils
import {formatQueryText} from 'src/flows/shared/utils'

// Contexts
import {PopupContext} from 'src/flows/context/popup'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const QueryTextPreview: FC = () => {
  const {data} = useContext(PopupContext)
  const script = formatQueryText(data.query)

  return (
    <Form.Element label="">
      <Suspense
        fallback={
          <SpinnerContainer
            loading={RemoteDataState.Loading}
            spinnerComponent={<TechnoSpinner />}
          />
        }
      >
        <FluxMonacoEditor
          script={script}
          onChangeScript={() => {}}
          readOnly
          autogrow
        />
      </Suspense>
    </Form.Element>
  )
}

export default QueryTextPreview
