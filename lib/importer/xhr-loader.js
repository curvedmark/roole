'use strict'

var loader = {}

loader.load = function(url, callback) {
	var xhr = new XMLHttpRequest()

	xhr.onreadystatechange = function() {
		if (xhr.readyState !== 4)
			return

		if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)
			callback(null, xhr.responseText)
		else
			callback(new Error('Failed to request file ' + url + ': ' + xhr.status))
	}

	// disable cache
	url += (~url.indexOf('?') ? '&' : '?') + '_=' + Date.now()

	try {
		xhr.open('GET', url, true)
		xhr.send(null)
	} catch (error) {
		callback(error)
	}
}