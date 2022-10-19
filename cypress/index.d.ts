/* eslint @typescript-eslint/no-unused-vars: "off" */
import 'jest'
import 'cypress-plugin-tab'

import {
  signin,
  signinWithoutUserReprovision,
  setupUser,
  createDashboard,
  createCell,
  createOrg,
  createSource,
  deleteOrg,
  flush,
  getByTestID,
  getByTestIDHead,
  getByInputName,
  getByInputValue,
  getByTestIDAndSetInputValue,
  getByTitle,
  clickNavBarItem,
  createTask,
  createMapVariable,
  createCSVVariable,
  createQueryVariable,
  createMapVariableFromFixture,
  createAndAddLabel,
  createLabel,
  createBucket,
  createScraper,
  createView,
  fluxEqual,
  createTelegraf,
  createToken,
  fillInOSSLoginFormWithDefaults,
  writeData,
  writeLPData,
  writeLPDataFromFile,
  wrapEnvironmentVariablesForCloud,
  wrapEnvironmentVariablesForOss,
  getByTestIDSubStr,
  createEndpoint,
  createDashWithCell,
  createDashWithViewAndVar,
  createRule,
  createCheck,
  clickAttached,
  upsertSecret,
  setFeatureFlags,
  setFeatureFlagsNoNav,
  quartzProvision,
  createTaskFromEmpty,
  createAlertGroup,
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
      signinWithoutUserReprovision: typeof signinWithoutUserReprovision
      setupUser: typeof setupUser
      clickAttached: typeof clickAttached
      clickNavBarItem: typeof clickNavBarItem
      createSource: typeof createSource
      createCSVVariable: typeof createCSVVariable
      createQueryVariable: typeof createQueryVariable
      createTask: typeof createTask
      createMapVariable: typeof createMapVariable
      createMapVariableFromFixture: typeof createMapVariableFromFixture
      createDashboard: typeof createDashboard
      createCell: typeof createCell
      createDashWithCell: typeof createDashWithCell
      createDashWithViewAndVar: typeof createDashWithViewAndVar
      createView: typeof createView
      createOrg: typeof createOrg
      deleteOrg: typeof deleteOrg
      flush: typeof flush
      getByTestID: typeof getByTestID
      getByTestIDHead: typeof getByTestIDHead
      getByInputName: typeof getByInputName
      getByInputValue: typeof getByInputValue
      getByTestIDAndSetInputValue: typeof getByTestIDAndSetInputValue
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
      writeLPData: typeof writeLPData
      writeLPDataFromFile: typeof writeLPDataFromFile
      wrapEnvironmentVariablesForCloud: typeof wrapEnvironmentVariablesForCloud
      wrapEnvironmentVariablesForOss: typeof wrapEnvironmentVariablesForOss
      fillInOSSLoginFormWithDefaults: typeof fillInOSSLoginFormWithDefaults
      createEndpoint: typeof createEndpoint
      createRule: typeof createRule
      createCheck: typeof createCheck
      createAlertGroup: typeof createAlertGroup
      setFeatureFlags: typeof setFeatureFlags
      setFeatureFlagsNoNav: typeof setFeatureFlagsNoNav
      upsertSecret: typeof upsertSecret
      quartzProvision: typeof quartzProvision
      createTaskFromEmpty: typeof createTaskFromEmpty
    }
  }
}
