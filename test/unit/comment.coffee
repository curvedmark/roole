assert = require '../assert'

suite 'comment'

test 'empty input', ->
	assert.compileTo '', ''

test 'pure spaces input', ->
	assert.compileTo '  ', ''

test 'single-line commnet', ->
	assert.compileTo '''
		// before selector
		body // selctor
		{
			// before property
			width: auto; // property
			// after property
			height: auto;
		} // before eof
	''', '''
		body {
			width: auto;
			height: auto;
		}
	'''

test 'multi-line commnet', ->
	assert.compileTo '''
		/* license */
	''', '''
		/* license */
	'''

test 'multi-line commnet, before ruleset', ->
	assert.compileTo '''
		$foo = bar;

		/* ruleset */
		body {
			margin: 0;
		}
	''', '''
		/* ruleset */
		body {
			margin: 0;
		}
	'''

test 'mutiple multi-line commnets', ->
	assert.compileTo '''
		$foo = bar;

		/* ruleset */
		/* ruleset */
		body {
			margin: 0;
		}
	''', '''
		/* ruleset */
		/* ruleset */
		body {
			margin: 0;
		}
	'''

test 'multi-line commnet, before property', ->
	assert.compileTo '''
		body {
			/* property */
			margin: 0;
		}
	''', '''
		body {
			/* property */
			margin: 0;
		}
	'''

test 'wrapped multi-line commnet, before property', ->
	assert.compileTo '''
		body {
			p {
				/*
				 * property
				 */
				margin: 0;
			}
		}
	''', '''
		body p {
			/*
			 * property
			 */
			margin: 0;
		}
	'''

test 'multi-line commnet, before media', ->
	assert.compileTo '''
		$foo = bar;

		/* media */
		@media screen {
			body {
				margin: 0;
			}
		}
	''', '''
		/* media */
		@media screen {
			body {
				margin: 0;
			}
		}
	'''

test 'multi-line commnet, before nested media', ->
	assert.compileTo '''
		@media screen {
			body {
				margin: 0;
				/* media */
				@media (color) {
					margin: 0;
				}
			}
		}
	''', '''
		@media screen {
			body {
				margin: 0;
			}
		}
			/* media */
			@media screen and (color) {
				body {
					margin: 0;
				}
			}
	'''

test 'multi-line commnet, before import', ->
	assert.compileTo '''
		$foo = bar;

		/* import */
		@import url(foo);
	''', '''
		/* import */
		@import url(foo);
	'''

test 'multi-line commnet, before keyframe', ->
	assert.compileTo '''
		$foo = bar;

		/* keyframes */
		@-webkit-keyframes name {
			/* from */
			from {
				/* prop */
				margin: 0;
			}
		}
	''', '''
		/* keyframes */
		@-webkit-keyframes name {
			/* from */
			from {
				/* prop */
				margin: 0;
			}
		}
	'''

test 'multi-line commnet, before font-face', ->
	assert.compileTo '''
		$foo = bar;

		/* font-face */
		@font-face {
			font-family: foo;
		}
	''', '''
		/* font-face */
		@font-face {
			font-family: foo;
		}
	'''

test 'multi-line commnet, before charset', ->
	assert.compileTo '''
		$foo = bar;

		/* chartset */
		@charset 'UTF-8';
	''', '''
		/* chartset */
		@charset 'UTF-8';
	'''

test 'multi-line commnet, before page', ->
	assert.compileTo '''
		$foo = bar;

		/* page */
		@page {
			margin: 3cm;
		}
	''', '''
		/* page */
		@page {
			margin: 3cm;
		}
	'''