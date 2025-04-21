/**
 * @param {{action: string, data: any}} args
 * @returns {Promise<[string | null, any]>}
 */
(args) => {
  const { action, data } = args
  if (!window.origin && action === 'clearMarks') {
    [null, {}]
  }

  function genActionId() {
    const base62chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    const toBase62 = (num) => {
      let result = ''
      do {
        result = base62chars[num % 62] + result
        num = Math.floor(num / 62)
      } while (num > 0)
      return result
    }

    const timestamp = toBase62(Date.now())
    const randomPart = Array.from(
      { length: 3 },
      () => base62chars[Math.floor(Math.random() * 62)]
    ).join('')

    return timestamp + randomPart
  }

  const actionId = genActionId()

  const timeoutMs = 5000

  return new Promise((resolve, reject) => {
    const onMessage = (event) => {
      const res = event.data
      if (res.type === '__agentActionResult__' && res.actionId === actionId) {
        window.removeEventListener('message', onMessage)
        clearTimeout(timeoutId)
        if (res.error) {
          resolve([res.error, null])
        } else {
          resolve([null, res])
        }
      }
    }

    // handle timeout
    const timeoutId = setTimeout(() => {
      window.removeEventListener('message', onMessage)
      resolve(['Operation timed out', null])
    }, timeoutMs)

    window.addEventListener('message', onMessage)

    if (window.origin === 'null') {
      window.postMessage({
        type: '__agentAction__',
        actionId,
        action,
        ...data
      })
    } else {
      window.postMessage({
        type: '__agentAction__',
        actionId,
        action,
        ...data
      }, window.origin)
    }
  })
}