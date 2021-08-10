describe('range annotations', () => {
  it('cannot create an annotation when graph is clicked and the control bar is closed', () => {
    // switch off the control bar
    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('not.exist')

    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
    })

    cy.getByTestID('overlay--container').should('not.exist')
  })
})
