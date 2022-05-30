describe('Help bar menu', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.visit('/')
    cy.setFeatureFlags({
        helpBar: true
    })
  })

  it('can navigate to Help Bar sub nav items ', () => {
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')

    cy.getByTestID('nav-subitem-documentation').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })
     
    cy.getByTestID('nav-subitem-faqs').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })

    cy.getByTestID('nav-subitem-forum').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })

    cy.getByTestID('nav-subitem-influxdb-slack').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })
  })

  it('can submit feedback and questions form', () => {
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')
    cy.getByTestID('nav-subitem-feedback-questions').eq(0).click({force: true})

    cy.getByTestID('feedback-questions-overlay-header').should('be.visible')

    cy.getByTestID('overlay--container').within(() => {
    cy.getByTestID('support-description--textarea').type('here is some feedback and questions from a cloud customer')

      cy.getByTestID('feedback-questions-overlay--submit').click()
    })

    cy.getByTestID('confirmation-overlay-header').should('be.visible')
    cy.getByTestID('confirmation-overlay-header').contains('Feedback & Questions')
    cy.getByTestID('confirmation-overlay--OK').click()
    cy.getByTestID('confirmation-overlay-header').should('not.exist')
  })
})

describe('Help bar support for free users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.setFeatureFlags({
            helpBar: true,
          }).then(() => {
            cy.quartzProvision({
              accountType: 'free'
            }).then(() => {
              cy.visit('/')
              cy.getByTestID('nav-item-support').should('be.visible')
            })
          })
        })
      })
    )
  )
  it('displays important links free users can use to seek help', () => {
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')
    cy.getByTestID('nav-subitem-contact-support').eq(1).click({force: true})
    cy.getByTestID('free-support-overlay-header').should('exist')
  
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('free-account-links').eq(0).contains('InfluxDB Community Forums')
      cy.getByTestID('free-account-links').eq(0).contains('InfluxDB Slack')
      cy.getByTestID('free-account-links').eq(0).contains('Feedback & Questions Form')
      })
  })
})

describe('Help bar support for PAYG users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.setFeatureFlags({
            helpBar: true,
          }).then(() => {
            cy.quartzProvision({
              accountType: 'pay_as_you_go',
            }).then(() => {
              cy.visit('/')
              cy.getByTestID('nav-item-support').should('be.visible')
            })
          })
        })
      })
    )
  )

  it('Allows PAYG users to submit a support request', () => {
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')
    cy.getByTestID('nav-subitem-contact-support').eq(1).click({force: true})
    cy.getByTestID('payg-support-overlay-header')
      .should('exist')

    cy.getByTestID('contact-support-subject-input').clear().type('testing help bar')
    cy.getByTestID('severity-level-dropdown').click()
    cy.getByTitle('1 - Critical').click()

    cy.getByTestID('support-description--textarea').clear().type('here is a description from user about something they need help with')
    cy.getByTestID('payg-contact-support--submit').click()

    cy.getByTestID('confirmation-overlay-header').should('exist')
  })
})

// help and support bar exists 

// the links in help and support route user to correct pages 

// user can successfully submit a feedback and questions from 

// if user is free account, we show the free account support overlay 

// if user is payg, we show the payg support overlay

// payg overlay has subject field, severity field, and description field

// mock the async function performing the POST request

// user can submit payg support successfully
