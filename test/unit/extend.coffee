assert = require '../assert'

suite '@extend'

test 'extend selector', ->
	assert.compileTo '''
		.button
			display: inline-block

		#submit
			@extend .button
	''', '''
		.button,
		#submit {
			display: inline-block;
		}
	'''

test 'ignore following selectors', ->
	assert.compileTo '''
		.button
			display: inline-block

		#submit
			@extend .button

		.button
			display: block
	''', '''
		.button,
		#submit {
			display: inline-block;
		}

		.button {
			display: block;
		}
	'''

test 'extend selector containing nested selector', ->
	assert.compileTo '''
		.button
			.icon
					display:block

		#submit
			@extend .button
	''', '''
		.button .icon,
		#submit .icon {
			display: block;
		}
	'''

test 'extend selector containing deeply nested selector', ->
	assert.compileTo '''
		.button
			.icon
				img
					display:block

		#submit
			@extend .button
	''', '''
		.button .icon img,
		#submit .icon img {
			display: block;
		}
	'''

test 'extend compound selector', ->
	assert.compileTo '''
		.button
			& .icon
				float: left

		#submit .icon
			@extend .button .icon
	''', '''
		.button .icon,
		#submit .icon {
			float: left;
		}
	'''

test 'extend selector containing nested & selector', ->
	assert.compileTo '''
		.button
			& .icon
				float: left

		#submit
			@extend .button
	''', '''
		.button .icon,
		#submit .icon {
			float: left;
		}
	'''

test 'extend selector with selector list', ->
	assert.compileTo '''
		.button .icon
			float: left

		#submit .icon, #reset .icon
			@extend .button .icon
	''', '''
		.button .icon,
		#submit .icon,
		#reset .icon {
			float: left;
		}
	'''

test 'deeply extend selector', ->
	assert.compileTo '''
		.button
			display: inline-block

		.large-button
			@extend .button
			display: block

		#submit
			@extend .large-button
	''', '''
		.button,
		.large-button,
		#submit {
			display: inline-block;
		}

		.large-button,
		#submit {
			display: block;
		}
	'''

test 'extend selector under the same ruleset', ->
	assert.compileTo '''
		.button
			.icon
				float: left

			.large-icon
				@extend .button .icon
	''', '''
		.button .icon,
		.button .large-icon {
			float: left;
		}
	'''

# don't want to test for selector equalify when extending
# since this scenario might never happen
# resulting in duplicate selectors is acceptable
test 'extend self', ->
	assert.compileTo '''
		.button
			.icon
				float: left

			.icon
				@extend .button .icon
				display: block
	''', '''
		.button .icon,
		.button .icon {
			float: left;
		}

		.button .icon,
		.button .icon {
			display: block;
		}
	'''

test 'extend by multiple selectors', ->
	assert.compileTo '''
		.button
			display: inline-block

		#submit
			@extend .button

		#reset
			@extend .button
	''', '''
		.button,
		#submit,
		#reset {
			display: inline-block;
		}
	'''

test 'extend selector containing selector by multiple selectors', ->
	assert.compileTo '''
		.button
			.icon
				float: left


		#submit
			@extend .button

		#reset
			@extend .button
	''', '''
		.button .icon,
		#submit .icon,
		#reset .icon {
			float: left;
		}
	'''

test 'extend selector containg nested @media', ->
	assert.compileTo '''
		.button
			display: inline-block
			@media screen
				display: block
			@media print
				display: none

		#submit
			@extend .button
	''', '''
		.button,
		#submit {
			display: inline-block;
		}
			@media screen {
				.button,
				#submit {
					display: block;
				}
			}
			@media print {
				.button,
				#submit {
					display: none;
				}
			}
	'''

test 'extend selector nested under same @media', ->
	assert.compileTo '''
		.button
			display: inline-block

		@media print
			.button
				display: block

		@media not screen
			.button
				display: block

			#submit
				@extend .button
	''', '''
		.button {
			display: inline-block;
		}

		@media print {
			.button {
				display: block;
			}
		}

		@media not screen {
			.button,
			#submit {
				display: block;
			}
		}
	'''

test 'extend selector nested under @media with same media query', ->
	assert.compileTo '''
		@media screen
			.button
				display: inline-block

			@media (color), (monochrome)
				.button
					display: block

			@media (color)
				.button
					display: inline-block

		@media screen and (color)
			#submit
				@extend .button
	''', '''
		@media screen {
			.button {
				display: inline-block;
			}
		}
			@media
			screen and (color),
			screen and (monochrome) {
				.button {
					display: block;
				}
			}
			@media screen and (color) {
				.button,
				#submit {
					display: inline-block;
				}
			}
	'''

test 'ignore following @media', ->
	assert.compileTo '''
		@media screen and (color)
			.button
				display: inline-block

		@media screen and (color)
			#submit
				@extend .button

		@media screen and (color)
			.button
				display: block
	''', '''
		@media screen and (color) {
			.button,
			#submit {
				display: inline-block;
			}
		}

		@media screen and (color) {
			.button {
				display: block;
			}
		}
	'''

test 'extend selector in the imported file', ->
	assert.compileTo {
		'button.roo': '''
			.button
				display: inline-block
		'''
	}, '''
		@import 'button'

		#submit
			@extend .button
	''', '''
		.button,
		#submit {
			display: inline-block;
		}
	'''

test 'not extending selector in the importing file', ->
	assert.compileTo {
		'button.roo': '''
			#submit
				@extend .button
				display: block
		'''
	}, '''
		.button
			display: inline-block

		@import 'button'
	''', '''
		.button {
			display: inline-block;
		}

		#submit {
			display: block;
		}
	'''