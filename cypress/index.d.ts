/* eslint @typescript-eslint/no-unused-vars: "off" */
import 'jest'

import {
  signin,
  setupUser,
  createDashboard,
  createCell,
  createOrg,
  createSource,
  deleteOrg,
  flush,
  getByTestID,
  getByInputName,
  getByInputValue,
  getByTitle,
  createTask,
  createMapVariable,
  createCSVVariable,
  createQueryVariable,
  createAndAddLabel,
  createLabel,
  createBucket,
  createScraper,
  createView,
  fluxEqual,
  createTelegraf,
  createToken,
  writeData,
  wrapEnvironmentVariablesForCloud,
  wrapEnvironmentVariablesForOss,
  getByTestIDSubStr,
  createEndpoint,
  createDashWithCell,
  createDashWithViewAndVar,
  createRule,
  clickAttached,
} from './support/commands'

declare global {
  interface Window extends Window {
    influx: {
      set: (flag: string, value: boolean) => void
    }
  }
  namespace Cypress {
    interface Chainable {
      signin: typeof signin
      setupUser: typeof setupUser
      clickAttached: typeof clickAttached
      createSource: typeof createSource
      createCSVVariable: typeof createCSVVariable
      createQueryVariable: typeof createQueryVariable
      createTask: typeof createTask
      createMapVariable: typeof createMapVariable
      createDashboard: typeof createDashboard
      createCell: typeof createCell
      createDashWithCell: typeof createDashWithCell
      createDashWithViewAndVar: typeof createDashWithViewAndVar
      createView: typeof createView
      createOrg: typeof createOrg
      deleteOrg: typeof deleteOrg
      flush: typeof flush
      getByTestID: typeof getByTestID
      getByInputName: typeof getByInputName
      getByInputValue: typeof getByInputValue
      getByTitle: typeof getByTitle
      getByTestIDSubStr: typeof getByTestIDSubStr
      createAndAddLabel: typeof createAndAddLabel
      createLabel: typeof createLabel
      createBucket: typeof createBucket
      createScraper: typeof createScraper
      fluxEqual: typeof fluxEqual
      createTelegraf: typeof createTelegraf
      createToken: typeof createToken
      writeData: typeof writeData
      wrapEnvironmentVariablesForCloud: typeof wrapEnvironmentVariablesForCloud
      wrapEnvironmentVariablesForOss: typeof wrapEnvironmentVariablesForOss
      createEndpoint: typeof createEndpoint
      createRule: typeof createRule
    }
  }
}
