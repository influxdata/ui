import React, {
  FC, useCallback, useContext, useEffect, useState, useMemo,
} from 'react'
import {
  connect, ConnectedProps, useDispatch, useSelector,
} from 'react-redux'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  FlexBox,
  IconFont,
  JustifyContent,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import FilterList from 'src/shared/components/FilterList'
import InjectSecretOption from 'src/flows/pipes/RawFluxEditor/FluxInjectionOption'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Actions & Selectors
import {getSecrets} from 'src/secrets/actions/thunks'
import {getAllSecrets} from 'src/resources/selectors'

// Context
import {PipeContext} from 'src/flows/context/pipe'
import {EditorContextType} from 'src/flows/context/editor'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {Secret} from 'src/types'

const FilterSecrets = FilterList<Secret>()

const SecretToSelect: FC<{secret: Secret, onClick: (secret: Secret) => void}> = ({secret, onClick}) => {
  return (
    <InjectSecretOption
      option={secret}
      onClick={onClick}
      key={secret.id}
      testID={`select-secret-${secret.id}`}
    />
  )
}

type ReduxProps = ConnectedProps<typeof connector>

interface Props extends ReduxProps {
  context: EditorContextType
}

const SecretsList: FC<Props> = ({
  context: editorContext,
  onDismissOverlay,
  onShowOverlay,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const dispatch = useDispatch()
  const secrets = useSelector(getAllSecrets)
  const {data} = useContext(PipeContext)
  const {
    editor,
    calcInsertPosition,
    updateText,
  } = editorContext
  const {queries, activeQuery} = data || {queries:[]}
  const query = queries[activeQuery]

  const handleCreateSecret = () => {
    event('Create Secret Modal Opened')
    onShowOverlay('create-secret', null, onDismissOverlay)
  }

  const inject = useCallback(
    secret => {
      if (!editor) {
        return
      }
      const {
        row,
        column,
        shouldInsertOnNextLine,
      } = calcInsertPosition(query.text)
      let text = ''

      if (shouldInsertOnNextLine) {
        text = `\nsecrets.get("${secret.id}") `
      } else {
        text = ` secrets.get("${secret.id}") `
      }

      const range = new window.monaco.Range(row, column, row, column)
      const edits = [
        {
          range,
          text,
        },
      ]
      editor.executeEdits('', edits)
      updateText(editor.getValue())
    },
    [editor, query.text]
  )

  const click = (secret: Secret) => {
    inject(secret);
    event('Concat secret ID to Flux Script', {secret: secret.id});
  };

  useEffect(() => {
      dispatch(getSecrets())
  }, [])

  return useMemo(
    () => (
      <div className="flux-toolbar flow-sidebar--secrets-list">
        <div className="flux-toolbar--search">
          <SearchWidget
            placeholderText="Filter secrets..."
            searchTerm={searchTerm}
            onSearch={setSearchTerm}

          />
        </div>
        <FlexBox
          className="flux-toolbar--heading"
          justifyContent={JustifyContent.SpaceBetween}
        >
          <div>Secrets</div>
          <Button
            style={{marginRight: '-16px'}}
            text="Add Secret"
            color={ComponentColor.Primary}
            size={ComponentSize.ExtraSmall}
            icon={IconFont.Plus_New}
            onClick={handleCreateSecret}
            testID="button-add-secret"
          />
        </FlexBox>
        <FilterSecrets
          list={secrets}
          searchKeys={['id']}
          searchTerm={searchTerm}
        >
          {filteredSecrets => (
            <>
              {filteredSecrets.map(
                (s: Secret) => <SecretToSelect secret={s} key={s.id} onClick={click} />
              )}
            </>
          )}
        </FilterSecrets>
      </div>
    ), [searchTerm, secrets]
  )
}

const mdtp = {
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
}

const connector = connect(null, mdtp)

export default connector(SecretsList)
