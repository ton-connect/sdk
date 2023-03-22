import realFetch from 'node-fetch';
function fetch(url, options) {
    if (/^\/\//.test(url)) {
        url = 'https:' + url;
    }
    return realFetch.call(this, url, options);
}

if (!global.fetch) {
    global.fetch = fetch;
    global.Response = realFetch.Response;
    global.Headers = realFetch.Headers;
    global.Request = realFetch.Request;
}
