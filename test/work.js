function request(method, url, data, callback, failed) {
  let xhr = new XMLHttpRequest()
  xhr.open(method, url, true)
  xhr.onreadystatechange = () => {
    try {
      if (!xhr) {
        return
      }
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          let res = JSON.parse(xhr.responseText)
          callback && callback(res)
        } else {
          failed && failed(xhr.status)
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
  xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8')
  if (method.toLowerCase() === 'get') {
    xhr.send(null)
  }
  if (method.toLowerCase() === 'post') {
    let p = JSON.stringify(data)
    xhr.send(p)
  }
}
addEventListener('message', function(e) {
  let data = e.data || {}
  request('post', `${data.url}?d=${Math.random()}`, data)
})
