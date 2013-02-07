assert = require '../assert'

suite 'ruleset'

test 'remove empty ruleset', ->
	assert.compileTo '''
		body
			$width = 980px
	''', ''