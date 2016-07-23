/**
 * Send an HTTP request
 *
 * Options:
 *     url     (string) the URL to open
 *     method  (string) request method
 *     headers (object) request headers
 *     data    (mixed)  request data
 */
function xhr(options) {
    let req = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
        req.onreadystatechange = (e) => {
            if (req.readyState !== 4) {
                return
            }

            if (req.status >= 400) {
                reject(e)
            } else {
                resolve(e.target.response)
            }
        }

        Object.keys(options.headers || {}).forEach(function (key) {
            req.setRequestHeader(key, options.headers[key])
        })

        req.open(options.method, options.url, true)
        req.send(options.data)
    })
}

/**
 * Send a GET HTTP request
 *
 * @param  {string} url
 * @return {Promise}
 */
xhr.get = function(url) {
    return xhr({ method: 'GET', url })
}

/**
 * Send a GET HTTP request, returning a JSON-decoded response
 *
 * @param  {string} url
 * @return {Promise}
 */
xhr.getJSON = function(url) {
    return xhr.get(url).then((response) => {
        return JSON.parse(response)
    })
}

/**
 * Send a POST HTTP request
 *
 * @param  {string} url
 * @param  {*} data
 * @return {Promise}
 */
xhr.post = function(url, data) {
    return xhr({ method: 'POST', url, data })
}


export default xhr
