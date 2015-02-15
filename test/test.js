var xhr = PromiseXHR;

function readBlobAsText(blob) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader()
    reader.onload = function() {
      resolve(reader.result)
    }
    reader.onerror = function() {
      reject(reader.error)
    }
    reader.readAsText(blob)
  })
}

function readBlobAsBytes(blob) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader()
    reader.onload = function() {
      var view = new Uint8Array(reader.result)
      resolve(Array.prototype.slice.call(view))
    }
    reader.onerror = function() {
      reject(reader.error)
    }
    reader.readAsArrayBuffer(blob)
  })
}

test('resolves promise on 500 error', function() {
  return xhr('/boom').then(function(response) {
    assert.equal(response.status, 500)
    assert.equal(response.ok, false)
    return response
  }).then(function(body) {
    assert.equal(body, 'boom')
  })
})

test('rejects promise for network error', function() {
  return xhr('/error').then(function(response) {
    assert(false, 'HTTP status ' + response.status + ' was treated as success')
  }).catch(function(error) {
    assert(error instanceof TypeError, 'Rejected with Error')
  })
})

// https://fetch.spec.whatwg.org/#headers-class
suite('Headers', function() {
  test('headers are case insensitive', function() {
    var headers = new Headers({'Accept': 'application/json'})
    assert.equal(headers.get('ACCEPT'), 'application/json')
    assert.equal(headers.get('Accept'), 'application/json')
    assert.equal(headers.get('accept'), 'application/json')
  })
  test('appends to existing', function() {
    var headers = new Headers({'Accept': 'application/json'})
    assert.isFalse(headers.has('Content-Type'))
    headers.append('Content-Type', 'application/json')
    assert.isTrue(headers.has('Content-Type'))
    assert.equal(headers.get('Content-Type'), 'application/json')
  })
  test('appends values to existing header name', function() {
    var headers = new Headers({'Accept': 'application/json'})
    headers.append('Accept', 'text/plain')
    assert.equal(headers.getAll('Accept').length, 2)
    assert.equal(headers.getAll('Accept')[0], 'application/json')
    assert.equal(headers.getAll('Accept')[1], 'text/plain')
  })
  test('sets header name and value', function() {
    var headers = new Headers()
    headers.set('Content-Type', 'application/json')
    assert.equal(headers.get('Content-Type'), 'application/json')
  })
  test('returns null on no header found', function() {
    var headers = new Headers()
    assert.isNull(headers.get('Content-Type'))
  })
  test('has headers that are set', function() {
    var headers = new Headers()
    headers.set('Content-Type', 'application/json')
    assert.isTrue(headers.has('Content-Type'))
  })
  test('deletes headers', function() {
    var headers = new Headers()
    headers.set('Content-Type', 'application/json')
    assert.isTrue(headers.has('Content-Type'))
    headers.delete('Content-Type')
    assert.isFalse(headers.has('Content-Type'))
    assert.isNull(headers.get('Content-Type'))
  })
  test('returns list on getAll when header found', function() {
    var headers = new Headers({'Content-Type': 'application/json'})
    assert.isArray(headers.getAll('Content-Type'))
    assert.equal(headers.getAll('Content-Type').length, 1)
    assert.equal(headers.getAll('Content-Type')[0], 'application/json')
  })
  test('returns empty list on getAll when no header found', function() {
    var headers = new Headers()
    assert.isArray(headers.getAll('Content-Type'))
    assert.equal(headers.getAll('Content-Type').length, 0)
  })
  test('converts field name to string on set and get', function() {
    var headers = new Headers()
    headers.set(1, 'application/json')
    assert.equal(headers.get(1), 'application/json')
  })
  test('converts field value to string on set and get', function() {
    var headers = new Headers()
    headers.set('Content-Type', 1)
    assert.equal(headers.get('Content-Type'), '1')
  })
  test('throws TypeError on invalid character in field name', function() {
    assert.throws(function() { new Headers({'<Accept>': ['application/json']}) }, TypeError)
    assert.throws(function() { new Headers({'Accept:': ['application/json']}) }, TypeError)
    assert.throws(function() {
      var headers = new Headers();
      headers.set({field: 'value'}, 'application/json');
    }, TypeError)
  })
 })

