// TODO: throw error instead of silent fail
// TODO: documentation
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
  if (path.length === 0) return value
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

function multiSetIn(object, ...transforms) {
  let changed = object
  for (const transform of transforms) {
    if (!isValidPath(transform[0])) return object
    changed = baseSet(changed, transform[0], transform[1], 0)
  }
  return changed
}

function pathExists(object, path) {
  if (!isValidPath(path)) return false
  let obj = object
  let index = -1
  while (++index < path.length) {
    if (!obj.hasOwnProperty(path[index])) return false
    obj = obj[path[index]]
  }
  return true
}

function filterObject(object, ...paths) {
  return paths.reduce((acc, path) => {
    if (!pathExists(object, path)) return acc
    return baseSet(acc, path, baseGet(object, path, null, 0), 0)
  }, {})
}

function mergeIn(object, path, value) {
  if (!isValidPath(path)) throw new Error('Invalid path!')
  if (typeof value !== 'object') throw new Error('Merge value is not an object!')
  const obj = { ...baseGet(object, path, undefined, 0) }
  Object.keys(value).forEach((key) => {
    obj[key] = value[key]
  })
  return baseSet(object, path, obj, 0)
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
