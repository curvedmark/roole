assert = require '../assert'

suite 'media query'


test 'media type', ->
	assert.compileTo '''
		@media print
			body
				width: auto
	''', '''
		@media print {
			body {
				width: auto;
			}
		}
	'''

test 'media type with prefix', ->
	assert.compileTo '''
		@media not screen
			body
				width: auto
	''', '''
		@media not screen {
			body {
				width: auto;
			}
		}
	'''

test 'media feature', ->
	assert.compileTo '''
		@media (max-width: 980px)
			body
				width: auto
	''', '''
		@media (max-width: 980px) {
			body {
				width: auto;
			}
		}
	'''

test 'media feature without value', ->
	assert.compileTo '''
		@media (color)
			body
				width: auto
	''', '''
		@media (color) {
			body {
				width: auto;
			}
		}
	'''

test 'media query', ->
	assert.compileTo '''
		@media only screen and (color)
			body
				width: auto
	''', '''
		@media only screen and (color) {
			body {
				width: auto;
			}
		}
	'''

test 'nest media query under media query', ->
	assert.compileTo '''
		@media screen
			@media (color)
				body
					width: auto
	''', '''
		@media screen and (color) {
			body {
				width: auto;
			}
		}
	'''

test 'nest media query list under media query', ->
	assert.compileTo '''
		@media screen
			@media (max-width: 980px), (max-width: 560px)
				body
					width: auto
	''', '''
		@media
		screen and (max-width: 980px),
		screen and (max-width: 560px) {
			body {
				width: auto;
			}
		}
	'''

test 'nest media query under media query list', ->
	assert.compileTo '''
		@media screen, print
			@media (max-width: 980px)
				body
					width: auto
	''', '''
		@media
		screen and (max-width: 980px),
		print and (max-width: 980px) {
			body {
				width: auto;
			}
		}
	'''

test 'nest media query list under media query list', ->
	assert.compileTo '''
		@media screen, print
			@media (max-width: 980px), (max-width: 560px)
				body
					width: auto
	''', '''
		@media
		screen and (max-width: 980px),
		screen and (max-width: 560px),
		print and (max-width: 980px),
		print and (max-width: 560px) {
			body {
				width: auto;
			}
		}
	'''

test 'deeply nest media query', ->
	assert.compileTo '''
		@media screen
			body
				width: auto
				@media (color)
					@media (monochrome)
						height: auto

				div
					height: auto

			@media (monochrome)
				p
					margin: 0
	''', '''
		@media screen {
			body {
				width: auto;
			}
				body div {
					height: auto;
				}
		}
			@media screen and (color) and (monochrome) {
				body {
					height: auto;
				}
			}
			@media screen and (monochrome) {
				p {
					margin: 0;
				}
			}
	'''

test 'interpolating media query', ->
	assert.compileTo '''
		$qry = 'not  screen'
		@media $qry
			body
				width: auto
	''', '''
		@media not screen {
			body {
				width: auto;
			}
		}
	'''

test 'interpolating media query into media query', ->
	assert.compileTo '''
		$qry = '( max-width: 980px )'
		@media screen and $qry
			body
				width: auto
	''', '''
		@media screen and (max-width: 980px) {
			body {
				width: auto;
			}
		}
	'''

test 'interpolating media query into media query list', ->
	assert.compileTo '''
		$qry1 = ' only screen  and (max-width: 980px) '
		$qry2 = '(max-width: 560px)'
		@media $qry1, $qry2
			body
				width: auto
	''', '''
		@media
		only screen and (max-width: 980px),
		(max-width: 560px) {
			body {
				width: auto;
			}
		}
	'''

test 'interpolating identifier', ->
	assert.compileTo '''
		$qry = screen
		@media $qry
			body
				width: auto
	''', '''
		@media screen {
			body {
				width: auto;
			}
		}
	'''

test 'not allow interpolating invalid media query', ->
	assert.failAt '''
		$qry = 'screen @'
		@media $qry
			body
				width: auto
	''', 2, 8

test 'allow nesting media type', ->
	assert.compileTo '''
		@media screen
			@media not print
				body
					width: auto
	''', '''
		@media screen and not print {
			body {
				width: auto;
			}
		}
	'''