sap.ui.define([
	"./BaseController",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"./viewSettingDialog"
], function (BaseController, Device, Filter, JSONModel, viewSettingDialog) {
	"use strict";

	return BaseController.extend("report.WorkFlowReport.controller.Master", {
		onInit: function () {
			this._JSONModel = this.getView().getModel() || this.getOwnerComponent().getModel();
			this._purModel = this.getOwnerComponent().getModel("PURHeader");
			this._reqModel = this.getOwnerComponent().getModel("REQHeader");
			this._purModel.attachBatchRequestCompleted(function (oEvent) {
				this._JSONModel.setProperty("/appProperties/tBusy", false);
			}.bind(this));
			this._reqModel.attachBatchRequestCompleted(function (oEvent) {
				this._JSONModel.setProperty("/appProperties/tBusy", false);
			}.bind(this));

			// var that = this;
			// this._JSONModel.setProperty("/appProperties/tBusy", true);
			// Promise.all([that._getFlowDescription(), that._getNodeDescription(), that.getPO(), that.getPR()]).then(function(results){
			// 	this._JSONModel.setProperty("/appProperties/tBusy", false);
			// }).catch(function(error) {
			// 	this._JSONModel.setProperty("/appProperties/tBusy", false);
			// });
			this._getFlowDescription();
			this._getNodeDescription();
		},

		// 排序功能
		onViewSettingsDialog: function (oEvent) {
			if (!this._viewSettingDialog) {
				this._viewSettingDialog = new viewSettingDialog(this.getView(), "idTable");
			}
			this._viewSettingDialog.openDialog(oEvent);
		},

		_getFlowDescription: function () {
			var promise = new Promise(function (resolve, reject) {
				var mParameters = {
					success: function (oData, response) {
						this._JSONModel.setProperty("/WFNAMESet", oData.results, false);
					}.bind(this),
					error: function (oError) {
						this._JSONModel.setProperty("/WFNAMESet", [], false);
					}
				};
				this.getOwnerComponent().getModel("WORKFLOWNAME").read("/WFNAME", mParameters);
			}.bind(this));
			return promise;
		},

		setFlowDescription: function (flowId, company) {
			var wfNames = this._JSONModel.getProperty("/WFNAMESet") ? this._JSONModel.getProperty("/WFNAMESet") : [];
			for (var i = 0; i < wfNames.length; i++) {
				if (flowId === wfNames[i].FLOWID && company === wfNames[i].STARTCOMPANY) {
					return wfNames[i].FLOWNAME;
				}
			}
			return flowId;
		},

		_getNodeDescription: function () {
			var promise = new Promise(function (resolve, reject) {
				var mParameters = {
					success: function (oData, response) {
						this._JSONModel.setProperty("/WFNODENAMESet", oData.results, false);
					}.bind(this),
					error: function (oError) {
						this._JSONModel.setProperty("/WFNODENAMESet", [], false);
					}
				};
				this.getOwnerComponent().getModel("WFNODENAME").read("/WFNODENAME", mParameters);
			}.bind(this));
			return promise;
		},

		// onSearch : function() {
		// 	this._JSONModel.setProperty("/appProperties/tBusy", true);
		// 	this._searchWorkflowHead().then(function (oData){
		// 		this._JSONModel.setProperty("/WORKFLOWHEADSet", oData.results, false);
		// 		this._JSONModel.setProperty("/appProperties/tBusy", false);
		// 	}.bind(this), function (oError) {
		// 		this._JSONModel.setProperty("/appProperties/tBusy", false);
		// 	}.bind(this));
		// },
		onSearch: function () {
			var searchParameter = this._JSONModel.getProperty("/searchParameter");
			var aFilter = [];
			if (searchParameter.STARTCOMPANY) {
				aFilter.push(new Filter("STARTCOMPANY", "EQ", searchParameter.STARTCOMPANY));
			}
			if (searchParameter.DOCUMENT) {
				aFilter.push(new Filter("DOCUMENT", "EQ", searchParameter.DOCUMENT));
			}
			if (searchParameter.APPNUM) {
				aFilter.push(new Filter("APPNUM", "EQ", searchParameter.APPNUM));
			}
			if (searchParameter.REQUESTER) {
				aFilter.push(new Filter("REQUESTER", "EQ", searchParameter.REQUESTER));
			}
			this.byId("idTable").getBinding("items").filter(aFilter.length === 0 ? null : aFilter);

			var aSFilter = [];
			var allFilters = 0;
			if (searchParameter.FLOWID ? searchParameter.FLOWID.length !== 0 : false) {
				for (var i = 0; i < searchParameter.FLOWID.length; i++) {
					aSFilter.push(new Filter("FLOWID", "EQ", searchParameter.FLOWID[i]));
				}
				allFilters = new Filter(aSFilter, false);
			}

			this._JSONModel.setProperty("/appProperties/tBusy", true);
			var key = this._JSONModel.getProperty("/key");
			if (key === "submit") {
				this._searchWorkflowS(allFilters);
			} else if (key === "approve") {
				this._searchWorkflowA(allFilters);
			} else {
				this._searchWorkflowEC(allFilters);
			}
		},

		_searchWorkflowS: function (allFilters) {
			var userName = this.getOwnerComponent().getModel().getProperty("/Username");
			// var userName = "ZHANGBING";
			var aFilter = [
				new Filter("REQUESTER", "EQ", userName)
			];
			if (allFilters !== 0) {
				aFilter.push(allFilters);
			}
			var mParameters = {
				filters: aFilter,
				success: function (oData, response) {
					this._JSONModel.setProperty("/WORKFLOWHEADSet", oData.results, false);
					var flag = true;
					for (var i = 0; i < oData.results.length; i++) {
						if (oData.results[i].DOCUMENT.indexOf("PO") === 0 || oData.results[i].DOCUMENT.indexOf("PR") === 0) {
							flag = false;
							break;
						}
					}
					if (flag) {
						this._JSONModel.setProperty("/appProperties/tBusy", false);
					}
					this.setProcessNumber();
				}.bind(this),
				error: function (oError) {
					this._JSONModel.setProperty("/WORKFLOWHEADSet", null, false);
					this._JSONModel.setProperty("/appProperties/tBusy", false);
				}
			};
			this.getOwnerComponent().getModel("WORKFLOWLOG").read("/WORKFLOWHEAD", mParameters);
		},

		_searchWorkflowEC: function (allFilters) {
			var aFilter = [
				new Filter("FLOWID", "EQ", "workflow_ecr"),
				new Filter("FLOWID", "EQ", "workflow_ecn")
			];
			if (allFilters !== 0) {
				aFilter.push(allFilters);
			}
			var mParameters = {
				filters: aFilter,
				success: function (oData, response) {
					this._JSONModel.setProperty("/WORKFLOWHEADSet", oData.results, false);
					this.setProcessNumber();
					this._JSONModel.setProperty("/appProperties/tBusy", false);
				}.bind(this),
				error: function (oError) {
					this._JSONModel.setProperty("/WORKFLOWHEADSet", null, false);
					this._JSONModel.setProperty("/appProperties/tBusy", false);
				}
			};
			this.getOwnerComponent().getModel("WORKFLOWLOG").read("/WORKFLOWHEAD", mParameters);
		},

		_searchWorkflowA: function (allFilters) {
			var userName = this.getOwnerComponent().getModel().getProperty("/Username");
			var aFilter = [
				new Filter("ACCOUNT", "EQ", userName)
			];
			if (allFilters !== 0) {
				aFilter.push(allFilters);
			}
			var mParameters = {
				filters: aFilter,
				urlParameters: {
					"$expand": "toWFItem"
				},
				success: function (oData, response) {
					var head = [];
					var flag;
					var item;
					var bBusy = true;
					for (var i = 0; i < oData.results.length; i++) {
						item = oData.results[i].toWFItem.results;
						if (item.length !== 0) {
							flag = true;
							for (var j = 0; j < head.length; j++) {
								if (head[j].INSTANCEID === oData.results[i].INSTANCEID) {
									flag = false;
									break;
								}
							}
							if (flag) {
								head.push(oData.results[i].toWFItem.results[0]);
								if (oData.results[i].toWFItem.results[0].DOCUMENT.indexOf("PO") === 0 || oData.results[i].toWFItem.results[0].DOCUMENT.indexOf(
										"PR") === 0) {
									bBusy = false;
								}
							}
						}
					}
					this._JSONModel.setProperty("/WORKFLOWHEADSet", head, false);
					if (bBusy) {
						this._JSONModel.setProperty("/appProperties/tBusy", false);
					}
					this.setProcessNumber();
				}.bind(this),
				error: function (oError) {
					this._JSONModel.setProperty("/WORKFLOWHEADSet", null, false);
					this._JSONModel.setProperty("/appProperties/tBusy", false);
				}
			};
			this.getOwnerComponent().getModel("WORKFLOWHEAD").read("/WFHeader", mParameters);
		},

		// onIconTabBarSelect : function(oEvent) {
		// 	var sKey = oEvent.getParameter("key");
		// 	if(sKey !== "all"){
		// 		this.byId("idTable").getBinding("items").filter(new Filter("FLOWID", "EQ", sKey));
		// 	}else{
		// 		this.byId("idTable").getBinding("items").filter(null);
		// 	}
		// },
		onIconTabBarSelect: function (oEvent) {
			this._JSONModel.setProperty("/key", oEvent.getParameter("key"));
			this.onSearch();
		},

		_searchWorkflowHead: function () {
			var promise = new Promise(function (resolve, reject) {
				var mParameters = {
					// filters: aFilter,
					success: function (oData, response) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				};
				this.getOwnerComponent().getModel("WORKFLOWLOG").read("/WORKFLOWHEAD", mParameters);
			}.bind(this));
			return promise;
		},

		onSelectionChange: function (oEvent) {
			// var url = window.location.href.split("#")[0];
			// window.location.href = url + "#MaintainAgent-Display&//AGENT(USERID='JIANGQIN',FLOWID='workflow_materialcreate',SDATE=datetime'2019-11-18T00:00:00.0000000',EDATE=datetime'2019-11-20T00:00:00.0000000')";
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},

		_showDetail: function (oItem) {
			var context = oItem.getBindingContext();
			var item = context.getProperty(context.sPath);
			var details = this._JSONModel.getProperty("/masterProperties");
			var aUrl = details[item.FLOWID].split("-");
			// var sUrl = ;
			// var sField = ;
			if (aUrl[1] !== "assetTransfer") {
				this.getDetailHead(item, aUrl[1]);
				if (aUrl[3]) {
					this.getDetailItem(item, aUrl[3], aUrl[2], aUrl[1]);
				}
				this.getDetailLog(item);
			} else {
				this.getDetailLog(item);
			}
			var bReplace = !Device.system.phone;
			this._JSONModel.setProperty("/document", item.DOCUMENT);
			this._JSONModel.setProperty("/appProperties/layout", "TwoColumnsMidExpanded");
			var toView = details[item.FLOWID].split("-")[0];
			this.getRouter().navTo(toView, bReplace);
		},

		getDetailHead: function (item, url) {
			// url = url + "Header";
			var mParameter = {
				success: function (oData) {
					this._JSONModel.setProperty("/" + url, oData);
				}.bind(this),
				error: function (oError) {
					this._JSONModel.setProperty("/" + url, null);
				}.bind(this)
			};
			var model = url;
			if (model === "PAYHeader" || model === "EXPHeader") {
				url = "Header";
			}
			this.getModel(model).read("/" + url + "('" + item.DOCUMENT + "')", mParameter);
		},

		getDetailItem: function (item, url, field, model) {
			// url = url + "Item";
			var aFilter = [
				new Filter(field, "EQ", item.DOCUMENT)
			];
			var mParameter = {
				filters: aFilter,
				success: function (oData) {
					this._JSONModel.setProperty("/" + url, oData.results);
				}.bind(this),
				error: function (oError) {
					this._JSONModel.setProperty("/" + url, null);
				}.bind(this)
			};
			if (model === "ECN") {
				model = "ECNI";
			}
			if (model === "PAYHeader" || model === "EXPHeader") {
				url = "Items";
			}
			this.getModel(model).read("/" + url, mParameter);
		},

		getDetailLog: function (item) {
			var aFilter = [
				new Filter("STARTCOMPANY", "EQ", item.STARTCOMPANY),
				new Filter("FLOWID", "EQ", item.FLOWID),
				new Filter("INSTANCEID", "EQ", item.INSTANCEID),
				new Filter("DOCUMENT", "EQ", item.DOCUMENT)
			];
			var mParameter = {
				filters: aFilter,
				success: function (oData) {
					this._JSONModel.setProperty("/WORKFLOWLOG", oData.results);
				}.bind(this),
				error: function (oError) {
					this._JSONModel.setProperty("/WORKFLOWLOG", null);
				}.bind(this)
			};
			this.getModel("WORKFLOWLOG").read("/WORKFLOWLOG", mParameter);
		},

		// setProcessNumber : function(){
		// 	var head = this._JSONModel.getProperty("/WORKFLOWHEADSet") ? this._JSONModel.getProperty("/WORKFLOWHEADSet") : [];
		// 	var i = 0;
		// 	var v;
		// 	for(var j = 0; j < head.length; j++){
		// 		head[j].APPNUM = head[j ].DOCUMENT;
		// 		v = head[j].DOCUMENT;
		// 		if(v.indexOf("PO") === 0){
		// 			var purh = this._JSONModel.getProperty("/PURHSet");
		// 			for(i = 0; i < purh.length; i++){
		// 				if(v === purh[i].APPNUM){
		// 					head[j].APPNUM = purh[i].PURORDER_NO;
		// 				}
		// 			}
		// 		}
		// 		if(v.indexOf("PR") === 0){
		// 			var reqh = this._JSONModel.getProperty("/REQHSet");
		// 			for(i = 0; i < reqh.length; i++){
		// 				if(v === reqh[i].APPNUM){
		// 					head[j].APPNUM = reqh[i].PURREQ_NO;
		// 				}
		// 			}
		// 		}
		// 	}
		// 	this._JSONModel.setProperty("/WORKFLOWHEADSet", head);
		// },
		setProcessNumber: function () {
			var head = this._JSONModel.getProperty("/WORKFLOWHEADSet") ? this._JSONModel.getProperty("/WORKFLOWHEADSet") : [];
			this._head = head;
			var v, aFilter, mParameters;
			// var purModel = this.getOwnerComponent().getModel("PURHeader");
			// var reqModel = this.getOwnerComponent().getModel("REQHeader");
			for (var j = 0; j < head.length; j++) {
				// head[j].APPNUM = head[j].DOCUMENT;
				v = head[j].DOCUMENT;
				if (v.indexOf("PO") === 0) {
					aFilter = [
						new Filter("APPNUM", "EQ", v)
					];
					mParameters = {
						filters: aFilter,
						groupId: "getPO",
						// groupId: "getPO",
						success: function (oData) {
							var h = this._head;
							for (var k = 0; k < h.length; k++) {
								if (h[k].DOCUMENT === oData.results[0].APPNUM) {
									this._JSONModel.setProperty("/WORKFLOWHEADSet/" + k + "/APPNUM", oData.results[0].PURORDER_NO);
									break;
								}
							}
							this._JSONModel.setProperty("/appProperties/tBusy", false);
						}.bind(this),
						error: function (oError) {
							this._JSONModel.setProperty("/appProperties/tBusy", false);
						}.bind(this)
					};
					this._purModel.read("/PURHeader", mParameters);
				} else if (v.indexOf("PR") === 0) {
					aFilter = [
						new Filter("APPNUM", "EQ", v)
					];
					mParameters = {
						filters: aFilter,
						groupId: "getPR",
						// groupId: "getPR",
						success: function (oData) {
							var h = this._head;
							for (var k = 0; k < h.length; k++) {
								if (h[k].DOCUMENT === oData.results[0].APPNUM) {
									this._JSONModel.setProperty("/WORKFLOWHEADSet/" + k + "/APPNUM", oData.results[0].PURREQ_NO);
									break;
								}
							}
							this._JSONModel.setProperty("/appProperties/tBusy", false);
						}.bind(this),
						error: function (oError) {
							this._JSONModel.setProperty("/appProperties/tBusy", false);
						}.bind(this)
					};
					this._reqModel.read("/REQHeader", mParameters);
				} else {
					this._JSONModel.setProperty("/WORKFLOWHEADSet/" + j + "/APPNUM", head[j].DOCUMENT);
				}
			}

		},

		getPO: function (v) {
			var promise = new Promise(function (resolve, reject) {
				var mParameter = {
					success: function (oData) {
						this._JSONModel.setProperty("/PURHSet", oData.results);
					}.bind(this),
					error: function (oError) {
						this._JSONModel.setProperty("/PURHSet", []);
					}.bind(this)
				};
				this.getOwnerComponent().getModel("PURHeader").read("/PURHeader", mParameter);
			}.bind(this));
			return promise;
		},

		getPR: function (v) {
			var promise = new Promise(function (resolve, reject) {
				var mParameter = {
					success: function (oData) {
						this._JSONModel.setProperty("/REQHSet", oData.results);
					}.bind(this),
					error: function (oError) {
						this._JSONModel.setProperty("/REQHSet", []);
					}.bind(this)
				};
				this.getOwnerComponent().getModel("REQHeader").read("/REQHeader", mParameter);
			}.bind(this));
			return promise;
		}
	});
});