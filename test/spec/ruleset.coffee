assert = require '../assert'

suite 'ruleset'

test 'remove empty ruleset', ->
	assert.compileTo '''
		body {}
	''', ''
