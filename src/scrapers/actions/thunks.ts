// Libraries
import {normalize} from 'normalizr'

// Schemas
import {arrayOfScrapers, scraperSchema} from 'src/schemas'

// Types
import {
  RemoteDataState,
  GetState,
  Scraper,
  ScraperEntities,
  ResourceType,
} from 'src/types'
import {Dispatch} from 'react'

// Actions
import {
  Action as ScraperAction,
  setScrapers,
  addScraper,
  editScraper,
  removeScraper,
} from 'src/scrapers/actions/creators'
import {notify, Action as NotifyAction} from 'src/shared/actions/notifications'

import {
  scraperCreateFailed,
  scraperCreateSuccess,
  scraperDeleteFailed,
  scraperDeleteSuccess,
  scraperUpdateFailed,
  scraperUpdateSuccess,
} from 'src/shared/copy/notifications'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {getStatus} from 'src/resources/selectors'
import {CLOUD} from 'src/shared/constants'

let getScrapersApi
let deleteScraperApi
let postScraper
let patchScraper

if (!CLOUD) {
  getScrapersApi = require('src/client').getScrapers
  deleteScraperApi = require('src/client').deleteScraper
  postScraper = require('src/client').postScraper
  patchScraper = require('src/client').patchScraper
}

type Action = ScraperAction | NotifyAction

export const getScrapers =
  () => async (dispatch: Dispatch<Action>, getState: GetState) => {
    try {
      const state = getState()
      if (
        getStatus(state, ResourceType.Scrapers) === RemoteDataState.NotStarted
      ) {
        dispatch(setScrapers(RemoteDataState.Loading))
      }
      const org = getOrg(state)

      dispatch(setScrapers(RemoteDataState.Loading))

      const resp = await getScrapersApi({query: {orgID: org.id}})
      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const scrapers = resp.data.configurations

      const normalized = normalize<Scraper, ScraperEntities, string[]>(
        scrapers,
        arrayOfScrapers
      )
      dispatch(setScrapers(RemoteDataState.Done, normalized))
    } catch (error) {
      console.error(error)
      dispatch(setScrapers(RemoteDataState.Error))
    }
  }

export const createScraper =
  (scraper: Scraper) => async (dispatch: Dispatch<Action>) => {
    try {
      const resp = await postScraper({
        data: scraper,
      })

      if (resp.status !== 201) {
        throw new Error(resp.data.message)
      }

      const {data} = resp

      const normalized = normalize<Scraper, ScraperEntities, string>(
        data,
        scraperSchema
      )

      dispatch(addScraper(normalized))
      dispatch(notify(scraperCreateSuccess()))
    } catch (error) {
      console.error(error)
      dispatch(notify(scraperCreateFailed()))
    }
  }

export const updateScraper =
  (scraper: Scraper) => async (dispatch: Dispatch<Action>) => {
    try {
      const resp = await patchScraper({
        scraperTargetID: scraper.id,
        data: scraper,
      })

      if (resp.status !== 200) {
        throw new Error(resp.data.message)
      }

      const {data} = resp
      const normalized = normalize<Scraper, ScraperEntities, string>(
        data,
        scraperSchema
      )

      dispatch(editScraper(normalized))
      dispatch(notify(scraperUpdateSuccess(scraper.name)))
    } catch (error) {
      console.error(error)
      dispatch(notify(scraperUpdateFailed(scraper.name)))
    }
  }

export const deleteScraper =
  (scraper: Scraper) => async (dispatch: Dispatch<Action>) => {
    try {
      await deleteScraperApi({scraperTargetID: scraper.id})

      dispatch(removeScraper(scraper.id))
      dispatch(notify(scraperDeleteSuccess(scraper.name)))
    } catch (error) {
      console.error(error)
      dispatch(notify(scraperDeleteFailed(scraper.name)))
    }
  }
