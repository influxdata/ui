describe('Onboarding Redirect', () => {
  beforeEach(() =>
    cy
      .flush()
      .then(() => cy.wrapEnvironmentVariablesForOss().then(() => cy.visit('/')))
  )

  it('Can redirect to onboarding page', () => {
    cy.getByTestID('init-step--head-main')
    cy.location('pathname').should('include', 'onboarding/0')
  })
})

// NOTE: important to test for OSS
describe('Onboarding', () => {
  beforeEach(() =>
    cy.flush().then(() => {
      cy.intercept('api/v2/setup').as('orgSetup')
      cy.wrapEnvironmentVariablesForOss().then(() => cy.visit('onboarding/0'))
    })
  )

  it('Can Onboard to Quick Start', () => {
    // Check and visit splash page
    cy.getByTestID('init-step--head-main').contains('Welcome to InfluxDB')
    cy.getByTestID('credits').contains('Powered by')
    cy.getByTestID('credits').contains('InfluxData')

    // Continue onboarding
    cy.getByTestID('onboarding-get-started').click()

    cy.location('pathname').should('include', 'onboarding/1')

    // Check navigation bar
    cy.getByTestID('nav-step--welcome').click()

    // Check splash page
    cy.getByTestID('init-step--head-main').contains('Welcome to InfluxDB')
    cy.getByTestID('credits').contains('Powered by')
    cy.getByTestID('credits').contains('InfluxData')

    // Continue
    cy.getByTestID('onboarding-get-started').click()

    // Check onboarding page - nav bar
    cy.getByTestID('nav-step--welcome').contains('Welcome')
    cy.getByTestID('nav-step--welcome')
      .parent()
      .children('span')
      .should($span => {
        expect($span).to.have.class('checkmark')
      })

    cy.getByTestID('nav-step--setup')
      .contains('Initial User Setup')
      .should('be.visible')
    cy.getByTestID('nav-step--setup').should('have.class', 'current')

    cy.getByTestID('nav-step--complete')
      .parent()
      .should($el => {
        expect($el).to.have.class('unclickable')
      })

    // Check onboarding page headers and controls
    cy.getByTestID('admin-step--head-main').contains('Setup Initial User')

    cy.getByTestID('next').should('be.disabled')

    cy.getByTestID('next').contains('CONTINUE', {matchCase: false})

    // Input fields
    cy.fillInOSSLoginFormWithDefaults()

    cy.getByTestID('next').contains('CONTINUE', {matchCase: false})

    cy.getByTestID('next').should('be.enabled').click()

    cy.wait('@orgSetup')

    cy.getByTestID('notification-success').should('be.visible')

    cy.get('@orgSetup').then(req => {
      const {
        response: {body},
      } = req
      const orgId: string = body.org.id

      // wait for new page to load
      cy.location('pathname').should('include', 'onboarding/2')

      // check navbar
      cy.getByTestID('nav-step--complete').should('have.class', 'current')

      cy.getByTestID('nav-step--welcome').should('have.class', 'checkmark')
      cy.getByTestID('nav-step--setup').should('have.class', 'checkmark')

      cy.getByTestID('button--advanced').should('be.visible')

      cy.getByTestID('button--conf-later').should('be.visible')

      // advance to Quick Start
      cy.getByTestID('button--quick-start').click()

      cy.location('pathname').should('equal', '/orgs/' + orgId)
    })
  })

  it('Can onboard to advanced', () => {
    // Continue onboarding
    cy.getByTestID('onboarding-get-started').click()
    cy.location('pathname').should('include', 'onboarding/1')

    cy.fillInOSSLoginFormWithDefaults()

    cy.getByTestID('next').click()

    cy.wait('@orgSetup')

    cy.getByTestID('notification-success').should('be.visible')

    cy.get('@orgSetup').then(req => {
      const {
        response: {body},
      } = req
      const orgId: string = body.org.id

      // wait for new page to load
      cy.location('pathname').should('include', 'onboarding/2')

      // advance to Advanced
      cy.getByTestID('button--advanced').click()

      // wait for new page to load

      cy.location('pathname').should('match', /orgs\/.*\/buckets/)

      cy.location('pathname').should('include', orgId)
    })
  })

  it('Can onboard to configure later', () => {
    // Continue onboarding
    cy.getByTestID('onboarding-get-started').click()
    cy.location('pathname').should('include', 'onboarding/1')

    cy.fillInOSSLoginFormWithDefaults()

    cy.getByTestID('next').click()

    cy.wait('@orgSetup')

    cy.getByTestID('notification-success').should('be.visible')

    cy.get('@orgSetup').then(req => {
      const {
        response: {body},
      } = req
      const orgId: string = body.org.id

      // wait for new page to load

      cy.location('pathname').should('include', 'onboarding/2')

      // advance to Advanced
      cy.getByTestID('button--conf-later').click()

      cy.location('pathname').should('include', orgId)
    })
  })

  it('respects field requirements', () => {
    // Continue
    cy.getByTestID('onboarding-get-started').click()

    cy.get<string>('@defaultUser').then((defaultUser: string) => {
      cy.getByTestID('input-field--username').type(defaultUser)
    })

    cy.getByTestID('next')
      .should('be.disabled')
      .contains('CONTINUE', {matchCase: false})

    cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
      cy.getByTestID('input-field--password').type(defaultPassword)
    })

    cy.getByTestID('next')
      .should('be.disabled')
      .contains('CONTINUE', {matchCase: false})

    cy.getByTestID('input-field--password-chk').type('drowssap')

    // check password mismatch
    cy.getByTestID('form--element-error').should(
      'have.text',
      'Passwords do not match'
    )

    cy.getByTestID('input-field--password').clear().type('p1')

    cy.getByTestID('input-field--password-chk').clear().type('p1')

    // check password too short
    cy.getByTestID('form--element-error').should('contain.text', '8')

    cy.getByTestID('next')
      .should('be.disabled')
      .contains('CONTINUE', {matchCase: false})

    cy.get<string>('@defaultOrg').then((defaultOrg: string) => {
      cy.getByTestID('input-field--orgname').type(defaultOrg)
    })
    cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
      cy.getByTestID('input-field--bucketname').type(defaultBucket)

      cy.getByTestID('next')
        .should('be.disabled')
        .contains('CONTINUE', {matchCase: false})

      cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
        cy.getByTestID('input-field--password').clear().type(defaultPassword)
        cy.getByTestID('input-field--password-chk')
          .clear()
          .type(defaultPassword)
      })

      cy.getByTestID('input-error').should('not.exist')

      cy.getByTestID('next')
        .should('be.enabled')
        .contains('CONTINUE', {matchCase: false})

      // check cleared username
      cy.getByTestID('input-field--username').clear()

      cy.getByTestID('next')
        .should('be.disabled')
        .contains('CONTINUE', {matchCase: false})

      cy.get<string>('@defaultUser').then((defaultUser: string) => {
        cy.getByTestID('input-field--username').type(defaultUser)
      })

      cy.getByTestID('next')
        .should('be.enabled')
        .contains('CONTINUE', {matchCase: false})

      // check cleared password
      cy.getByTestID('input-field--password').clear()

      cy.getByTestID('form--element-error').should(
        'have.text',
        'Passwords do not match'
      )

      cy.getByTestID('next')
        .should('be.disabled')
        .contains('CONTINUE', {matchCase: false})

      cy.get<string>('@defaultPassword').then((defaultPassword: string) => {
        cy.getByTestID('input-field--password').clear().type(defaultPassword)

        cy.getByTestID('input-field--password-chk')
          .clear()
          .type(defaultPassword)
      })

      cy.getByTestID('next')
        .should('be.enabled')
        .contains('CONTINUE', {matchCase: false})

      // check cleared org name
      cy.getByTestID('input-field--orgname').clear()

      cy.getByTestID('next')
        .should('be.disabled')
        .contains('CONTINUE', {matchCase: false})

      cy.get<string>('@defaultOrg').then((defaultOrg: string) => {
        cy.getByTestID('input-field--orgname').type(defaultOrg)
      })

      cy.getByTestID('next')
        .should('be.enabled')
        .contains('CONTINUE', {matchCase: false})

      // check cleared bucket name
      cy.getByTestID('input-field--bucketname').clear()

      cy.getByTestID('next')
        .should('be.disabled')
        .contains('CONTINUE', {matchCase: false})

      cy.getByTestID('input-field--bucketname').type(defaultBucket)
    })

    cy.getByTestID('next')
      .should('be.enabled')
      .contains('CONTINUE', {matchCase: false})
  })
})
