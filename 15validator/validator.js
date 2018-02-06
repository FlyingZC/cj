/*
    Validator v1.1.0
    (c) Yair Even Or
    https://github.com/yairEO/validator

    MIT-style license.
*/

var validator = (function($) {
	var message, tests, checkField, validate, mark, unmark, field, minLength, maxLength, defaults,
		validateWords, lengthRange, lengthLimit, pattern, alertTxt, data, jsfunc, compareExp, required,
		email_illegalChars = /[\(\)\<\>\,\;\:\\\/\"\[\]]/,
		email_filter = /^.+@.+\..{2,6}$/; // exmaple email "steve@s-i.photo"

	var uiUtils = product.alias(efwk.common.UIUtils);
	/* general text messages
	 */
	message = {
		invalid: 'invalid input',
		checked: '必须选中一项',
		empty: '字段为必输项',
		min: '输入内容太短',
		max: '输入内容太长',
		number_min: '字段值太小',
		number_max: '字段值太大',
		url: '输入一个正确的URL',
		number: '不是一个数字',
		email: '不是正确是email地址',
		email_repeat: 'email不匹配',
		password_repeat: '两次密码不匹配',
		repeat: '不匹配',
		complete: 'input is not complete',
		select: '字段为必选项',
		telephone: '不是正确的固定电话',
		mobilephone: '不是正确的手机号码',
		phone: '不是正确的电话号码',
		postcode: '不是正确的邮政编码',
		IP_invalid: 'IP地址不合法'
	};

	if(!window.console) {
		console = {};
		console.log = console.warn = function() {
			return;
		}
	}

	// defaults
	defaults = {
		alerts: true,
		classes: {
			item: 'item',
			alert: 'alert',
			bad: 'bad'
		}
	};

	/* Tests for each type of field (including Select element)
	 */
	tests = {
		sameAsPlaceholder: function(a) {
			return $.fn.placeholder && a.attr('placeholder') !== undefined && data.val == a.prop('placeholder');
		},
		hasValue: function(a) {
			if(!a) {
				alertTxt = message.empty;
				return false;
			}
			return true;
		},
		// 'linked' is a special test case for inputs which their values should be equal to each other (ex. confirm email or retype password)
		linked: function(a, b) {
			if(b != a) {
				// choose a specific message or a general one
				alertTxt = message[data.type + '_repeat'] || message.no_match;
				return false;
			}
			return true;
		},
		email: function(a) {
			if(!email_filter.test(a) || a.match(email_illegalChars)) {
				alertTxt = a ? message.email : message.empty;
				return false;
			}
			return true;
		},
		telephone: function(val) {
			if((typeof val) === 'undefined' || val === null || val === '') {
				return true;
			}
			alertTxt = message.telephone;
			return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(val);
		},
		mobilephone: function(val) {
			if((typeof val) === 'undefined' || val === null || val === '') {
				return true;
			}
			alertTxt = message.mobilephone;
			return /^1\d{10}$/.test(val);
		},
		phone: function(val) {
			if(tests.telephone(val)) {
				return tests.mobilephone(val);
			}
			alertTxt = message.phone;
			return false;
		},
		postcode: function(val) {
			if((typeof val) === 'undefined' || val === null || val === '') {
				return true;
			}
			alertTxt = message.postcode;
			return /^[1-9]\d{5}$/.test(val);

		},
		IPV4: function(val) {
			if((typeof val) === 'undefined' || val === null || val === '') {
				return true;
			}
			if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) {
				if(!!lengthRange) {
					if(!!lengthRange[0] && !!lengthRange[1] && (val < lengthRange[0] || val > lengthRange[1])) {
						alertTxt = 'IP范围' + lengthRange[0] + '-' + lengthRange[1];
						return false;
					}
					if(!lengthRange[1] && !!lengthRange[0] && val < lengthRange[0]) {
						alertTxt = 'IP最小值' + lengthRange[0];
						return false;
					}
					if(!lengthRange[0] && !!lengthRange[1] && val > lengthRange[1]) {
						alertTxt = 'IP最大值' + lengthRange[1];
						return false;
					}
				}
				if(!!lengthLimit) {
					var matched = false;
					$.each(lengthLimit, function(index, obj) {
						if(obj == val) {
							matched = true;
							return false;
						}
					});
					if(!matched) {
						alertTxt = 'IP只能是' + lengthLimit.join("|");
						return false;
					}
				}
				return true;
			}
			alertTxt = message.IP_invalid;
			return false;
		},
		IPV6: function(val) {
			if((typeof val) === 'undefined' || val === null || val === '') {
				return true;
			}
			if(!!lengthRange) {
				if(!!lengthRange[0] && !!lengthRange[1] && (val < lengthRange[0] || val > lengthRange[1])) {
					alertTxt = 'IP范围' + lengthRange[0] + '-' + lengthRange[1];
					return false;
				}
				if(!lengthRange[1] && !!lengthRange[0] && val < lengthRange[0]) {
					alertTxt = 'IP最小值' + lengthRange[0];
					return false;
				}
				if(!lengthRange[0] && !!lengthRange[1] && val > lengthRange[1]) {
					alertTxt = 'IP最大值' + lengthRange[1];
					return false;
				}
			}
			if(!!lengthLimit) {
				var matched = false;
				$.each(lengthLimit, function(index, obj) {
					if(obj == val) {
						matched = true;
						return false;
					}
				});
				if(!matched) {
					alertTxt = 'IP只能是' + lengthLimit.join("|");
					return false;
				}
			}
			return true;
			alertTxt = message.IP_invalid;
			return false;
		},
		money: function(val) {
			if((typeof val) === 'undefined' || val === null || val === '') {
				return true;
			}
			return tests.number(val);
		},
		MAC: function(val) {
			val = val.toUpperCase();
			var regexp = /[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}/;
			var regexp2 = /[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}-[A-F\d]{2}/;
			if(regexp.test(val) || regexp2.test(val)) {
				return true;
			} else {
				alertTxt = "MAC地址错误或含有非法字符，请检查";
				return false;
			}
		},
		// a "skip" will skip some of the tests (needed for keydown validation)
		text: function(a) {
			if(pattern) {
				try {
					jsRegex = new RegExp(pattern).test(a);
					if(a && !jsRegex)
						alertTxt = '字段值不符合正则：' + pattern;
					return false;
				} catch(err) {
					console.log(err, field, 'regex is invalid');
					return false;
				}
			}

			return true;
		},
		number: function(a) {
			// if not not a number
			if(isNaN(parseFloat(a)) && !isFinite(a)) {
				alertTxt = message.number;
				return false;
			}
			// not enough numbers
			else if(lengthRange && lengthRange[0] && a < lengthRange[0]) {
				alertTxt = message.number_min;
				return false;
			}
			// check if there is max length & field length is greater than the allowed
			else if(lengthRange && lengthRange[1] && a > lengthRange[1]) {
				alertTxt = message.number_max;
				return false;
			}
			if(!!lengthLimit) {
				var matched = false;
				$.each(lengthLimit, function(index, obj) {
					if(obj == a) {
						matched = true;
						return false;
					}
				});
				if(!matched) {
					alertTxt = '数字只能是' + lengthLimit.join("|");
					return false;
				}
			}
			return true;
		},
		// Date is validated in European format (day,month,year)
		date: function(a) {
			var day, A = a.split(/[-./]/g),
				i;
			// if there is native HTML5 support:
			if(field[0].valueAsNumber)
				return true;

			for(i = A.length; i--;) {
				if(isNaN(parseFloat(A[i])) && !isFinite(A[i])) {
					alertTxt = '日期格式不正确';
					return false;
				}
			}
			return true;
			//			try {
			//				day = new Date(A[2], A[1] - 1, A[0]);
			//				var day = new Date();
			//				day.setFullYear(A[0]);
			//				var month = parseFloat(A[1]);
			//				day.setMonth(month - 1);
			//				var date1 = parseFloat(A[2]);
			//				day.setDate(date1 - 1);
			//				if(day.getMonth() + 1 == month && day.getDate() + 1 == date1)
			//				{
			//					return day;
			//				}
			//				alertTxt = '日期格式不正确';
			//				return false;
			//			} catch(er) {
			//				console.log('date test: ', err);
			//				alertTxt = '日期格式不正确';
			//				return false;
			//			}
		},
		timestamp: function(a) {
			if(a.split(' ').length != 2) {
				return;
			}
			var date = a.split(' ')[0];
			if(!tests.date(date)) {
				return;
			}
			var day, A = a.split(' ')[1].split(':'),
				i;
			// if there is native HTML5 support:
			if(field[0].valueAsNumber)
				return true;

			for(i = A.length; i--;) {
				if(isNaN(parseFloat(A[i])) && !isFinite(A[i])) {
					alertTxt = '时间格式不正确';
					return false;
				}
			}
			return true;
		},
		url: function(a) {
			// minimalistic URL validation
			function testUrl(url) {
				return /^(https?:\/\/)?([\w\d\-_]+\.+[A-Za-z]{2,})+\/?/.test(url);
			}
			if(!testUrl(a)) {
				alertTxt = a ? message.url : message.empty;
				return false;
			}
			return true;
		},
		validLength: function(a) {
			if(lengthRange && lengthRange[0] && a.length < lengthRange[0]) {
				alertTxt = message.min;
				return false;
			}
			// check if there is max length & field length is greater than the allowed
			else if(lengthRange && lengthRange[1] && a.length > lengthRange[1]) {
				alertTxt = message.max;
				return false;
			}
			if(!!lengthLimit) {
				var matched = false;
				$.each(lengthLimit, function(index, obj) {
					if(obj == a) {
						matched = true;
						return false;
					}
				});
				if(!matched) {
					alertTxt = '长度只能是' + lengthLimit.join("|");
					return false;
				}
			}
			return true;
		},
		hidden: function(a) {
			if(lengthRange && a.length < lengthRange[0]) {
				alertTxt = message.min;
				return false;
			}
			if(pattern) {
				var regex;
				if(pattern == 'alphanumeric') {
					regex = /^[a-z0-9]+$/i;
					if(!regex.test(a)) {
						return false;
					}
				}
			}
			return true;
		},
		select: function(a) {
			if(!tests.hasValue(a)) {
				alertTxt = message.select;
				return false;
			}
			return true;
		}
	};

	/* marks invalid fields
	 * alertWay:提示的方式,有swap和popover两种.默认为popover
	 * alertWay可不传,若不传则视情况自动选择提示方式.
	 * 或传入"roll",则使用支持滚动的popover提示
	 * 或传入"swap",则使用弹框提示
	 */
	mark = function(field, text, alertWay) {
		if(!text || !field || !field.length)
			return false;
		if(!alertWay){
			if(field.closest(".modal").size()>0){
				alertWay="roll";
			}else if(field.closest("#highQueryModule").size()>0){
				alertWay="swap";
			}
		}
		// check if not already marked as a 'bad' record and add the 'alert' object.
		// if already is marked as 'bad', then make sure the text is set again because i might change depending on validation
		if(alertWay === "swap") {
			var label=field.prev('label');
			var labelTxt=label.size()>0?label.text():"";
			top.swal({
				text: "将在5秒后自动关闭.",
				title: labelTxt+text,
				timer: 5000,
				type: "error"
			});
			return;
		}

		var item = field.closest('.' + defaults.classes.item),
			warning;

		/*bugfix 修复原逻辑导致的第二次提示信息不生效的bug*/
		/*if(item.hasClass(defaults.classes.bad)) {
			if(defaults.alerts)
				item.find('.' + defaults.classes.alert).html(text);
		} else */
		var defaultOptions = {
			content: text,
			placement: "right",
			container: field.closest(".modal").size() == 0 ? 'body' : field.closest(".modal"),
			//始终位于某个视窗可视范围内,若取false则popover可出现在用户看不到的地方,用在视窗区域有滚动条的情况
			viewport: {
				selector: 'body',
				padding: 0
			}
		};
		if(alertWay === "roll") {
			defaultOptions.viewport = false;
		}
		if(defaults.alerts) {
			//修改为气泡提示
			uiUtils.popoverShow(field, defaultOptions);
			//取消原提示层
			//			warning = $('<div class="' + defaults.classes.alert + '">').html(text);
			//			item.append(warning);
		}

		item.removeClass(defaults.classes.bad);
		// a delay so the "alert" could be transitioned via CSS
		setTimeout(function() {
			item.addClass(defaults.classes.bad);
		}, 0);
	};
	/* un-marks invalid fields
	 */
	unmark = function(field) {
		if(!field || !field.length) {
			console.warn('no "field" argument, null or DOM object not found');
			return false;
		}

		field.closest('.' + defaults.classes.item)
			.removeClass(defaults.classes.bad)
			.find('.' + defaults.classes.alert).remove();
		uiUtils.popoverHide(field);
	};

	function testByType(type, value) {
		if(type == 'tel')
			pattern = pattern || 'phone';

		if(!type || type == 'password' || type == 'tel' || type == 'search' || type == 'file')
			type = 'text';

		return tests[type] ? tests[type](value, true) : true;
	}

	function prepareFieldData(el) {
		field = $(el);

		field.data('valid', true); // initialize validity of field
		field.data('type', field.attr('type')); // every field starts as 'valid=true' until proven otherwise
		pattern = field.attr('regexp');
		jsfunc = field.attr('jsfunc');
		if(jsfunc && jsfunc.indexOf('(') != -1) {
			jsfunc = jsfunc.substring(0, jsfunc.indexOf('('));
		}
		compareExp = field.attr('compare-exp');
		lengthRange = null;
		if(field.attr('range') && (field.attr('range') + '').indexOf('..') != -1) {
			lengthRange = (field.attr('range') + '').split('..');
		}
		lengthLimit = null;
		if(field.attr('range') && (field.attr('range') + '').indexOf('|') != -1) {
			lengthLimit = (field.attr('range') + '').split('|');
		}
		required = field.attr('required');
		maxLength = null;
		if(!!field.attr('range') && field.attr('range').match(/^\.\..+$/g)) {
			maxLength = field.attr('range').split('..')[1];
		}
		minLength = null;
		if(!!field.attr('range') && field.attr('range').match(/^.+\.\.$/g)) {
			minLength = field.attr('range').split('..')[0];
		}
	}

	/* Validations per-character keypress
	 */
	function keypress(e) {
		prepareFieldData(this);
		//  String.fromCharCode(e.charCode)

		if(e.charCode) {
			return testByType(this.type, this.value);
		}
	}

	/* Checks a single form field by it's type and specific (custom) attributes
	 */
	function checkField(alertWay) {
		// skip testing fields whom their type is not HIDDEN but they are HIDDEN via CSS.
		if(this.type != 'hidden' && ($(this).is(':hidden') || !$(this).is(':visible'))) {
			unmark($(this));
			return true;
		}

		prepareFieldData(this);

		field.data('val', field[0].value.replace(/^\s+|\s+$/g, "")); // cache the value of the field and trim it
		data = field.data();

		// Check if there is a specific error message for that field, if not, use the default 'invalid' message
		alertTxt = message[field.prop('name')] || message.invalid;

		if(!!field.attr('require-when-jsFunc')) {
			var jsF = field.attr('require-when-jsFunc');
			if(jsF.indexOf('(') != -1) {
				jsF = jsF.substring(0, jsF.indexOf('('));
			}
			var isRequire = eval(jsF).call(window);
			if(isRequire) {
				data.valid = tests.hasValue(data.val);
			}
		} else if(!!field.attr('require-when-jsCode')) {
			var isRequire = eval(field.attr('require-when-jsCode'));
			if(isRequire) {
				data.valid = tests.hasValue(data.val);
			}
		} else if(!!required && required === 'required') {
			data.valid = tests.hasValue(data.val);
		}
		if(!data.valid && !!field.attr('tips') && JSON.parse(field.attr('tips')).required) {
			alertTxt = JSON.parse(field.attr('tips')).required;
		}

		// check if field has any value
		if(data.valid) {
			/* Validate the field's value is different than the placeholder attribute (and attribute exists)
			 * this is needed when fixing the placeholders for older browsers which does not support them.
			 * in this case, make sure the "placeholder" jQuery plugin was even used before proceeding
			 */
			if(tests.sameAsPlaceholder(field)) {
				alertTxt = message.empty;
				data.valid = false;
			}

			// if this field is linked to another field (their values should be the same)
			if(data.validateLinked) {
				var linkedTo = data['validateLinked'].indexOf('#') == 0 ? $(data['validateLinked']) : $(':input[name=' + data['validateLinked'] + ']');
				data.valid = tests.linked(data.val, linkedTo.val());
			}
			/* validate by type of field. use 'attr()' is proffered to get the actual value and not what the browsers sees for unsupported types.
			 */
			else if(data.valid || data.type == 'select')
				data.valid = testByType(data.type, data.val);

			if(!!field.attr('serviceType')) {
				data.valid = validateServiceType(field);
			}
			if(data.valid && !field.attr('serviceType') && field.attr('range')) {
				data.valid = tests.validLength(field.val());
				if(!data.valid && !!field.attr('tips') && JSON.parse(field.attr('tips')).range) {
					alertTxt = JSON.parse(field.attr('tips')).range;
				}
			}
			if(data.valid && !!pattern) {
				data.valid = tests.text(field.val());
				if(!data.valid && !!field.attr('tips') && JSON.parse(field.attr('tips')).regexp) {
					alertTxt = JSON.parse(field.attr('tips')).regexp;
				}
			}
			if(data.valid && !!compareExp) {
				var $this = field;
				data.valid = eval(compareExp);
				if(!data.valid) {
					alertTxt = '字段值不符合表达式：' + compareExp;
				}
				if(!data.valid && !!field.attr('tips') && JSON.parse(field.attr('tips')).compareExp) {
					alertTxt = JSON.parse(field.attr('tips')).compareExp;
				}
			}
			if(data.valid && !!jsfunc) {
				data.valid = eval(jsfunc).call(window, field[0]);
				if(!!data.valid) {
					alertTxt = data.valid;
					data.valid = false;
				} else {
					data.valid = true;
				}
				if(!data.valid && !!field.attr('tips') && JSON.parse(field.attr('tips')).jsFunc) {
					alertTxt = JSON.parse(field.attr('tips')).jsFunc;
				}
			}
		}

		// mark / unmark the field, and set the general 'submit' flag accordingly
		if(data.valid)
			unmark(field, alertWay);
		else {
			mark(field, alertTxt, alertWay);
			submit = false;
		}

		return data.valid;
	}

	function validateServiceType(field) {
		var serviceType = field.attr('serviceType');
		if (tests[serviceType]) {
			return tests[serviceType](field.val());
		}
		return true;
	}

	/* vaildates all the REQUIRED fields prior to submiting the form
	 */
	function checkAll($form, alertWay) {
	
		$form = $($form);

		if($form.length == 0) {
			console.warn('element not found');
			return false;
		}

		var that = this,
			submit = true, // save the scope
			// get all the input/textareas/select fields which are required or optional (meaning, they need validation only if they were filled)
			fieldsToCheck = $form.find(':input').filter('[required=required], .validate, .optional').not('[disabled=disabled]');

		fieldsToCheck.each(function() {
			// use an AND operation, so if any of the fields returns 'false' then the submitted result will be also FALSE
			submit = submit * checkField.call(this, alertWay);
			//若是高级查询(使用弹框提示)时,当发现有一个校验不通过时,即返回
			if((typeof(alertWay)==='undefined'&&$form.selector=='#highQueryModule')||(typeof(alertWay)==='string'&&alertWay==='swap')){
				if(!submit){
					return !!submit;
				}
			}
		});

		return !!submit; // casting the variable to make sure it's a boolean
	}
	
	function checkFieldInArray(fieldsToCheck) {
		submit = true, // save the scope
		$(fieldsToCheck).each(function() {
			// use an AND operation, so if any of the fields returns 'false' then the submitted result will be also FALSE
			submit = submit * checkField.apply(this);
		});
		return !!submit; // casting the variable to make sure it's a boolean
	}

	/**
	 * 用于清除校验样式
	 * add api 2016-09-01
	 * @param {Object} $form
	 */
	function clearAll($form) {
		//未指定时清除当前页面所有
		if(!$form || $form.length == 0) {
			$form = $("body form");
		} else {
			$form = $($form);
		}
		if($form.length == 0) {
			console.warn('element not found');
			return false;
		}

		var that = this,
			submit = true, // save the scope
			// get all the input/textareas/select fields which are required or optional (meaning, they need validation only if they were filled)
			fieldsToCheck = $form.find(':input').filter('[required=required], .required, .optional').not('[disabled=disabled]');

		fieldsToCheck.each(function() {
			unmark($(this));
		});
	}

	return {
		defaults: defaults,
		checkField: checkField,
		keypress: keypress,
		checkAll: checkAll,
		checkFieldInArray: checkFieldInArray,
		clearAll: clearAll,
		mark: mark,
		unmark: unmark,
		message: message,
		tests: tests
	}
})(jQuery);