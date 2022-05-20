import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'
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
import FilterList from 'src/flows/shared/FilterList/FilterList'
import InjectSecretOption from 'src/flows/shared/FilterList/InjectionOption'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Actions & Selectors
import {getSecrets} from 'src/secrets/actions/thunks'
import {getAllSecrets} from 'src/resources/selectors'

// Injection
import {PipeContext} from 'src/flows/context/pipe'
import {InjectionOptions, InjectionType} from 'src/shared/contexts/editor'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {Secret} from 'src/types'

interface Props {
  inject: (options: InjectionOptions) => void
}

const SecretsList: FC<Props> = ({inject}) => {
  const dispatch = useDispatch()
  const secrets = useSelector(getAllSecrets)
  const {data, update} = useContext(PipeContext)
  const {queries, activeQuery} = data

  const handleCreateSecret = () => {
    event('Create Secret Modal Opened')
    dispatch(
      showOverlay('create-secret', null, () => dispatch(dismissOverlay()))
    )
  }

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

  const onSelect = useCallback(
    secret => {
      const options = {
        text: `secrets.get(key: "${secret.id}") `,
        type: InjectionType.SameLine,
        header: `import "influxdata/influxdb/secrets"`,
        cbParentOnUpdateText: updateText,
      }
      inject(options)
      event('Inject secret into Flux Script', {secret: secret.id})
    },
    [inject, updateText]
  )

  useEffect(() => {
    dispatch(getSecrets())
  }, [])

  const header = () => (
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
  )

  const render = secret => (
    <InjectSecretOption
      onClick={onSelect}
      option={secret}
      extractor={secret => (secret as Secret).id}
      key={secret.id}
      testID={`select-secret-${secret.id}`}
    />
  )

  return useMemo(
    () => (
      <div className="flow-sidebar--secrets-list">
        <FilterList
          listHeader={header}
          placeholder="Filter secrets..."
          emptyMessage="No secrets match your search"
          extractor={secret => (secret as Secret).id}
          items={secrets}
          renderItem={render}
        />
      </div>
    ),
    [onSelect, secrets]
  )
}

export default SecretsList
