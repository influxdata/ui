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
import {FluxFunction, FluxToolbarFunction} from 'src/types'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {SidebarContext} from 'src/flows/context/sidebar'
import {EditorProvider} from 'src/shared/contexts/editor'
import {
  InjectionType,
  InjectionContext,
  InjectionProvider,
} from 'src/shared/contexts/injection'
import {VariablesContext} from 'src/flows/context/variables'

// Components
import SecretsList from 'src/flows/pipes/RawFluxEditor/SecretsList'
import Functions from 'src/shared/components/functions/FunctionsList/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/functions/FunctionsList/DynamicFunctionsList'

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
  const {id, data, update} = useContext(PipeContext)
  const {hideSub, id: showId, show, showSub, register} = useContext(
    SidebarContext
  )
  const {inject} = useContext(InjectionContext)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]
  const {variables} = useContext(VariablesContext)

  useEffect(() => {
    if (isFlagEnabled('fluxInjectSecrets')) {
      register(id, [
        {
          title: 'RawFluxEditor actions',
          actions: [
            {
              title: 'Inject Secret',
              disable: () => false,
              menu: <SecretsList inject={injectSecret} />,
            },
          ],
        },
      ])
    }
  }, [id, inject])

  const updateText = useCallback(
    text => {
      const _queries = [...queries]
      _queries[activeQuery] = {
        ...queries[activeQuery],
        text,
      }

      update({queries: _queries})
    },
    [queries, activeQuery]
  )

  const injectSecret = useCallback(
    secret => {
      inject({
        type: InjectionType.Secret,
        secret,
      })
    },
    [inject]
  )

  const injectFunction = useCallback(
    (fn: FluxFunction | FluxToolbarFunction): void => {
      inject({
        type: InjectionType.Function,
        function: fn,
      })
    },
    [inject]
  )

  const launcher = useCallback(() => {
    if (showId === id) {
      event('Flux Panel (Notebooks) - Toggle Functions - Off')
      hideSub()
    } else {
      event('Flux Panel (Notebooks) - Toggle Functions - On')
      show(id)
      if (CLOUD && isFlagEnabled('fluxDynamicDocs')) {
        showSub(<DynamicFunctions onSelect={injectFunction} />)
      } else {
        showSub(<Functions onSelect={injectFunction} />)
      }
    }
  }, [injectFunction, showId])

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
          <EditorProvider>
            <FluxMonacoEditor
              script={query.text}
              variables={variables}
              onChangeScript={updateText}
              wrapLines="on"
              autogrow
            />
          </EditorProvider>
        </Suspense>
      </Context>
    ),
    [RemoteDataState.Loading, query.text, updateText, variables, launcher]
  )
}

export default ({Context}) => (
  <InjectionProvider>
    <Query Context={Context} />
  </InjectionProvider>
)
