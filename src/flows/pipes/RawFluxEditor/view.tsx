// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  useEffect,
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
import {EditorType} from 'src/types'
import {FluxToolbarFunction} from 'src/types/shared'
import {PipeProp} from 'src/types/flows'

// Components
import {PipeContext} from 'src/flows/context/pipe'
import {SidebarContext} from 'src/flows/context/sidebar'
import Functions from 'src/flows/pipes/RawFluxEditor/functions'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const Query: FC<PipeProp> = ({Context}) => {
  const {id, data, update} = useContext(PipeContext)
  const [showFn, setShowFn] = useState(true)
  const {register} = useContext(SidebarContext)
  const [editorInstance, setEditorInstance] = useState<EditorType>(null)
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

  const inject = useCallback(
    (fn: FluxToolbarFunction): void => {
      if (!editorInstance) {
        return
      }
      const p = editorInstance.getPosition()
      const split = query.text.split('\n')
      let row = p.lineNumber
      let text = ''

      if ((split[row] || split[split.length - 1]).trim()) {
        row = p.lineNumber + 1
      }

      const [currentRange] = editorInstance.getVisibleRanges()
      // Determines whether the new insert line is beyond the current range
      let shouldInsertOnLastLine = row > currentRange.endLineNumber
      // edge case for when user toggles to the script editor
      // this defaults the cursor to the initial position (top-left, 1:1 position)
      if (p.lineNumber === 1 && p.column === 1) {
        // adds the function to the end of the query
        shouldInsertOnLastLine = true
        row = currentRange.endLineNumber + 1
      }

      if (shouldInsertOnLastLine) {
        text = `\n  |> ${fn.example}`
      } else {
        text = `  |> ${fn.example}\n`
      }

      if (fn.name === 'from' || fn.name === 'union') {
        text = `\n${fn.example}\n`
      }

      const range = new window.monaco.Range(row, 1, row, 1)

      const edits = [
        {
          range,
          text,
        },
      ]

      if (fn.package && !query.text.includes(`import "${fn.package}"`)) {
        edits.unshift({
          range: new window.monaco.Range(1, 1, 1, 1),
          text: `import "${fn.package}"\n`,
        })
      }

      editorInstance.executeEdits('', edits)
      updateText(editorInstance.getValue())
    },
    [editorInstance, query.text]
  )

  const toggleFn = useCallback(() => {
    setShowFn(!showFn)
  }, [setShowFn, showFn])

  const controls = isFlagEnabled('flow-sidebar') ? null : (
    <SquareButton
      icon={IconFont.Function}
      onClick={toggleFn}
      color={showFn ? ComponentColor.Primary : ComponentColor.Default}
      titleText="Function Reference"
      className="flows-config-function-button"
    />
  )

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'Documentation',
        actions: [
          {
            title: 'Functions',
            menu: <Functions onSelect={inject} />,
          },
        ],
      },
    ])
  }, [id, inject])

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
          setEditorInstance={setEditorInstance}
          autogrow
          wrapLines="on"
        />
      </Suspense>
      {!isFlagEnabled('flow-sidebar') && showFn && (
        <div className="flow-nonsidebar">
          <Functions onSelect={inject} />
        </div>
      )}
    </Context>
  )
}

export default Query
