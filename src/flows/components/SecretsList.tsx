import React, {
  FC, useCallback, useContext, useEffect, useState,
} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  IconFont,
  InfluxColors,
  JustifyContent,
  ResourceCard,
  TextBlock,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import FilterList from 'src/shared/components/FilterList'

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

// sidebar submenu (scroll container) has padding
// then parent class flow-sidebar--secrets-list offset's the padding
// we still then need to offset the offset (smelly)
const offset = '16px'
const padding = '2px'

const FilterSecrets = FilterList<Secret>()

const SecretToSelect: FC<{secret: Secret, onClick: (id: string) => void}> = ({secret, onClick}) => {
  return (
    <FlexBox.Child key={secret.id} onClick={() => onClick(secret.id)}>
      <TextBlock
        backgroundColor={InfluxColors.Grey5}
        textColor={InfluxColors.Pool}
        text={secret.id}
        testID={`select-secret-${secret.id}`}
        size={ComponentSize.ExtraSmall}
        style={{margin: '8px'}}
      />
    </FlexBox.Child>
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

  const click = (secretId) => {
    updateQuery(secretId);
    event('Concat secret ID to Flux Script', {secretId});
  };

  useEffect(() => {
      dispatch(getSecrets())
      }, [])

  return (
    <FlexBox
      className="flow-sidebar--secrets-list"
      direction={FlexDirection.Column}
    >
      <FlexBox
        style={{marginLeft: offset, width: '100%'}}
        justifyContent={JustifyContent.SpaceBetween}
        className="flow-sidebar--secrets-list--toolbar"
      >
        <SearchWidget
          placeholderText="Filter secrets..."
          searchTerm={searchTerm}
          onSearch={setSearchTerm}

        />
      </FlexBox>
      <FlexBox
        style={{marginLeft: offset, paddingRight: offset, width: '100%'}}
        justifyContent={JustifyContent.SpaceBetween}
        className="flow-sidebar--secrets-list--toolbar"
      >
        <div style={{marginLeft: offset}}>Secrets</div>
        <Button
          text="Add Secret"
          color={ComponentColor.Primary}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.Plus_New}
          onClick={handleCreateSecret}
          testID="button-add-secret"
        />
      </FlexBox>
      <ResourceCard style={{height: '0px', padding}}/>
      <ResourceCard>
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.FlexStart}
          style={{backgroundColor: ComponentColor.Default}}
        >
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
        </FlexBox>
      </ResourceCard>
    </FlexBox>
  )
}

export default SecretsList
