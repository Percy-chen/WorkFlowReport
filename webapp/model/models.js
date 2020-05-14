sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		createLocalModel : function(){
			var localData = {
				key : "submit",
				Username : "",
				appProperties : {
					busy : false,
					tBusy : false,
					layout : "OneColumn",
					fullScreen : false,
					previousLayout : ""
				},
				masterProperties : {
					workflow_materialcreate : "matDetail-MATHeader-APPNUM-MATItem",
					materialapplyreturn : "marDetail-MARHeader-APPNUM-MARItem",
					PPECR01 : "ecrDetail-ECRHeader-ECRNO-ECRItem",
					PPECN01 : "ecnDetail-ECN-ECNNO-ECNI",
					workflow_materialexpansion : "maeDetail-MATHeader-APPNUM-MATItem",
					workflow_materialchange : "macDetail-MATHeader-APPNUM-MATItem",
					workflow_receipt : "recDetail-RECEIPT-FLOW",
					workflow_receiptclear : "cleDetail-CLEHeader-FLOW-CLEItem",
					workflow_payment : "payDetail-PAYHeader-APPNUM-PAYItems",
					workflow_expense : "expDetail-EXPHeader-APPNUM-EXPItem",
					workflow_salescredit : "creDetail-SOCREDIT-FLOW",
					purchaseorder : "ordDetail-PURHeader-APPNUM-PURItem",
					purchaseapply : "reqDetail-REQHeader-APPNUM-REQItem",
					workflow_ecr : "ecrDetail-ECRHeader-ECRNO-ECRItem",
					workflow_ecn : "ecnDetail-ECN-ECNNO-ECNI",
					assettransfer : "assetDetail-assetTransfer-FLOW"
				},
				searchParameter : {
					
				}
			};
			var oModel = new JSONModel(localData);
			return oModel;
		}

	};
});