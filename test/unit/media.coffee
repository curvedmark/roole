assert = require '../assert'

suite '@media'

test 'not allow containing properties at root level', ->
	assert.failAt '''
		@media screen {
			width: auto;
		}
	''', {line: 1, column: 1}

test 'nest inside ruleset', ->
	assert.compileTo '''
		body {
			@media screen {
				width: auto;
			}
		}
	''', '''
		@media screen {
			body {
				width: auto;
			}
		}
	'''

test 'remove empty @media', ->
	assert.compileTo '''
		@media screen {
			body {
				$width = 980px;
			}
		}
	''', ''