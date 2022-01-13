import React, {
  FC, useCallback, useContext, useEffect, useState,
} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

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

// Actions & Selectors
import {getSecrets} from 'src/secrets/actions/thunks'
import {getOrg} from 'src/organizations/selectors'
import {getAllSecrets} from 'src/resources/selectors'

// Context
import {FlowListContext} from 'src/flows/context/flow.list'
import {PipeContext} from 'src/flows/context/pipe'

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

const SecretsList: FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const dispatch = useDispatch()
  const history = useHistory()
  const secrets = useSelector(getAllSecrets)
  const orgId = useSelector(getOrg)?.id
  const {currentID} = useContext(FlowListContext)
  const {data, update} = useContext(PipeContext)
  const {queries, activeQuery} = data

  const handleCreateSecret = () => {
    event('Create Secret Modal Opened')
    history.push(`/orgs/${orgId}/notebooks/${currentID}/secrets/new`)
  }

  const updateQuery = useCallback(
    secret => {
      const {text} = queries[activeQuery]
      const _queries = queries.slice()
      _queries[activeQuery] = {
        ...queries[activeQuery],
        text: `${text} secrets.get("${secret}")`,
      }

      update({queries: _queries})
    },
    [update, queries, activeQuery]
  )

  const click = (secret: Secret) => {
    updateQuery(secret.id);
    event('Concat secret ID to Flux Script', {secret: secret.id});
  };

  useEffect(() => {
      dispatch(getSecrets())
      }, [])

  return (
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
          style={{ marginRight: '-16px'}}
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
  )
}

export default SecretsList
