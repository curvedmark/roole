assert = require '../assert'

suite '@keyframes'

test 'prefixed @keyframes', ->
	assert.compileTo '''
		@-webkit-keyframes name {
			0% {
				top: 0;
			}
			100% {
				top: 100px;
			}
		}
	''', '''
		@-webkit-keyframes name {
			0% {
				top: 0;
			}
			100% {
				top: 100px;
			}
		}
	'''

test 'from to', ->
	assert.compileTo '''
		@-webkit-keyframes name {
			from {
				top: 0;
			}
			to {
				top: 100px;
			}
		}
	''', '''
		@-webkit-keyframes name {
			from {
				top: 0;
			}
			to {
				top: 100px;
			}
		}
	'''

test 'keyframe selector list', ->
	assert.compileTo '''
		@-webkit-keyframes name {
			0% {
				top: 0;
			}
			50%, 60% {
				top: 50px;
			}
			100% {
				top: 100px;
			}
		}
	''', '''
		@-webkit-keyframes name {
			0% {
				top: 0;
			}
			50%, 60% {
				top: 50px;
			}
			100% {
				top: 100px;
			}
		}
	'''

test 'remove empty @keyframes', ->
	assert.compileTo '''
		@keyframes name {}
	''', ''

test 'remove empty keyframe block', ->
	assert.compileTo '''
		@keyframes name {
			0% {}
		}
	''', ''