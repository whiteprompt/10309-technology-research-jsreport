module.exports = {
  parseQueryString (queryString = window.location.search) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
  },
  parseHash(hashString = window.location.hash) {
    var hash = {};
    var pairs = (hashString[0] === '#' ? hashString.substr(1) : hashString).split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      hash[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return hash;
  }
};
