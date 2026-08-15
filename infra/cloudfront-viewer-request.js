function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.substring(uri.lastIndexOf('/') + 1).includes('.')) {
    request.uri = uri + '/index.html';
  }

  return request;
}
