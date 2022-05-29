import {Organization} from '../../../src/types'

describe('navigation', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.visit('/')
    cy.setFeatureFlags({
        helpBar: true
    })
    
  })

  it('can navigate to Help Bar sub nav items ', () => {

    // cy.getByTestID('nav-tree').should('be.visible')
    
    // cy.window().then(win => {
    //   cy.stub(win, 'open').as('windowOpenSpy')
    // })
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')
    // cy.getByTestID('nav-subitem-documentation').eq(1).click({force: true})

    // checks if documentation link is live
    cy.getByTestID('nav-subitem-documentation').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })
    // checks if faq link is live 
    cy.getByTestID('nav-subitem-faqs').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })

    // checks if forum link is live
    cy.getByTestID('nav-subitem-forum').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })

    // checks if slack link is live
    cy.getByTestID('nav-subitem-influxdb-slack').should('exist').then(link => {
      cy.request(link.prop('href'))
      .its('status')
      .should('eq', 200)
    })

      // cy.get('@windowOpenSpy').should(
      //     'have.been.calledOnceWithExactly',
      //     'https://docs.influxdata.com/'
      //   )
    
        

            // cy.get('.cf-tree-nav--sub-menu-trigger').trigger('mouseover')
        
        // cy.get('cf-tree-nav--sub-menu-trigger').trigger('mouseover')
            // cy.getByTestID('nav-subitem-documentation').click()

        

            // cy.get('.tree-nav--sub-menu').click()
        
        // cy.getByTestID('nav-item-load-data').click({force: true})
        
        // cy.getByTestID('documentation').click()
        // cy.get('@windowOpenSpy').should(
        //   'be.calledWith',
        //   'https://docs.influxdata.com/'
        // )
    


  })

  it.only('can submit feedback and questions form', () => {
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')
    cy.getByTestID('nav-subitem-feedback-questions').eq(0).click({force: true})

    cy.getByTestID('feedback-questions-overlay-header').should('be.visible')

    cy.getByTestID('overlay--container').within(() => {
    cy.getByTestID('support-description--textarea').type('here is some feedback and questions from a cloud customer')

      // cy.getByTestID('feedback-questions-overlay--submit').click()
    })

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
