assert = require '../assert'

suite '@void'

test 'unextended ruleset', ->
	assert.compileTo '''
		@void
			body
				width: auto
	''', ''

test 'extended ruleset', ->
	assert.compileTo '''
		@void
			.button
				display: inline-block

		#submit
			@extend .button
	''', '''
		#submit {
			display: inline-block;
		}
	'''
test 'extend ruleset inside @void', ->
	assert.compileTo '''
		@void
			.button
				display: inline-block
				.icon
					float: left

			.large-button
				@extend .button
				display: block

		#submit
			@extend .large-button
	''', '''
		#submit {
			display: inline-block;
		}
			#submit .icon {
				float: left;
			}

		#submit {
			display: block;
		}
	'''

test 'extend ruleset outside @void has no effect', ->
	assert.compileTo '''
		.button
			display: inline-block

		@void
			.button
				display: block

			.large-button
				@extend .button


		#submit
			@extend .large-button
	''', '''
		.button {
			display: inline-block;
		}

		#submit {
			display: block;
		}
	'''

test 'nest @import under @void', ->
	assert.compileTo {
		'button.roo': '''
			.button
				display: inline-block

			.large-button
				@extend .button
				width: 100px
		'''
	}, '''
		@void
			@import 'button'

		#submit
			@extend .large-button
	''', '''
		#submit {
			display: inline-block;
		}

		#submit {
			width: 100px;
		}
	'''