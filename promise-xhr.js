(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.PromiseXHR = factory();
  }
}(this, function() {
  "use strict";

  function Response(request) {
    this.ok = request.status < 400;
    this.status = request.status;
    this.statusText = request.statusText;
    this.url = request.responseUrl

    this.text = function() {
      return Promise.resolve(request.responseText);
    };

    this.json = function() {
      return this.text().then(function(text) {
        return JSON.parse(text);
      });
    };
  }

  /**
   * Send an HTTP request
   *
   * Options:
   *     method  (string) request method [GET]
   *     headers (object) request headers
   *     data    (mixed)  request data
   */
  function fetch(url, options) {
    options = options || {};

    var req = new XMLHttpRequest();

    return new Promise(function (resolve, reject) {
      req.onreadystatechange = function (e) {
        if (req.readyState !== 4) {
          return;
        }

        if (req.status === 0) {
          reject(e);
        } else {
          resolve(new Response(req));
        }
      };

      Object.keys(options.headers || {}).forEach(function (key) {
        req.setRequestHeader(key, options.headers[key]);
      });

      req.open(options.method || 'GET', url, true);
      req.send(options.data);
    });
  }

  return fetch;
}));
