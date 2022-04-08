// Libraries
import React, {FC, ChangeEvent, useState} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Selectors
import {getActiveTimeMachine, getSaveableView} from 'src/timeMachine/selectors'
import {getOrg} from 'src/organizations/selectors'
import {postNotebook} from 'src/client/notebooksRoutes'

// Components
import {Form, Input, Button, Grid} from '@influxdata/clockface'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

// Types
import {
  Columns,
  InputType,
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'

// Utils
import {event, normalizeEventName} from 'src/cloud/utils/reporting'
import {chartTypeName} from 'src/visualization/utils/chartTypeName'
import {
  PROJECT_NAME,
  DEFAULT_PROJECT_NAME,
  PROJECT_NAME_PLURAL,
} from 'src/flows'
import {hydrate, serialize} from 'src/flows/context/flow.list'

interface Props {
  dismiss: () => void
}

const SaveAsNotebookForm: FC<Props> = ({dismiss}) => {
  const [notebookName, setNotebookName] = useState('')
  const orgID = useSelector(getOrg).id
  const stuff = useSelector(getActiveTimeMachine)
  const {draftQueries, autoRefresh, timeRange} = stuff
  const {properties} = useSelector(getSaveableView)
  const history = useHistory()

  const handleChangeNotebookName = (event: ChangeEvent<HTMLInputElement>) => {
    setNotebookName(event.target.value)
  }

  const handleSubmit = async () => {
    event(`Data Explorer Save as ${PROJECT_NAME} Submitted`)

    try {
      event(`data_explorer.save.as_${PROJECT_NAME.toLowerCase()}.success`, {
        which: normalizeEventName(chartTypeName(properties?.type ?? 'xy')),
      })
      const pipes: any = []

      const visualization = {
        title: 'Visualize the Result',
        visible: true,
        type: 'visualization',
        properties,
      }
      for (let i = 0; i < draftQueries.length; i++) {
        const draftQuery = draftQueries[i]

        let pipe: any = {
          family: 'inputs',
          visible: !draftQuery.hidden,
        }
        if (draftQuery.editMode === 'builder') {
          pipe.name = 'Build a Query'
          pipe.type = 'queryBuilder'
          pipe = {
            ...pipe,
            ...draftQuery.builderConfig,
            buckets: [
              {
                // id: TODO(ariel): get the id
                name: draftQuery.builderConfig.buckets[0],
                orgID,
                type: 'user',
              },
            ],
          }
        } else {
          pipe.title = 'Query to Run'
          pipe.queries = properties.queries
          pipe.activeQuery = i
          pipe.type = 'rawFluxEditor'
        }

        pipes.push(pipe)
        pipes.push(visualization)
      }

      const flow = hydrate({
        name: notebookName || DEFAULT_PROJECT_NAME,
        range: timeRange,
        orgID,
        spec: {
          readOnly: false,
          range: timeRange,
          refresh: autoRefresh || AUTOREFRESH_DEFAULT,
          pipes,
        },
      })

      const response = await postNotebook(serialize(flow))

      if (response.status !== 200) {
        throw new Error(response.data.message)
      }

      const {id} = response.data

      // redirect to the notebook
      history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
    } catch (error) {
      event(`data_explorer.save.as_${PROJECT_NAME.toLowerCase()}.failure`, {
        which: normalizeEventName(chartTypeName(properties?.type)),
      })
      console.error(error)
      dismiss()
    } finally {
      setNotebookName('')
    }
  }

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthXS={Columns.Twelve}>
          <Form.Element label={`${PROJECT_NAME} Name`}>
            <Input
              type={InputType.Text}
              placeholder={`Add optional ${PROJECT_NAME.toLowerCase()} name`}
              name="notebookName"
              value={notebookName}
              onChange={handleChangeNotebookName}
              testID={`save-as-${PROJECT_NAME.toLowerCase()}--name`}
            />
          </Form.Element>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve}>
          <Form.Footer>
            <Button
              text="Cancel"
              onClick={dismiss}
              titleText="Cancel"
              type={ButtonType.Button}
              color={ComponentColor.Tertiary}
              testID={`save-as-${PROJECT_NAME.toLowerCase()}--cancel`}
            />
            <Button
              text={`Save as ${PROJECT_NAME}`}
              testID={`save-as-${PROJECT_NAME.toLowerCase()}--submit`}
              color={ComponentColor.Success}
              type={ButtonType.Submit}
              onClick={handleSubmit}
              status={ComponentStatus.Default}
            />
          </Form.Footer>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default SaveAsNotebookForm
