sap.ui.define([
	"./BaseController",
	"sap/ui/Device",
	"sap/ui/model/Filter"
], function (BaseController, Device, Filter) {
	"use strict";

	return BaseController.extend("report.WorkFlowReport.controller.Detail", {
		onInit: function () {
			this._JSONModel = this.getView().getModel() || this.getOwnerComponent().getModel();
		},
		
		setNodeDescription : function(flowId, company, node, subNode){
			var wfNodeNames = this._JSONModel.getProperty("/WFNODENAMESet") ? this._JSONModel.getProperty("/WFNODENAMESet") : [];
			for(var i = 0; i < wfNodeNames.length; i++){
				if(flowId === wfNodeNames[i].FLOWID && company === wfNodeNames[i].STARTCOMPANY
					&& node === wfNodeNames[i].NODEID && subNode === wfNodeNames[i].SUBNODEID){
					return wfNodeNames[i].NODENAME + "-" + wfNodeNames[i].SUBNODENAME;
				}
			}
			return node + "-" + subNode;
		},
		
		// 去前导零
		deleteLeftZero : function(v){
			if (v === null || v === undefined || v === 0 || v === "0") {
				v = "0";
			}
			return v.replace(/^0+/, "");
		},
		
		date : function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern : "yyyy-MM-dd"
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}
		},
		
		onAfterRendering : function() {
			// var document = this._JSONModel.getProperty("/document");
			// var flowId = this._JSONModel.getProperty("/flowId");
			// var masterProperty = this._JSONModel.getProperty("/masterProperties/" + flowId);
			// this.getDetailHead(document, masterProperty);
			// this.getDetailItem(document, masterProperty);
			// this._searchWorkflowHead(document, masterProperty);
		},
		
		onCloseDetailPress: function () {
			this._JSONModel.setProperty("/appProperties/layout", "OneColumn");
			this._JSONModel.setProperty("/appProperties/fullScreen", false);
			this.getRouter().navTo("master");
		},
		
		toggleFullScreen: function () {
			var bFullScreen = this._JSONModel.getProperty("/appProperties/fullScreen");
			if (!bFullScreen) {
				// store current layout and go full screen
				this._JSONModel.setProperty("/appProperties/previousLayout", this._JSONModel.getProperty("/appProperties/layout"));
				this._JSONModel.setProperty("/appProperties/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this._JSONModel.setProperty("/appProperties/layout",  this._JSONModel.getProperty("/appProperties/previousLayout"));
			}
			this._JSONModel.setProperty("/appProperties/fullScreen", !bFullScreen);
		},
		
		formatApplicationType : function(v){
			if(v === "01"){
				return "部门领料";
			}
			if(v === "02"){
				return "部门退料";
			}
			return v;
		}
	});
});