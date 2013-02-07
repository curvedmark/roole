assert = require '../assert'

suite 'property'

test 'multi-line properties', ->
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

test 'single-line properties', ->
	assert.compileTo '''
		body
			width: auto; height: auto
	''', '''
		body {
			width: auto;
			height: auto;
		}
	'''

test 'mixed-line properties', ->
	assert.compileTo '''
		body
			width: auto; height: auto
			float: left
	''', '''
		body {
			width: auto;
			height: auto;
			float: left;
		}
	'''

test 'started property', ->
	assert.compileTo '''
		body
			*zoom: 1
	''', '''
		body {
			*zoom: 1;
		}
	'''

test '!important', ->
	assert.compileTo '''
		body
			width: auto !important
	''', '''
		body {
			width: auto !important;
		}
	'''