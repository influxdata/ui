import {
    addRangeAnnotation,
    checkAnnotationText,
    clearLocalStorage,
    setupData,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
    beforeEach(() => setupData(cy))
    afterEach(clearLocalStorage)

    it('can add a range annotation for the xy line graph', () => {
        addRangeAnnotation(cy)
        checkAnnotationText(cy, 'range annotation here!')
    })

})