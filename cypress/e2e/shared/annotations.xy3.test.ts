import {clearLocalStorage, setupData, testDeleteAnnotation, testEditAnnotation} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
    beforeEach(() => setupData(cy))
    afterEach(clearLocalStorage)

    it('can delete an annotation  for the xy line graph', () => {
        testDeleteAnnotation(cy)
    })
})