assert = require '../assert'

suite 'number'

test 'fraction', ->
	assert.compileTo '''
		body
			line-height: 1.24
	''', '''
		body {
			line-height: 1.24;
		}
	'''

test 'fraction without whole number part', ->
	assert.compileTo '''
		body
			line-height: .24
	''', '''
		body {
			line-height: 0.24;
		}
	'''