// https://fetch.spec.whatwg.org/#request-class
suite('Request', function() {
  test('sends request headers', function() {
    return xhr('/request', {
      headers: {
        'Accept': 'application/json',
        'X-Test': '42'
      }
    }).then(function(response) {
      return response.json()
    }).then(function(json) {
      assert.equal(json.headers['accept'], 'application/json')
      assert.equal(json.headers['x-test'], '42')
    })
  })
})

suite('Response', function() {
  test('populates response body', function() {
    return xhr('/hello').then(function(response) {
      assert.equal(response.status, 200)
      assert.equal(response.ok, true)
      return response
    }).then(function(body) {
      assert.equal(body, 'hi')
    })
  })

  test('parses response headers', function() {
    return xhr('/headers?' + new Date().getTime()).then(function(response) {
      assert.equal(response.headers.get('Date'), 'Mon, 13 Oct 2014 21:02:27 GMT')
      assert.equal(response.headers.get('Content-Type'), 'text/html; charset=utf-8')
    })
  })
})

// https://fetch.spec.whatwg.org/#body-mixin
suite('Body mixin', function() {
  suite('arrayBuffer', function() {
    test('resolves arrayBuffer promise', function() {
      return xhr('/hello').then(function(response) {
        return response.arrayBuffer()
      }).then(function(buf) {
        assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
        assert.equal(buf.byteLength, 2)
      })
    })

    test('arrayBuffer handles binary data', function() {
      return xhr('/binary').then(function(response) {
        return response.arrayBuffer()
      }).then(function(buf) {
        assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
        assert.equal(buf.byteLength, 256, 'buf.byteLength is correct')
        var view = new Uint8Array(buf)
        for (var i = 0; i < 256; i++) {
          assert.equal(view[i], i)
        }
      })
    })

    test('arrayBuffer handles utf-8 data', function() {
      return xhr('/hello/utf8').then(function(response) {
        return response.arrayBuffer()
      }).then(function(buf) {
        assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
        assert.equal(buf.byteLength, 5, 'buf.byteLength is correct')
        var octets = Array.prototype.slice.call(new Uint8Array(buf))
        assert.deepEqual(octets, [104, 101, 108, 108, 111])
      })
    })

    test('arrayBuffer handles utf-16le data', function() {
      return xhr('/hello/utf16le').then(function(response) {
        return response.arrayBuffer()
      }).then(function(buf) {
        assert(buf instanceof ArrayBuffer, 'buf is an ArrayBuffer instance')
        assert.equal(buf.byteLength, 10, 'buf.byteLength is correct')
        var octets = Array.prototype.slice.call(new Uint8Array(buf))
        assert.deepEqual(octets, [104, 0, 101, 0, 108, 0, 108, 0, 111, 0])
      })
    })

    test('rejects arrayBuffer promise after body is consumed', function() {
      return xhr('/hello').then(function(response) {
        assert(response.arrayBuffer, 'Body does not implement arrayBuffer')
        assert.equal(response.bodyUsed, false)
        response.blob()
        assert.equal(response.bodyUsed, true)
        return response.arrayBuffer()
      }).catch(function(error) {
        assert(error instanceof TypeError, 'Promise rejected after body consumed')
      })
    })
  })

  suite('blob', function() {
    test('resolves blob promise', function() {
      return xhr('/hello').then(function(response) {
        return response.blob()
      }).then(function(blob) {
        assert(blob instanceof Blob, 'blob is a Blob instance')
        assert.equal(blob.size, 2)
      })
    })

    test('blob handles binary data', function() {
      return xhr('/binary').then(function(response) {
        return response.blob()
      }).then(function(blob) {
        assert(blob instanceof Blob, 'blob is a Blob instance')
        assert.equal(blob.size, 256, 'blob.size is correct')
      })
    })

    test('blob handles utf-8 data', function() {
      return xhr('/hello/utf8').then(function(response) {
        return response.blob()
      }).then(readBlobAsBytes).then(function(octets) {
        assert.equal(octets.length, 5, 'blob.size is correct')
        assert.deepEqual(octets, [104, 101, 108, 108, 111])
      })
    })

    test('blob handles utf-16le data', function() {
      return xhr('/hello/utf16le').then(function(response) {
        return response.blob()
      }).then(readBlobAsBytes).then(function(octets) {
        assert.equal(octets.length, 10, 'blob.size is correct')
        assert.deepEqual(octets, [104, 0, 101, 0, 108, 0, 108, 0, 111, 0])
      })
    })
  })

  suite('formData', function() {
    test('post sets content-type header', function() {
      return xhr('/request', {
        method: 'post',
        body: new FormData()
      }).then(function(response) {
        return response.json()
      }).then(function(json) {
        assert.equal(json.method, 'POST')
        assert(/^multipart\/form-data;/.test(json.headers['content-type']))
      })
    })

    test('rejects formData promise after body is consumed', function() {
      return xhr('/json').then(function(response) {
        assert(response.formData, 'Body does not implement formData')
        response.formData()
        return response.formData()
      }).catch(function(error) {
        assert(error instanceof TypeError, 'Promise rejected after body consumed')
      })
    })

    test('parses form encoded response', function() {
      return xhr('/form').then(function(response) {
        return response.formData()
      }).then(function(form) {
        assert(form instanceof FormData, 'Parsed a FormData object')
      })
    })
  })

  suite('json', function() {
    test('parses json response', function() {
      return xhr('/json').then(function(response) {
        return response.json()
      }).then(function(json) {
        assert.equal(json.name, 'Hubot')
        assert.equal(json.login, 'hubot')
      })
    })

    test('handles json parse error', function() {
      return xhr('/json-error').then(function(response) {
        return response.json()
      }).catch(function(error) {
        assert(error instanceof Error, 'JSON exception is an Error instance')
        assert(error.message, 'JSON exception has an error message')
      })
    })
  })

  suite('text', function() {
    test('handles 204 No Content response', function() {
      return xhr('/empty').then(function(response) {
        assert.equal(response.status, 204)
        return response
      }).then(function(body) {
        assert.equal(body, '')
      })
    })

    test('resolves text promise', function() {
      return xhr('/hello').then(function(response) {
        return response
      }).then(function(text) {
        assert.equal(text, 'hi')
      })
    })
  })
})

