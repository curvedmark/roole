assert = require '../assert'

suite 'indent'

test 'empty input', ->
	assert.compileTo '', ''

test 'pure spaces input', ->
	assert.compileTo '  ', ''

test 'under-indent', ->
	assert.compileTo '''
		body
				width: auto
			height: auto
	''', '''
		body {
			width: auto;
			height: auto;
		}
	'''

test 'over-indent', ->
	assert.compileTo '''
		body
			width: auto
			div
					height: auto
	''', '''
		body {
			width: auto;
		}
			body div {
				height: auto;
			}
	'''

test 'start with indent', ->
	assert.compileTo '''
		\tbody
		\t\twidth: auto
		\t\theight: auto
	''', '''
		body {
			width: auto;
			height: auto;
		}
	'''