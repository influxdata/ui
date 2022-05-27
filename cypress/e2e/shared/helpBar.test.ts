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

  it('can navigate to each page from left nav', () => {
    cy.window().then(win => {
      cy.stub(win, 'open').as('windowOpenSpy')
    })
    
    cy.getByTestID('nav-item-support').get('.cf-tree-nav--sub-menu-trigger').eq(3).trigger('mouseover')
    cy.getByTestID('nav-subitem-documentation').eq(1).click({force: true})
    cy.get('@windowOpenSpy').should(
        'be.calledWith',
        'https://github.com/influxdata/community-templates#templates'
      )
        

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

  
  
})

// help and support bar exists 

// the links in help and support route user to correct pages 

// user can successfully submit a feedback and questions from 

// if user is free account, we show the free account support overlay 

// if user is payg, we show the payg support overlay

// payg overlay has subject field, severity field, and description field

// mock the async function performing the POST request

// user can submit payg support successfully
