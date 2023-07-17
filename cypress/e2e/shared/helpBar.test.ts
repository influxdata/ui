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
          expect($a.attr('href'), 'href').to.be.oneOf([
            'https://docs.influxdata.com/',
            'https://docs.influxdata.com/influxdb/cloud-iox/',
          ])
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
            'https://www.influxdata.com/slack'
          )
        })
      })
  })
})
