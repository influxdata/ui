import {Organization} from '../../../src/types'

// a generous commitment to delivering this page in a loaded state
const PAGE_LOAD_SLA = 80000

describe('Collectors', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs, telegrafs}) => {
        cy.visit(`${orgs}/${id}${telegrafs}`)
        cy.getByTestID('tree-nav')
        cy.get('[data-testid="resource-list--body"]', {
          timeout: PAGE_LOAD_SLA,
        })
      })
    )
  })

  describe('from the org view', () => {
    it('can create a telegraf config', () => {
      cy.getByTestID('table-row').should('have.length', 0)
      cy.contains('Create Configuration').click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('telegraf-plugins--Aerospike').click()
      })
    })

    it('allows the user to view just the output', () => {
      const bucketz = ['MO_buckets', 'EZ_buckets', 'Bucky']
      const [firstBucket, secondBucket, thirdBucket] = bucketz

      cy.get<Organization>('@org').then(({id, name}: Organization) => {
        cy.createBucket(id, name, firstBucket)
        cy.createBucket(id, name, secondBucket)
        cy.createBucket(id, name, thirdBucket)
      })

      cy.reload()
      cy.get('[data-testid="resource-list--body"]', {timeout: PAGE_LOAD_SLA})

      cy.getByTestID('button--output-only').click()
      cy.getByTestID('overlay--container')
        .should('be.visible')
        .within(() => {
          const buckets = bucketz.slice(0).sort((a, b) => {
            const _a = a.toLowerCase()
            const _b = b.toLowerCase()

            if (_a > _b) {
              return 1
            }

            if (_a < _b) {
              return -1
            }

            return 0
          })

          cy.get('code').should($el => {
            const text = $el.text()

            expect(text.includes('[[outputs.influxdb_v2]]')).to.be.true
            // expect a default sort to be applied
            expect(text.includes(`bucket = "${buckets[0]}"`)).to.be.true
          })

          cy.getByTestID('bucket-dropdown').within(() => {
            cy.getByTestID('bucket-dropdown--button').click()
            cy.getByTestID('dropdown-item').eq(2).click()
          })

          cy.get('code').should($el => {
            const text = $el.text()

            // NOTE: this index is off because there is a default
            // defbuck bucket in there (alex)
            expect(text.includes(`bucket = "${buckets[1]}"`)).to.be.true
          })
        })
    })

    describe('when a config already exists', () => {
      beforeEach(() => {
        const telegrafConfigName = 'New Config'
        const description = 'Config Description'
        cy.get('@org').then(({id}: Organization) => {
          cy.get<string>('@defaultBucket').then((defaultBucket: string) => {
            cy.createTelegraf(
              telegrafConfigName,
              description,
              id,
              defaultBucket
            )
          })
        })

        cy.reload()
        cy.get('[data-testid="resource-list--body"]', {timeout: PAGE_LOAD_SLA})
      })

      it('can update configuration name', () => {
        const newConfigName = 'This is new name'

        cy.getByTestID('collector-card--name').first().trigger('mouseover')
        cy.getByTestID('collector-card--name-button').first().click()
        cy.getByTestID('collector-card--input')
          .type(newConfigName)
          .type('{enter}')
        cy.getByTestID('collector-card--name').should('contain', newConfigName)

        cy.getByTestID('resource-card').should('have.length', 1)
      })

      it('can view setup instructions & config text', () => {
        cy.getByTestID('resource-card').should('have.length', 1)

        cy.getByTestID('setup-instructions-link').click()

        cy.getByTestID('setup-instructions').should('exist')

        cy.getByTestID('overlay--header').find('button').click()

        cy.getByTestID('setup-instructions').should('not.exist')

        cy.getByTestID('collector-card--name').click()

        cy.getByTestID('toml-editor').should('exist')
      })

      it('can delete a label from config', () => {
        cy.getByTestID('resource-card').should('have.length', 1)

        cy.getByTestID('inline-labels--add').click()
        cy.getByTestID('inline-labels--popover-field').type('zoe')
        cy.getByTestID('inline-labels--create-new').click()
        cy.getByTestID('overlay--container').should('exist')
        cy.getByTestID('create-label-form--submit').click()
        cy.getByTestID('label--pill zoe').should('exist')
        cy.getByTestID('label--pill--delete zoe').click({force: true})

        cy.getByTestID('inline-labels--empty').should('exist')
      })

      it('can delete a config', () => {
        cy.getByTestID('resource-card').should('have.length', 1)
        cy.getByTestID('context-delete-menu--button').click({force: true})
        cy.getByTestID('context-delete-menu--confirm-button').click()
        cy.getByTestID('empty-state').should('exist')
      })

      it('can clone a config', () => {
        const firstLabel = 'test_label_1'
        const secondLabel = 'test_label_2'

        cy.getByTestID('resource-card').should('have.length', 1)

        // create two labels
        cy.get('button.cf-button[title="Add labels"]').click()
        cy.getByTestID('inline-labels--popover--dialog').should('be.visible')
        cy.getByTestID('inline-labels--popover-field').type(
          `${firstLabel}{enter}`
        )
        cy.getByTestID('overlay--container').should('be.visible')
        cy.getByTestID('create-label-form--submit').click()

        cy.getByTestID('overlay--container').should('not.exist')
        cy.get('button.cf-button[title="Add labels"]').click()
        cy.getByTestID('inline-labels--popover--dialog').should('be.visible')
        cy.getByTestID('inline-labels--popover-field').type(
          `${secondLabel}{enter}`
        )
        cy.getByTestID('overlay--container').should('be.visible')
        cy.getByTestID('create-label-form--submit').click()

        // ensure the two labels are present before cloning
        cy.getByTestID('overlay--container').should('not.exist')
        cy.getByTestID(`label--pill ${firstLabel}`).should('be.visible')
        cy.getByTestID(`label--pill ${secondLabel}`).should('be.visible')

        // clone the telegraf
        const cloneNamePrefix = `New Config (cloned at `
        cy.getByTestID('context-menu-telegraf').click()
        cy.getByTestID('context-clone-telegraf').click()
        cy.getByTestID(`label--pill ${firstLabel}`).should('have.length', 2)
        cy.getByTestID(`label--pill ${secondLabel}`).should('have.length', 2)
        cy.getByTestID('resource-card').should('have.length', 2)
        cy.getByTestID('collector-card--name')
          .last()
          .then(cloneNameElement => {
            const cloneName = cloneNameElement.text()
            const cloneTime = cloneName.slice(
              cloneNamePrefix.length,
              cloneName.length - 1
            )
            const cloneTimeAsDate = new Date(cloneTime)
            expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
            expect(cloneTimeAsDate.valueOf()).to.equal(
              cloneTimeAsDate.valueOf()
            )
          })
      })
    })

    describe('sorting & filtering', () => {
      const telegrafs = ['bad', 'apple', 'cookie']
      const bucketz = ['MO_buckets', 'EZ_buckets', 'Bucky']
      const [firstTelegraf, secondTelegraf, thirdTelegraf] = telegrafs

      beforeEach(() => {
        const description = 'Config Description'
        const [firstBucket, secondBucket, thirdBucket] = bucketz
        cy.get('@org').then(({id}: Organization) => {
          cy.createTelegraf(firstTelegraf, description, id, firstBucket)
          cy.createTelegraf(secondTelegraf, description, id, secondBucket)
          cy.createTelegraf(thirdTelegraf, description, id, thirdBucket)
        })
        cy.reload()
        cy.get('[data-testid="resource-list--body"]', {timeout: PAGE_LOAD_SLA})
      })

      it('can filter telegraf configs and sort by name', () => {
        // fixes https://github.com/influxdata/influxdb/issues/15246
        cy.getByTestID('search-widget').type(firstTelegraf)
        cy.getByTestID('resource-card').should('have.length', 1)
        cy.getByTestID('resource-card').should('contain', firstTelegraf)

        cy.getByTestID('search-widget').clear().type(secondTelegraf)
        cy.getByTestID('resource-card').should('have.length', 1)
        cy.getByTestID('resource-card').should('contain', secondTelegraf)

        cy.getByTestID('search-widget').clear().type(thirdTelegraf)
        cy.getByTestID('resource-card').should('have.length', 1)
        cy.getByTestID('resource-card').should('contain', thirdTelegraf)

        cy.getByTestID('search-widget').clear().type('should have no results')
        cy.getByTestID('resource-card').should('have.length', 0)
        cy.getByTestID('empty-state').should('exist')

        cy.getByTestID('search-widget').clear().type('a')
        cy.getByTestID('resource-card').should('have.length', 2)
        cy.getByTestID('resource-card').should('contain', firstTelegraf)
        cy.getByTestID('resource-card').should('contain', secondTelegraf)
        cy.getByTestID('resource-card').should('not.contain', thirdTelegraf)

        // sort by buckets test here
        cy.reload() // clear out filtering state from the previous test
        cy.get('[data-testid="resource-list--body"]', {timeout: PAGE_LOAD_SLA})

        cy.getByTestID('collector-card--name').should('have.length', 3)

        // test to see if telegrafs are initially sorted by name
        telegrafs.sort()

        cy.wait(0).then(() => {
          // NOTE: this then is just here to let me scope this variable (alex)
          const teletubbies = telegrafs.slice(0).sort()
          cy.getByTestID('collector-card--name').each((val, index) => {
            expect(val.text()).to.include(teletubbies[index])
          })
        })

        cy.getByTestID('resource-sorter--button').click()
        cy.getByTestID('resource-sorter--name-desc')
          .click()
          .then(() => {
            // NOTE: this then is just here to let me scope this variable (alex)
            const teletubbies = telegrafs.slice(0).sort().reverse()
            cy.getByTestID('collector-card--name').each((val, index) => {
              expect(val.text()).to.include(teletubbies[index])
            })
          })
      })
    })
  })

  describe('Label creation and searching', () => {
    beforeEach(() => {
      const description = 'Config Description'
      cy.get('@org').then(({id}: Organization) => {
        cy.createTelegraf('newteleg', description, id, 'newbucket')
      })
      cy.reload()
    })

    it('Can add label', () => {
      cy.getByTestID('inline-labels--add').click()
      cy.getByTestID('inline-labels--popover-field').type('zoe')
      cy.getByTestID('inline-labels--create-new').click()
      cy.getByTestID('overlay--container').should('exist')
      cy.getByTestID('create-label-form--submit').click()
      cy.getByTestID('label--pill zoe').should('exist')
      // search by label
      cy.getByTestID('search-widget').should('be.visible').clear().type('zoe')

      cy.getByTestID('resource-card').should('have.length', 1)
      cy.getByTestID('resource-card').should('contain', 'newteleg')
    })
  })
})
