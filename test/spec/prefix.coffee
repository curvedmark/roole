assert = require '../assert'

suite 'prefix'

test 'box-sizing', ->
	assert.compileTo '''
		body {
			box-sizing: border-box;
		}
	''', '''
		body {
			-webkit-box-sizing: border-box;
			-moz-box-sizing: border-box;
			box-sizing: border-box;
		}
	'''

test 'linear-gradient()', ->
	assert.compileTo '''
		body {
			background: linear-gradient(#000, #fff);
		}
	''', '''
		body {
			background: -webkit-linear-gradient(#000, #fff);
			background: -moz-linear-gradient(#000, #fff);
			background: -o-linear-gradient(#000, #fff);
			background: linear-gradient(#000, #fff);
		}
	'''

test 'linear-gradient() with starting position', ->
	assert.compileTo '''
		body {
			background: linear-gradient(to bottom, #000, #fff);
		}
	''', '''
		body {
			background: -webkit-linear-gradient(top, #000, #fff);
			background: -moz-linear-gradient(top, #000, #fff);
			background: -o-linear-gradient(top, #000, #fff);
			background: linear-gradient(to bottom, #000, #fff);
		}
	'''

test 'linear-gradient() with starting position consisting of two identifiers', ->
	assert.compileTo '''
		body {
			background: linear-gradient(to top left, #000, #fff);
		}
	''', '''
		body {
			background: -webkit-linear-gradient(bottom right, #000, #fff);
			background: -moz-linear-gradient(bottom right, #000, #fff);
			background: -o-linear-gradient(bottom right, #000, #fff);
			background: linear-gradient(to top left, #000, #fff);
		}
	'''

test 'multiple linear-gradient()', ->
	assert.compileTo '''
		body {
			background: linear-gradient(#000, #fff), linear-gradient(#111, #eee);
		}
	''', '''
		body {
			background: -webkit-linear-gradient(#000, #fff), -webkit-linear-gradient(#111, #eee);
			background: -moz-linear-gradient(#000, #fff), -moz-linear-gradient(#111, #eee);
			background: -o-linear-gradient(#000, #fff), -o-linear-gradient(#111, #eee);
			background: linear-gradient(#000, #fff), linear-gradient(#111, #eee);
		}
	'''

test 'background with regular value', ->
	assert.compileTo '''
		body {
			background: #fff;
		}
	''', '''
		body {
			background: #fff;
		}
	'''

test '@keyframes', ->
	assert.compileTo '''
		@keyframes name {
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

		@-moz-keyframes name {
			0% {
				top: 0;
			}
			100% {
				top: 100px;
			}
		}

		@-o-keyframes name {
			0% {
				top: 0;
			}
			100% {
				top: 100px;
			}
		}

		@keyframes name {
			0% {
				top: 0;
			}
			100% {
				top: 100px;
			}
		}
	'''

test '@keyframes contains property needs to be prefixed', ->
	assert.compileTo '''
		@keyframes name {
			from {
				border-radius: 0;
			}
			to {
				border-radius: 10px;
			}
		}
	''', '''
		@-webkit-keyframes name {
			from {
				-webkit-border-radius: 0;
				border-radius: 0;
			}
			to {
				-webkit-border-radius: 10px;
				border-radius: 10px;
			}
		}

		@-moz-keyframes name {
			from {
				-moz-border-radius: 0;
				border-radius: 0;
			}
			to {
				-moz-border-radius: 10px;
				border-radius: 10px;
			}
		}

		@-o-keyframes name {
			from {
				border-radius: 0;
			}
			to {
				border-radius: 10px;
			}
		}

		@keyframes name {
			from {
				border-radius: 0;
			}
			to {
				border-radius: 10px;
			}
		}
	'''

test 'skip prefixed property', ->
	assert.compileTo {
		skipPrefixed: true
	}, '''
		body {
			-moz-box-sizing: padding-box;
			box-sizing: border-box;
		}
	''', '''
		body {
			-moz-box-sizing: padding-box;
			-webkit-box-sizing: border-box;
			box-sizing: border-box;
		}
	'''
