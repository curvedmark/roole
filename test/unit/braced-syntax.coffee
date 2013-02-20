assert = require '../assert'

suite 'braced syntax'

test 'multi-line', ->
	assert.compileTo '''
		body {
			margin: 0
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'single-line', ->
	assert.compileTo '''
		body { margin: 0 }
	''', '''
		body {
			margin: 0;
		}
	'''

test 'open brace in a different line, multi-line', ->
	assert.compileTo '''
		body
		{
			margin: 0
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'open brace in a different line, single-line', ->
	assert.compileTo '''
		body
		{ margin: 0 }
	''', '''
		body {
			margin: 0;
		}
	'''