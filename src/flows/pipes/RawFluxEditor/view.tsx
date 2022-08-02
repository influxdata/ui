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
import {EditorContext, EditorProvider} from 'src/shared/contexts/editor'
import {VariablesContext} from 'src/flows/context/variables'

// Components
import SecretsList from 'src/flows/pipes/RawFluxEditor/SecretsList'
import Functions from 'src/shared/components/GroupedFunctionsList'
import DynamicFunctions from 'src/shared/components/DynamicFunctionsList'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {buildQuery} from 'src/timeMachine/utils/queryBuilder'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const Query: FC<PipeProp> = ({Context}) => {
  const {id, data, update} = useContext(PipeContext)
  const {hideSub, id: showId, show, showSub, register} = useContext(
    SidebarContext
  )
  const editorContext = useContext(EditorContext)
  const {inject, injectFunction} = editorContext
  const {queries, activeQuery} = data
  // NOTE: this is to migrate bad data from an EAR, not part of the spec
  // the first condition is the correct one
  const query = Array.isArray(queries) ? queries[activeQuery] : queries
  const {variables} = useContext(VariablesContext)

  // NOTE: this is to migrate bad data from an EAR, not part of the spec
  // the first condition is the correct one, no need to call build query
  const queryText = query?.text ?? buildQuery(query)

  // NOTE: this should apply the migration
  useEffect(() => {
    if (Array.isArray(queries)) {
      return
    }

    if (!query.text) {
      query.text = buildQuery(query)
    }

    update({...data, queries: [{...query}]})
  }, [id])

  useEffect(() => {
    if (isFlagEnabled('fluxInjectSecrets')) {
      register(id, [
        {
          title: 'RawFluxEditor actions',
          actions: [
            {
              title: 'Inject Secret',
              disable: () => false,
              menu: <SecretsList inject={inject} cbOnInject={updateText} />,
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

  const injectIntoEditor = useCallback(
    (fn): void => {
      injectFunction(fn, updateText)
    },
    [injectFunction, updateText]
  )

  const launcher = useCallback(() => {
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
  }, [injectIntoEditor, showId])

  const controls = (
    <Button
      text="Functions"
      icon={IconFont.Flask}
      onClick={launcher}
      color={ComponentColor.Default}
      titleText="Function Reference"
      className="flows-config-function-button"
      testID="flows-open-function-panel"
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
            script={queryText}
            variables={variables}
            onChangeScript={updateText}
            wrapLines="on"
            autogrow
          />
        </Suspense>
      </Context>
    ),
    [
      RemoteDataState.Loading,
      queryText,
      updateText,
      editorContext.editor,
      variables,
      launcher,
    ]
  )
}

export default ({Context}) => (
  <EditorProvider>
    <Query Context={Context} />
  </EditorProvider>
)
