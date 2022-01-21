// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useCallback,
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
import {FluxToolbarFunction} from 'src/types/shared'
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
import Functions from 'src/flows/pipes/RawFluxEditor/GroupedFunctionsList'
import DynamicFunctions from 'src/flows/pipes/RawFluxEditor/FunctionsList'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
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
  const {register: setEditorInstance, inject, updateText} = editorContext
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
              menu: <SecretsList context={editorContext} />,
            },
          ],
        },
      ])
    }
  }, [id, editorContext.editor, editorContext.inject])

  const injectIntoEditor = useCallback(
    (fn: FluxToolbarFunction): void => {
      let text = ''
      if (fn.name === 'from' || fn.name === 'union') {
        text = `\n${fn.example}\n`
      } else {
        text = `  |> ${fn.example}\n`
      }

      const options = {
        text,
        type: InjectionType.OnOwnLine,
        header: !!fn.package ? `import "${fn.package}"` : null,
      }
      inject(options)
      event('Inject function into Flux Script', {fn: fn.name})
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
      if (isFlagEnabled('fluxDynamicDocs')) {
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
          wrapLines="on"
          autogrow
        />
      </Suspense>
    </Context>
  )
}

export default ({Context}) => (
  <EditorProvider>
    <Query Context={Context} />
  </EditorProvider>
)
