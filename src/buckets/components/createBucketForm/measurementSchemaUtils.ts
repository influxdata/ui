import {DownloadTypes} from './MiniFileDnd'

const typeStrings = ['timestamp', 'tag', 'field']
const dataTypeStrings = ['integer', 'float', 'boolean', 'string', 'unsigned']

/**
 * manually checking that the literal string union types are correct
 *
 * our types are generated, and changing it so there is an exported array that is *then* used
 * for literal union type creation is out of scope.
 * https://newbedev.com/checking-validity-of-string-literal-union-type-at-runtime
 * (in order to reuse the string arrays, the literal union types need to be generated differently.
 * so just retyping the string arrays)
 *
 * right now, just checking true/false; is it valid?  later on, may add a message saying which part(s) are invalid
 *
 * The backend checks for uniqueness among the schema names and among the column names within each schema.
 * it gives us a relevant error message if the uniqueness fails.
 *
 * The backend also checks if the columns themselves are proper, there must be at least two columns:
 *   1) a time field of time 'timestamp'
 *   2) a field with type 'field'
 *
 *   not checking for those at this time on the frontend, letting the backend do the checking;
 *   the code propagates up the error messages to show the user.
 * */
export const areColumnsProper = columns => {
  if (Array.isArray(columns)) {
    return columns.every(item => {
      // for each item, does it have the necessary stuff?
      const hasName = 'name' in item && typeof item.name === 'string'

      if (!hasName) {
        return false
      }

      const hasType = 'type' in item && typeStrings.includes(item.type)
      if (!hasType) {
        return false
      }

      // the semi-optional part: if it isn't there; it is fine; but if it is check it!
      // BUT, if the type is 'field' it is required!

      if ('dataType' in item) {
        return dataTypeStrings.includes(item.dataType)
      } else {
        // not there:
        if (item.type === 'field') {
          return false
        }
      }

      // got to here, nothing was triggered or returned false; so return true:
      return true
    })
  }
  return false
}

export const START_ERROR = "cannot start with '_' or a number"
export const TOO_LONG_ERROR = 'too long, max length is 128 characters'

/**
 *  is the name valid?
 *
 *  this does NOT check if the name has content/ if it is empty.
 *
 *  this is about validating the name *after* the user has entered data
 * */
export const isNameValid = (name = '') => {
  name = name.trim()

  // ok; it has contents:
  const illegalStartRegex = /^[0-9]/

  if (name.startsWith('_') || illegalStartRegex.test(name)) {
    return {valid: false, message: START_ERROR}
  }
  if (name.length > 128) {
    return {valid: false, message: TOO_LONG_ERROR}
  }
  return {valid: true, message: null}
}

export const areNewSchemasValid = newMeasurementSchemaRequests => {
  const haveSchemas =
    Array.isArray(newMeasurementSchemaRequests) &&
    newMeasurementSchemaRequests.length

  if (!haveSchemas) {
    // no schemas, nothing to validate, so everything is fine
    // even if it is in explicit mode, can add schemas later
    return true
  }
  // if so, are they all valid?
  return newMeasurementSchemaRequests.every(schema => schema.valid)
}

export const areSchemaUpdatesValid = schemaInfo => {
  const haveUpdates = Array.isArray(schemaInfo) && schemaInfo.length

  if (!haveUpdates) {
    // no updates, nothing to validate, everything is fine
    return true
  }
  return schemaInfo.every(
    schemaInfo =>
      !schemaInfo.hasUpdate || (schemaInfo.hasUpdate && schemaInfo.valid)
  )
}

// the MiniFileDnd component will catch any errors thrown here
// and display them to the user; as this method is only called from within
// the 'handleFileUpload' that is passed to and called by the MiniFileDnd Component.
export const getColumnsFromFile = (
  contents: string,
  fileType: DownloadTypes
) => {
  // do parsing here;  to check if in the correct format:
  let columns = null
  if (contents) {
    if (fileType === 'csv') {
      columns = csvToObjectArray(contents)
    } else {
      // it's json:

      // parse them; if proper/valid; great!  if not, set errors and do not proceed
      // don't need to wrap this in try/catch since the caller of this function is inside a try/catch
      columns = JSON.parse(contents)
    }
    if (!areColumnsProper(columns)) {
      // set errors
      throw {message: 'column file is not formatted correctly'}
    }
  }
  return columns
}
/**
 * take a csv file, as a string, and turn it into an array of javascript objects.
 *
 * based off: https://sebhastian.com/javascript-csv-to-array/
 * if the value isn't present, then it isn't put into the object.
 * all strings are trimmed as well.
 */
export const csvToObjectArray = (contents: string, delimiter = ',') => {
  const headers = contents.slice(0, contents.indexOf('\n')).split(delimiter)

  // check that the headers are correct; if not throw an exception:
  if (
    headers[0] !== 'name' ||
    headers[1] !== 'type' ||
    headers[2] !== 'dataType'
  ) {
    throw {
      message:
        'csv headers are not correct; they need to be : "name, type, dataType"',
    }
  }

  const rows = contents.slice(contents.indexOf('\n') + 1).split('\n')

  return rows.map(function (row) {
    const values = row.split(delimiter)

    return headers.reduce(function (object, header, index) {
      const val = values[index]
      if (val) {
        object[header] = val.trim()
      }
      return object
    }, {})
  })
}

export const toCsvString = columns => {
  return [
    ['name', 'type', 'dataType'],
    ...columns.map(schemaLine => {
      const line = [schemaLine.name, schemaLine.type]
      if (schemaLine.dataType) {
        line.push(schemaLine.dataType)
      } else {
        // putting in an empty entry, to get the trailing comma if there are only two entries
        // this make the line be: ' host,tag,' as opposed to : ' host,tag'
        line.push('')
      }
      return line
    }),
  ]
    .map(lineItem => lineItem.join(','))
    .join('\n')
}
