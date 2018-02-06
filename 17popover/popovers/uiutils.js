/**
 * 主要用于ui操作的一些辅助工作类
 */
product.ns("efwk.common.UIUtils");

(function(pageNS) {

	//popover的默认参数值
	var popoverDefaultOption = {
		//淡出效果
		animation: true,
		title: '',
		content: '字段可能出现错误,请检查',
		//提示信息出现的位置
		placement: 'auto',
		container: 'body',
		//显示和隐藏的延迟时间
		delay: {
			'show': 0,
			'hide': 0
		},
		//始终位于某个视窗的可视范围内
		viewport: {
			selector: 'body',
			padding: 0
		}
	};

	/**
	 * bootstrap提示信息显示,提示信息参数可设置
	 * element : 元素对象
	 	option:{
	 		title:'',  //标题
	 		content:'',//内容
	 		placement:''//出现位置 top | bottom | left | right | auto.
		}
	 */
	pageNS.popoverShow = function(element, option) {
		_popoverOptionSet(option);
		$(element).popover(popoverDefaultOption);
		$(element).popover("show");
	};

	//对外提供隐藏提示信息
	pageNS.popoverHide = function(element) {
		$(element).popover('destroy');
	}

	//如果提供了提示信息的参数，在这里覆盖默认值
	var _popoverOptionSet = function(option) {
		if(option) {
			$.each(popoverDefaultOption, function(k, v) {
				if(k in option) { //bugfix zhangcheng 若属性值为false获取不到
					popoverDefaultOption[k] = option[k];
				}
			});
		}

	};

})(efwk.common.UIUtils);