// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {Renderer} from 'react-markdown'

// Components
// import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'
import {CodeSampleBlock} from 'src/writeData/containers/ClientLibrariesPage'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'

// Types
import {ResourceType} from 'src/types'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import InstallPackageHelper from './InstallPackageHelper/index'

// Utils
import {parse} from 'src/external/parser'
import {getBucketsFromAST} from 'src/flows/context/query'
import CodeSnippet, {
  Context as TemplateContext,
} from 'src/shared/components/CodeSnippet'
import {getOrg} from 'src/organizations/selectors'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => {
  return <CodeSnippet text={props.value} label={props.language} />
}

interface Props {
  contentID: string
  query: string
}

const INFLUXDB_TOKEN = '<INFLUXDB_TOKEN>'

const ClientCodeCopyPage: FC<Props> = ({contentID, query}) => {
  const {variables, update} = useContext(TemplateContext)
  const org = useSelector(getOrg)

  useEffect(() => {
    if (!variables.server) {
      update({...variables, server: window.location.origin})
    }
  }, [variables, update])

  useEffect(() => {
    if (variables.token !== INFLUXDB_TOKEN) {
      update({...variables, token: INFLUXDB_TOKEN})
    }
  }, [variables, update])

  useEffect(() => {
    if (variables?.org !== org.name) {
      update({...variables, org: org.name})
    }
  }, [variables?.org, variables, update, org])

  useEffect(() => {
    const queryBucket = getBucketsFromAST(parse(query))[0]
    if (variables.bucket !== queryBucket) {
      update({...variables, bucket: queryBucket})
    }
  }, [variables?.bucket, variables, update, query])

  const def = CLIENT_DEFINITIONS[contentID]
  const executeDefinition = def.execute
    .toString()
    .replace('<%= query %>', query)

  let description

  if (def.description) {
    description = (
      <InstallPackageHelper
        text={def.description}
        codeRenderer={codeRenderer}
      />
    )
  }

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <div className="write-data--details">
        <div
          className="write-data--details-content markdown-format"
          data-testid="load-data-details-content"
        >
          {description}
          <CodeSampleBlock
            name="Initialize and Execute Flux"
            sample={`${def.initialize}${executeDefinition}`}
          />
        </div>
      </div>
    </GetResources>
  )
}

export default ClientCodeCopyPage
