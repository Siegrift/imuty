/**
 * Returns an error message which will be printed on invalid path.
 *
 * @param {*} path
 * @returns {string} invalid path error message
 */
function getInvalidPathMessage(path) {
  return `Invalid path: '${path}'`
}

/**
 * Returns an error message which will be printed on invalid transformation.
 *
 * @param {*} transformation
 * @returns {string} invalid transformation error message
 */
function getInvalidTransformationMessage(transformation) {
  return `Invalid transformation: '${transformation}'`
}

/**
 * Returns an error message which will be printed when the value type differs from expected type.
 *
 * @param {*} value
 * @param {*} expectedType
 * @returns {string} invalid type error message
 */
function getInvalidTypeMessage(value, expectedType) {
  return `Expected type of '${value}' to be '${expectedType}', but it is ${typeof value}`
}

/**
 * Returns a shallow copy of the value passed.
 *
 * @param {*} value
 * @returns {*} - shallow copy of the value
 */
function shallowCopy(value) {
  if (Array.isArray(value)) return value.slice()
  if (typeof value === 'object') return Object.assign({}, value)
  return value
}

/**
 * Returns a value in the object on a specified path without checking argument correctness.
 *
 * @param {Object} object
 * @param {Array<number|string>} path
 * @param {*} defaultValue
 * @returns {*} value on the path or defaultValue
 */
function baseGet(object, path, defaultValue) {
  let returnObject = object
  let index = 0
  while (index < path.length) {
    if (
      !returnObject ||
      !returnObject.hasOwnProperty ||
      !returnObject.hasOwnProperty(path[index])
    ) {
      return defaultValue
    }
    returnObject = returnObject[path[index]]
    index += 1
  }
  return returnObject
}

/**
 * Sets the value on a given path in the object without checking argument correctness.
 *
 * @param {Object} object
 * @param {Array<number|string>} path
 * @param {*} value
 * @returns {Object} with the value set
 */
function baseSet(object, path, value) {
  if (path.length === 0) return value
  const returnObject = shallowCopy(object)
  let currentObject = returnObject
  let index = 0
  while (index < path.length) {
    if (
      !Array.isArray(currentObject[path[index]]) &&
      typeof currentObject[path[index]] !== 'object'
    ) {
      currentObject[path[index]] = {}
    }
    if (index === path.length - 1) currentObject[path[index]] = value
    else currentObject[path[index]] = shallowCopy(currentObject[path[index]])
    currentObject = currentObject[path[index]]
    index += 1
  }
  return returnObject
}

/**
 * Returns true if the argument is a valid path. (Path must be an array of string or numbers).
 *
 * @param {*} path
 * @returns {boolean}
 */
function isValidPath(path) {
  return (
    Array.isArray(path) &&
    !path.find((pathToken) => {
      const type = typeof pathToken
      return (type === '' || type !== 'string') && type !== 'number'
    })
  )
}

/**
 * Sets a value on a given path in the object. If one of the arguments is invalid an error is
 * thrown.
 *
 * @param {Object} object object in which the value should be set
 * @param {Array<number|string>} path path in the object where to set the value
 * @param {*} value value to be set
 * @returns {Object} with the value set
 */
function setIn(object, path, value) {
  if (typeof object !== 'object') {
    throw new Error(getInvalidTypeMessage(object, 'object'))
  }
  if (!isValidPath(path)) throw new Error(getInvalidPathMessage(path))
  return baseSet(object, path, value)
}

/**
 * Returns a value found in an object on a given path. If there is no value on the path returns
 * defaultValue instead. If the path is not a valid path object, an error is thrown.
 *
 * @param {Object} object object from which to get the value
 * @param {Array<number|string>} path path to the value in the object
 * @param {*} defaultValue value to be returned if the path is not part of the object
 * @returns {*} value on the path or defaultValue
 */
function getIn(object, path, defaultValue) {
  if (!isValidPath(path)) throw new Error(getInvalidPathMessage(path))
  return baseGet(object, path, defaultValue)
}

/**
 * Allows you to specify multiple object transformations at once. Each transformation must be a two
 * element array, where the first element is the path of the transformation and the second is the
 * value of the transformation.
 *
 * Transformations are applied from left to right.
 *
 * @param {Object} object object in which the transformation should be applied
 * @param {...[Array<number|string>, *]} transforms transformations to be applied
 * @returns {Object} with all transformations applied
 */
function multiSetIn(object, ...transforms) {
  let changed = object
  for (const transform of transforms) {
    if (transform.length !== 2) throw new Error(getInvalidTransformationMessage(transform))
    if (!isValidPath(transform[0])) throw new Error(getInvalidPathMessage(transform[0]))
    changed = baseSet(changed, transform[0], transform[1])
  }
  return changed
}

/**
 * Returns true if the path exists in given object.
 *
 * @param {Object} object
 * @param {Array<number|string>} path
 * @returns {boolean}
 */
function pathExists(object, path) {
  if (!isValidPath(path)) throw new Error(getInvalidPathMessage(path))
  let obj = object
  let index = -1
  while (++index < path.length) {
    if (!obj.hasOwnProperty(path[index])) return false
    obj = obj[path[index]]
  }
  return true
}

/**
 * Filters an object by the paths provided.
 *
 * @param {Object} object
 * @param {Array<Array<number|string>>} paths
 * @returns {Object} with filtered properties from the object
 */
function filterObject(object, ...paths) {
  return paths.reduce((acc, path) => {
    if (!pathExists(object, path)) return acc
    return baseSet(acc, path, baseGet(object, path, null))
  }, {})
}

/**
 * Merges the path of the object found on a given path with the properties of value object.
 *
 * @param {Object} object
 * @param {Array<number|string>} path
 * @param {*} value
 * @returns {Object} that is merged with the value on a given path
 */
function mergeIn(object, path, value) {
  if (!isValidPath(path)) throw new Error(getInvalidPathMessage(path))
  if (typeof value !== 'object') throw new Error(getInvalidTypeMessage(value, 'object'))
  const obj = shallowCopy(baseGet(object, path, undefined))
  Object.keys(value).forEach((key) => {
    obj[key] = value[key]
  })
  return baseSet(object, path, obj)
}

module.exports = {
  setIn,
  multiSetIn,
  getIn,
  isValidPath,
  filterObject,
  pathExists,
  mergeIn,
}
