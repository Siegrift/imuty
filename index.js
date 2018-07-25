function shallowCopy(value) {
  if (Array.isArray(value)) return value.slice()
  if (typeof value === 'object') return Object.assign({}, value)
  return value
}

function baseGet(object, path, defaultValue, index) {
  let returnObject = object
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

function baseSet(object, path, value, index) {
  const returnObject = shallowCopy(object)
  let currentObject = returnObject
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

function isValidPath(path) {
  return (
    Array.isArray(path) &&
    !path.find((pathToken) => {
      const type = typeof pathToken
      return (type === '' || type !== 'string') && type !== 'number'
    })
  )
}

function setIn(object, path, value) {
  if (!isValidPath(path) || typeof object !== 'object') return object
  return baseSet(object, path, value, 0)
}

function getIn(object, path, defaultValue) {
  if (!isValidPath(path)) return defaultValue
  return baseGet(object, path, defaultValue, 0)
}

module.exports = {
  setIn,
  getIn,
  isValidPath,
}