// https://fetch.spec.whatwg.org/#methods
suite('Methods', function() {
  test('supports HTTP GET', function() {
    return xhr('/request', {
      method: 'get',
    }).then(function(response) {
      return response.json()
    }).then(function(request) {
      assert.equal(request.method, 'GET')
      assert.equal(request.data, '')
    })
  })

  test('supports HTTP POST', function() {
    return xhr('/request', {
      method: 'post',
      body: 'name=Hubot'
    }).then(function(response) {
      return response.json()
    }).then(function(request) {
      assert.equal(request.method, 'POST')
      assert.equal(request.data, 'name=Hubot')
    })
  })

  test('supports HTTP PUT', function() {
    return xhr('/request', {
      method: 'put',
      body: 'name=Hubot'
    }).then(function(response) {
      return response.json()
    }).then(function(request) {
      assert.equal(request.method, 'PUT')
      assert.equal(request.data, 'name=Hubot')
    })
  })

  var patchSupported = !/PhantomJS/.test(navigator.userAgent)

  ;(patchSupported ? test : test.skip)('supports HTTP PATCH', function() {
    return xhr('/request', {
      method: 'PATCH',
      body: 'name=Hubot'
    }).then(function(response) {
      return response.json()
    }).then(function(request) {
      assert.equal(request.method, 'PATCH')
      assert.equal(request.data, 'name=Hubot')
    })
  })

  test('supports HTTP DELETE', function() {
    return xhr('/request', {
      method: 'delete',
    }).then(function(response) {
      return response.json()
    }).then(function(request) {
      assert.equal(request.method, 'DELETE')
      assert.equal(request.data, '')
    })
  })
})

