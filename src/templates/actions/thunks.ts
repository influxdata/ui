// APIs
import {fetchStacks, fetchReadMe} from 'src/templates/api'

// Actions
import {
  setStacks,
  setTemplateReadMe,
  Action as TemplateAction,
} from 'src/templates/actions/creators'

// Types
import {Dispatch} from 'react'

// Utils
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {readMeFormatter} from 'src/templates/utils'
import {event} from 'src/cloud/utils/reporting'

type Action = TemplateAction

// community template thunks

export const fetchAndSetStacks =
  (orgID: string) =>
  async (dispatch: Dispatch<Action>): Promise<void> => {
    try {
      const stacks = await fetchStacks(orgID)
      dispatch(setStacks(stacks))
    } catch (error) {
      console.error(error)
    }
  }

export const fetchAndSetReadme =
  (name: string, directory: string) =>
  async (dispatch: Dispatch<Action>): Promise<void> => {
    try {
      const response = await fetchReadMe(directory)
      const readme = readMeFormatter(response)
      dispatch(setTemplateReadMe(name, readme))
    } catch (error) {
      if (name === 'dashboard') {
        event('Community template README failed', {context: name})
      } else {
        reportErrorThroughHoneyBadger(error, {
          name: `The community template github readme fetch failed for ${name}`,
        })
      }
      dispatch(
        setTemplateReadMe(
          name,
          "###### We can't find the readme associated with this template"
        )
      )
    }
  }
