// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
  Button,
  IconFont,
  ComponentColor,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {SidebarContext} from 'src/flows/context/sidebar'
import {
  EditorContext,
  EditorProvider,
  InjectionType,
} from 'src/flows/context/editor'

// Components
import SecretsList from 'src/flows/pipes/RawFluxEditor/SecretsList'
import Functions from 'src/flows/pipes/RawFluxEditor/FunctionsList/GroupedFunctionsList'
import DynamicFunctions from 'src/flows/pipes/RawFluxEditor/FunctionsList/DynamicFunctionsList'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const Query: FC<PipeProp> = ({Context}) => {
  const {id, data} = useContext(PipeContext)
  const {hideSub, id: showId, show, showSub, register} = useContext(
    SidebarContext
  )
  const editorContext = useContext(EditorContext)
  const {setEditor, inject, updateText} = editorContext
  const {queries, activeQuery} = data
  const query = queries[activeQuery]

  useEffect(() => {
    if (isFlagEnabled('fluxInjectSecrets')) {
      register(id, [
        {
          title: 'RawFluxEditor actions',
          actions: [
            {
              title: 'Inject Secret',
              disable: () => false,
              menu: <SecretsList inject={inject} />,
            },
          ],
        },
      ])
    }
  }, [id, inject])

  const injectIntoEditor = useCallback(
    (fn): void => {
      let text = ''
      if (fn.name === 'from' || fn.name === 'union') {
        text = `${fn.example}`
      } else {
        text = `  |> ${fn.example}`
      }

      const getHeader = (fn) => {
        let importStatement 

        if (fn.package) {
          importStatement = `import "${fn.package}"`
          if(isFlagEnabled('fluxDynamicDocs') && fn.path.includes('/')) {
            importStatement = `import "${fn.path}"`
          }
          return importStatement
        }
        return null
      }

      const options = {
        text,
        type: InjectionType.OnOwnLine,
        header: getHeader(fn)
      }
      inject(options)
    },
    [inject]
  )

  const launcher = () => {
    if (showId === id) {
      event('Flux Panel (Notebooks) - Toggle Functions - Off')
      hideSub()
    } else {
      event('Flux Panel (Notebooks) - Toggle Functions - On')
      show(id)
      if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
        showSub(<DynamicFunctions onSelect={injectIntoEditor} />)
      } else {
        showSub(<Functions onSelect={injectIntoEditor} />)
      }
    }
  }

  const controls = (
    <Button
      text="Functions"
      icon={IconFont.Function}
      onClick={launcher}
      color={ComponentColor.Default}
      titleText="Function Reference"
      className="flows-config-function-button"
    />
  )

  return useMemo(
    () => (
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
            setEditorInstance={setEditor}
            wrapLines="on"
            autogrow
          />
        </Suspense>
      </Context>
    ),
    [RemoteDataState.Loading, query.text, updateText, editorContext.editor]
  )
}

export default ({Context}) => (
  <EditorProvider>
    <Query Context={Context} />
  </EditorProvider>
)
