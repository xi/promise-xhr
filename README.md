# PromiseXHR

`XMLHttpRequest` wrapped in native ES6 Promises.

**Currently still under development.**

## Usage

For the ES6 module, use `./src/promise-xhr.js`. For ES5 use `./promise-xhr.js` or `./promise-xhr.min.js` along with a Promise polyfill like [jakearchibald/es6-promise](https://github.com/jakearchibald/es6-promise).

```js
xhr = require('promise-xhr')

// Methods always return a `Promise`
xhr.get('/foo').then(function(response) {
    console.log('Response:', response)
}, function(e) {
    console.log('Error:', e)
})

// Promise resolves JSON-decoded data
xhr.getJSON('/foo.json')

// POST request
xhr.post('/foo', 'foo=bar&baz=foo')

xhr({
    url: '/foo',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    },
    data: JSON.stringify({ foo: bar })
})
```

## TODO

 * Allow plain objects for POST data
 * Set Content-Type header for POST requests based on data type

# LICENSE

The MIT License (MIT)

Copyright (c) 2015 Joseph Wynn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
