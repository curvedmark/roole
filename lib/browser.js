/**
 * Compile style and link elements in the HTML
 */
var selector = 'link[rel="stylesheet/roole"],style[type="text/roole"]'
var elements = document.querySelectorAll(selector)

Array.prototype.forEach.call(elements, function(element) {
	var styleElement = document.createElement('style')
	document.head.appendChild(styleElement)

	var options = {
		prettyError: true
	}

	if (element.nodeName === 'STYLE') {
		roole.compile(element.textContent, options, function(error, css) {
			if (error) {
				displayError(error.message)
				throw error
			}

			styleElement.textContent = css
		})
	} else if (element.nodeName === 'LINK') {
		var url = element.getAttribute('href')
		loader.load(url, function(error, content) {
			if (error) {
				displayError(error.message)
				throw error
			}

			options.filePath = url
			roole.compile(content, options, function(error, css) {
				if (error) {
					displayError(error.message)
					throw error
				}

				styleElement.textContent = css
			})
		})
	}
})

function displayError(message) {
	var errorElement = document.createElement('pre')
	var style = [
		['font', '14px/1.25 Menlo,Monaco,Consolas,"Lucida Console",monospace'],
		['border', '3px solid #f60f92'],
		['color', '#000'],
		['background-color', '#ffeff4'],
		['padding', '1em'],
		['margin', '0'],
		['position', 'fixed'],
		['top', '0'],
		['left', '0'],
		['right', '0'],
		['z-index', '99999999']
	].map(function(property) { return property[0] + ':' + property[1] }).join(';')
	errorElement.setAttribute('style', style)
	errorElement.textContent = message
	document.body.appendChild(errorElement)
}