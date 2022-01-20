import React, {FC, useCallback, useEffect, useState, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'

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
import {EditorContextType, InjectionType} from 'src/flows/context/editor'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {Secret} from 'src/types'

const FilterSecrets = FilterList<Secret>()

const SecretToSelect: FC<{
  secret: Secret
  onClick: (secret: Secret) => void
}> = ({secret, onClick}) => {
  return (
    <InjectSecretOption
      option={secret}
      onClick={onClick}
      key={secret.id}
      testID={`select-secret-${secret.id}`}
    />
  )
}

interface Props {
  context: EditorContextType
}

const SecretsList: FC<Props> = ({context: editorContext}) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const dispatch = useDispatch()
  const secrets = useSelector(getAllSecrets)
  const {inject} = editorContext

  const handleCreateSecret = () => {
    event('Create Secret Modal Opened')
    dispatch(
      showOverlay('create-secret', null, () => dispatch(dismissOverlay()))
    )
  }

  const click = useCallback(
    secret => {
      const options = {
        text: `secrets.get("${secret.id}") `,
        type: InjectionType.SameLine,
      }
      inject(options)
      event('Inject secret into Flux Script', {secret: secret.id})
    },
    [inject]
  )

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
                {filteredSecrets.map((s: Secret) => (
                  <SecretToSelect secret={s} key={s.id} onClick={click} />
                ))}
              </>
            )}
          </FilterSecrets>
        </div>
    ),
    [searchTerm, secrets, click]
  )
}

export default SecretsList
