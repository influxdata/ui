describe('Help bar menu sub nav links', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.visit('/')
  })

  it('checks if help bar InfluxDB documentation link is correct', () => {
    cy.getByTestID('tree-nav--sub-menu')
      .get('#documentation')
      .within(() => {
        cy.get('a').should($a => {
          expect($a.attr('href'), 'href').to.equal(
            'https://docs.influxdata.com/'
          )
        })
      })
  })

  it('checks if help bar InfluxDB FAQ link is correct', () => {
    cy.getByTestID('tree-nav--sub-menu')
      .get('#faqs')
      .within(() => {
        cy.get('a').should($a => {
          expect($a.attr('href'), 'href').to.equal(
            'https://docs.influxdata.com/influxdb/cloud/reference/faq/'
          )
        })
      })
  })

  it('checks if help bar InfluxDB official forum link is correct', () => {
    cy.getByTestID('tree-nav--sub-menu')
      .get('#offcialForum')
      .within(() => {
        cy.get('a').should($a => {
          expect($a.attr('href'), 'href').to.equal(
            'https://community.influxdata.com'
          )
        })
      })
  })

  it('checks if help bar InfluxDB slack link is correct', () => {
    cy.getByTestID('tree-nav--sub-menu')
      .get('#influxdbSlack')
      .within(() => {
        cy.get('a').should($a => {
          expect($a.attr('href'), 'href').to.equal(
            'https://influxcommunity.slack.com/join/shared_invite/zt-156zm7ult-LcIW2T4TwLYeS8rZbCP1mw#/shared-invite/email'
          )
        })
      })
  })

  it('checks if help bar InfluxDB University link is correct', () => {
    cy.getByTestID('tree-nav--sub-menu')
      .get('#influxUniversity')
      .within(() => {
        cy.get('a').should($a => {
          expect($a.attr('href'), 'href').to.equal(
            'https://university.influxdata.com/'
          )
        })
      })
  })
})
