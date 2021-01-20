// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  useState,
  useContext,
  useCallback,
} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  SquareButton,
  IconFont,
  ComponentColor,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Components
import {PipeContext} from 'src/flows/context/pipe'
import Functions from 'src/flows/pipes/RawFluxEditor/functions'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const Query: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const [showFn, setShowFn] = useState(false)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]

  const updateText = useCallback(
    text => {
      const _queries = queries.slice()
      _queries[activeQuery] = {
        ...queries[activeQuery],
        text,
      }

      update({queries: _queries})
    },
    [update, queries, activeQuery]
  )

  const toggleFn = useCallback(() => {
      setShowFn(!showFn)
  }, [setShowFn, showFn])
  const inject = (fn) => {
      console.log('oh neat', fn)
  }

  const controls = (
      <SquareButton
        icon={IconFont.Function}
        onClick={toggleFn}
        color={
          showFn ? ComponentColor.Primary : ComponentColor.Default
        }
        titleText="Function Reference"
        className="flows-config-function-button"
      />
  )

  return (
      <Context controls={controls}>
        <Suspense
          fallback={
            <SpinnerContainer
              loading={RemoteDataState.Loading}
              spinnerComponent={<TechnoSpinner />}
            />
          }
        >
          <FluxMonacoEditor
            script={query.text}
            onChangeScript={updateText}
            onSubmitScript={() => {}}
            autogrow
          />
        </Suspense>
          {showFn && (
              <Functions onSelect={inject} />
          )}
      </Context>
    )
}

export default Query
