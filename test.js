//获取当前机构及其子孙机构的机构号
var getCurrAndSubOrg = function(currOrgId){
	if(typeof(currOrgId) === undefined){
		currOrgId = top.window.currentUserInfo.orgId;
	}
	var currAndSubOrgList=[],currAndSubOrgIdList=[];
	var ajaxQueryForm = {};
	ajaxQueryForm.resultField = new Array("id","level");
	ajaxQueryForm.content = {'id':currOrgId};
	efwk.common.EFWKAjax.submit({
		url: "organizationManage/getSubOrg",
		contentType: efwk.common.EFWKAjax.CONTENT_TYPE_JSON,
		async: false,
		timeout: 2000,
		data: ajaxQueryForm,
		callBack: function(data) {
			if(data.content.cpmGdsbas && data.content.cpmGdsbas.length >0){
				currAndSubOrgList = data.content.cpmGdsbas;
			}
		},
		method : "post"
	});
	for(var i=0;i<currAndSubOrgList.length;i++){
		currAndSubOrgIdList.push(currAndSubOrgList[i]['id']);
	}
	return currAndSubOrgIdList;
};

var queryBefore = function(ajax,queryTypeFlag) {debugger;
	if(queryTypeFlag==='commonQuery'){
		if($("#queryFieldSelect").val()==""){
			top.swal({
				text: "将在5秒后自动关闭.",
				title: "请选择查询字段再进行查询!",
				timer: 5000,
				type: "error"
			});
			return false;
		}
	}
	var formData = ajax['formData'];
	if (formData['CPM.EFWK_SCENARIOJOURNAL.CHANNELID']) {
		formData['CHANNELID'] = formData['CPM.EFWK_SCENARIOJOURNAL.CHANNELID'];
	}
	
	//orgId
	if (!formData['CPM.EFWK_SCENARIOJOURNAL.ORGID']||formData['CPM.EFWK_SCENARIOJOURNAL.ORGID'] == '所有机构'||formData['CPM.EFWK_SCENARIOJOURNAL.ORGID'] == '全部机构') {
		//全部机构
		dealWholeOrg(formData);
	} else {
		formData['ORGID'] = formData['CPM.EFWK_SCENARIOJOURNAL.ORGID'];
	}
	
	//终端编号
	if (formData['CPM.EFWK_SCENARIOJOURNAL.TERMINALID']) {
		formData["TERMINALID"] = formData['CPM.EFWK_SCENARIOJOURNAL.TERMINALID'];
	}

	if (formData['CPM.EFWK_SCENARIOJOURNAL.startDate']) {
		formData['startDate'] = formData['CPM.EFWK_SCENARIOJOURNAL.startDate'];
	}
	if (formData['CPM.EFWK_SCENARIOJOURNAL.endDate']) {
		formData['endDate'] = formData['CPM.EFWK_SCENARIOJOURNAL.endDate'];
	}
	return true;
};

var dealWholeOrg=function(formData){
	var currOrgLevel = top.window.currentUserInfo.level;
	//针对 "所有机构" 的 处理
	if(currOrgLevel==0){
		//1.若当前是总行,向后台传"",代表查询所有机构
		formData['ORGID'] = "";
	}else if(currOrgLevel==1){
		//2.若当前是分行,向后台传 当前机构及其下级机构 的 id
		formData['ORGID'] = getCurrAndSubOrg().join(',');
		formData['CPM.EFWK_SCENARIOJOURNAL.ORGID']=formData['ORGID'];
	}else if(currOrgLevel==2){
		//3.若当前是支行,向后台传 当前机构号 即可
		formData['ORGID'] = top.window.currentUserInfo.orgId;
	}
}

var getCurrentTime = function() {
	var date = new Date();
	var seperator1 = "-";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = "" + date.getFullYear() + seperator1 + month + seperator1 + strDate;
	return currentdate;
};

var startTime = function() {
	debugger;
	var time = "";
	if(window.queryTypeFlag==='commonQuery'){
		if($("[id='queryForm_CPM.EFWK_SCENARIOJOURNAL.startDate']").length != 0){
			time = $("[id='queryForm_CPM.EFWK_SCENARIOJOURNAL.startDate']").val();
		}
	}
	if(window.queryTypeFlag==='highQuery'){
		time = $("[id='highQueryForm_CPM.EFWK_SCENARIOJOURNAL.startDate']").val();
	}
	return "<label>" + time + "</label>";
};

var endTime = function() {
	debugger;
	var time = "";
	if(window.queryTypeFlag==='commonQuery'){
		if($("[id='queryForm_CPM.EFWK_SCENARIOJOURNAL.endDate']").length != 0){
			time = $("[id='queryForm_CPM.EFWK_SCENARIOJOURNAL.endDate']").val();
		}
	}
	if(window.queryTypeFlag==='highQuery'){
		time = $("[id='highQueryForm_CPM.EFWK_SCENARIOJOURNAL.endDate']").val();
	}
	return "<label>" + time + "</label>";
};

var channlName = function(data, type, row, meta) {
	var channlname=row.CHANNELID+"";
	if(channlname==="null"||channlname==="undefined"||channlname===""){
		channlname="";
	}else{
		var value;
		var length = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.CHANNELID").options.length;
		for (var i = 0; i < length; i++) {
			value = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.CHANNELID").options[i].value;
			if (value == row.CHANNELID) {
				channlname = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.CHANNELID").options[i].text;
				break;
			}
		}
	}
	return "<label>" + channlname + "</label>";
};

var exportBefore = function(ajax) {
	var selectedIndex = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.ORGID").selectedIndex;
	var key = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.ORGID").options[selectedIndex].text;
	var value = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.ORGID").options[selectedIndex].value;
	if (key == "所有机构" && value == "所有机构") {
		ajax['CPM.EFWK_SCENARIOJOURNAL.ORGID'] = window.orgId;
	} else {
		ajax['CPM.EFWK_SCENARIOJOURNAL.ORGID'] = [value];
	}
	ajax['CPM.EFWK_SCENARIOJOURNAL.startDate'] = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.startDate").value;
	ajax['CPM.EFWK_SCENARIOJOURNAL.endDate'] = document.getElementById("highQueryForm_CPM.EFWK_SCENARIOJOURNAL.endDate").value;
	return true;
};