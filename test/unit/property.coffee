assert = require '../assert'

suite 'property'

test 'starred property', ->
	assert.compileTo '''
		body {
			*zoom: 1;
		}
	''', '''
		body {
			*zoom: 1;
		}
	'''

test '!important', ->
	assert.compileTo '''
		body {
			width: auto !important;
		}
	''', '''
		body {
			width: auto !important;
		}
	'''

test 'without trailing semicolon', ->
	assert.compileTo '''
		body {
			margin: 0
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'with multiple trailing semicolons', ->
	assert.compileTo '''
		body {
			margin: 0;;
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'with multiple trailing ; interspersed with spaces', ->
	assert.compileTo '''
		body {
			margin: 0; ;
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'with trailing ; and !important', ->
	assert.compileTo '''
		body {
			margin: 0 !important;
		}
	''', '''
		body {
			margin: 0 !important;
		}
	'''