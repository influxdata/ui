const typeStrings = ['timestamp', 'tag', 'field']
const dataTypeStrings = ['integer', 'float', 'boolean', 'string', 'unsigned']

/**
 * manually checking that the literal string union types are correct
 *
 * our types are generated, and changing it so there is an exported array that is *then* used
 * for literal union type creation is out of scope.
 * https://newbedev.com/checking-validity-of-string-literal-union-type-at-runtime
 *
 * right now, just checking true/false; is it valid?  later on, may add a message saying which part(s) are invalid
 * */
export const areColumnsKosher = columns => {
  if (Array.isArray(columns)) {
    const validArray = columns.map(item => {
      // for each item, does it have the necessary stuff?
      const hasName = 'name' in item && typeof item.name === 'string'
      const hasType = 'type' in item && typeStrings.includes(item.type)

      // the semi-optional part: if it isn't there; it is fine; but if it is check it!
      // BUT, if the type is 'field' it is required!
      let dataTypePartIsValid = true

      if ('dataType' in item) {
        dataTypePartIsValid = dataTypeStrings.includes(item.dataType)
      } else {
        // not there:
        if (item.type === 'field') {
          dataTypePartIsValid = false
        }
      }
      return hasName && hasType && dataTypePartIsValid
    })

    return validArray.reduce((prevVal, curVal) => prevVal && curVal, true)
  }
  return false
}


