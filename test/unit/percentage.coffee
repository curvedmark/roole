assert = require '../assert'

suite 'percentage'

test 'percentage', ->
	assert.compileTo '''
		body
			width: 33.33%
	''', '''
		body {
			width: 33.33%;
		}
	'''