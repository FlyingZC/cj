;
product.ns("efwk.common.paginator");
(function(pageNS){
	function Page(customOpts){
		this.currPage = 1;
		this.pageSize = 10;
		this.totalPages = 0;
		this.totalRecords = 0;
		this.containerId = "";
		this.$container = "";
		this._init(customOpts);
	}
	
	Page.prototype = {
		constructor : "Page",
		_init : function(customOpts){
			var that = this;
			$.each(customOpts,function(key,value){
				if(key in that){
					that[key] = customOpts[key]; 
				}
			});
			this.$container = $("#" + this.containerId);
			this.render();
			this.initEventBind();
		},
		render : function(){
			console.log('--render--');
		},
		initEventBind : function(){
			console.log('--initEventBind--');
		}
	}
	
	pageNS.api = function(customOpts){
		return new Page(customOpts);
	}
})(efwk.common.paginator);
