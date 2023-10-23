/* eslint @typescript-eslint/no-unused-vars: "off" */
import 'jest'
import 'cypress-plugin-tab'
import {skipOn} from '@cypress/skip-test'

import {
  signin,
  signinWithoutUserReprovision,
  setupUser,
  mockIsCloud2Org,
  createDashboard,
  createCell,
  createOrg,
  createSource,
  deleteOrg,
  flush,
  isIoxOrg,
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
  createDBRP,
  createScraper,
  createView,
  createNotebook,
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
  switchToDataExplorer,
  setScriptToInfluxQL,
  setScriptToFlux,
  setScriptToSql,
  confirmSyncIsOn,
  clearInfluxQLScriptSession,
  clearFluxScriptSession,
  clearSqlScriptSession,
  selectScriptBucket,
  selectScriptMeasurement,
  selectScriptFieldOrTag,
  scriptsLoginWithFlags,
  createScript,
  disableClickThroughAnnouncement
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
      mockIsCloud2Org: typeof mockIsCloud2Org
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
      createNotebook: typeof createNotebook
      createOrg: typeof createOrg
      deleteOrg: typeof deleteOrg
      flush: typeof flush
      isIoxOrg: typeof isIoxOrg
      skipOn: typeof skipOn
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
      createDBRP: typeof createDBRP
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
      switchToDataExplorer: typeof switchToDataExplorer
      setScriptToInfluxQL: typeof setScriptToInfluxQL
      setScriptToFlux: typeof setScriptToFlux
      setScriptToSql: typeof setScriptToSql
      confirmSyncIsOn: typeof confirmSyncIsOn
      clearInfluxQLScriptSession: typeof clearInfluxQLScriptSession
      clearFluxScriptSession: typeof clearFluxScriptSession
      clearSqlScriptSession: typeof clearSqlScriptSession
      selectScriptBucket: typeof selectScriptBucket
      selectScriptMeasurement: typeof selectScriptMeasurement
      selectScriptFieldOrTag: typeof selectScriptFieldOrTag
      scriptsLoginWithFlags: typeof scriptsLoginWithFlags
      createScript: typeof createScript
      disableClickThroughAnnouncement: typeof disableClickThroughAnnouncement
    }
  }
}
