const LocalStoreKey = '__perf_monitor__'

export function getLocalStore (): Mt.IPerformance[] {
  if (!localStorage) {
    return []
  }
  let res = localStorage.getItem(LocalStoreKey)
  if (!res) {
    return []
  }
  let items: Mt.IPerformance[]
  try {
    items = JSON.parse(res)
  } catch (error) {
    items = []
  }
  return items
}

export function setLocalStore (
  item: Mt.IPerformance,
  count: number
): Mt.IPerformance[] {
  if (!localStorage) {
    return []
  }
  let items = getLocalStore()
  if (!items) {
    items = []
  }
  if (items.length >= count) {
    items.splice(0, 1)
  }
  items.push(item)
  localStorage.setItem(LocalStoreKey, JSON.stringify(items))
  return items
}