// https://fetch.spec.whatwg.org/#atomic-http-redirect-handling
suite('Atomic HTTP redirect handling', function() {
  test('handles 301 redirect response', function() {
    return xhr('/redirect/301').then(function(response) {
      assert.equal(response.status, 200)
      assert.equal(response.ok, true)
      assert.match(response.url, /\/hello/)
      return response
    }).then(function(body) {
      assert.equal(body, 'hi')
    })
  })

  test('handles 302 redirect response', function() {
    return xhr('/redirect/302').then(function(response) {
      assert.equal(response.status, 200)
      assert.equal(response.ok, true)
      assert.match(response.url, /\/hello/)
      return response
    }).then(function(body) {
      assert.equal(body, 'hi')
    })
  })

  test('handles 303 redirect response', function() {
    return xhr('/redirect/303').then(function(response) {
      assert.equal(response.status, 200)
      assert.equal(response.ok, true)
      assert.match(response.url, /\/hello/)
      return response
    }).then(function(body) {
      assert.equal(body, 'hi')
    })
  })

  test('handles 307 redirect response', function() {
    return xhr('/redirect/307').then(function(response) {
      assert.equal(response.status, 200)
      assert.equal(response.ok, true)
      assert.match(response.url, /\/hello/)
      return response
    }).then(function(body) {
      assert.equal(body, 'hi')
    })
  })

  var permanentRedirectSupported = !/PhantomJS|Trident/.test(navigator.userAgent)

  ;(permanentRedirectSupported ? test : test.skip)('handles 308 redirect response', function() {
    return xhr('/redirect/308').then(function(response) {
      assert.equal(response.status, 200)
      assert.equal(response.ok, true)
      assert.match(response.url, /\/hello/)
      return response
    }).then(function(body) {
      assert.equal(body, 'hi')
    })
  })
})

// https://fetch.spec.whatwg.org/#concept-request-credentials-mode
suite('credentials mode', function() {
  setup(function() {
    return xhr('/cookie?name=foo&value=reset', {credentials: 'same-origin'});
  })

  suite('omit', function() {
    test('does not accept cookies with implicit omit credentials', function() {
      return xhr('/cookie?name=foo&value=bar').then(function() {
        return xhr('/cookie?name=foo', {credentials: 'same-origin'});
      }).then(function(response) {
        return response
      }).then(function(data) {
        assert.equal(data, 'reset')
      })
    })

    test('does not accept cookies with omit credentials', function() {
      return xhr('/cookie?name=foo&value=bar', {credentials: 'omit'}).then(function() {
        return xhr('/cookie?name=foo', {credentials: 'same-origin'});
      }).then(function(response) {
        return response
      }).then(function(data) {
        assert.equal(data, 'reset')
      })
    })

    test('does not send cookies with implicit omit credentials', function() {
      return xhr('/cookie?name=foo&value=bar', {credentials: 'same-origin'}).then(function() {
        return xhr('/cookie?name=foo');
      }).then(function(response) {
        return response
      }).then(function(data) {
        assert.equal(data, '')
      })
    })

    test('does not send cookies with omit credentials', function() {
      return xhr('/cookie?name=foo&value=bar').then(function() {
        return xhr('/cookie?name=foo', {credentials: 'omit'})
      }).then(function(response) {
        return response
      }).then(function(data) {
        assert.equal(data, '')
      })
    })
  })

  suite('same-origin', function() {
    test('send cookies with same-origin credentials', function() {
      return xhr('/cookie?name=foo&value=bar', {credentials: 'same-origin'}).then(function() {
        return xhr('/cookie?name=foo', {credentials: 'same-origin'})
      }).then(function(response) {
        return response
      }).then(function(data) {
        assert.equal(data, 'bar')
      })
    })
  })

  suite('include', function() {
    test('send cookies with include credentials', function() {
      return xhr('/cookie?name=foo&value=bar', {credentials: 'include'}).then(function() {
        return xhr('/cookie?name=foo', {credentials: 'include'})
      }).then(function(response) {
        return response
      }).then(function(data) {
        assert.equal(data, 'bar')
      })
    })
  })
})
