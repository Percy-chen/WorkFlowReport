sap.ui.define([
		"sap/ui/base/Object",
		"sap/ui/model/Sorter"
], function(Object, Sorter) {
	"use strict";

	return Object.extend("report.WorkFlowReport.controller.viewSettingDialog", {

		constructor : function(oParentView, tableid) {
			this._oParentView = oParentView;
			this._oTable = this._oParentView.getController().byId(tableid);
			this._oViewModel = this._oParentView.getModel();
			this._ResourceBundle = this._oParentView.getModel("i18n").getResourceBundle();
		},

		openDialog : function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(this._oParentView.getId(),
						"report.WorkFlowReport.view.viewSettingDialog", this);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this._oParentView, this._oDialog);
				this._oParentView.addDependent(this._oDialog);
			}
			this._oDialog.destroySortItems();
			this.createItems();
			this._oDialog.open();
		},
		//动态抓取table表头为list选项
		createItems : function(table) {
			var oColumns = this._oTable.getColumns();
			if (this._oTable.getItems()[0]) {
				var oCells = this._oTable.getItems()[0].getCells();
				for (var i = 0; i < oColumns.length; i++) {
					var oColumnParts = oColumns[i].getHeader().getBindingInfo(
							"text").parts;
					var oCell = oCells[i];

					for (var j = 0; j < oColumnParts.length; j++) {

						var path = (oCell.getBindingInfo("title") || oCell.getBindingInfo("text")).parts[j].path;
						var ptext = this._ResourceBundle.getText(oColumnParts[j].path);
						
						var oSortItem = new sap.m.ViewSettingsItem({
							key : path,
							text : ptext
						});
						if (j == 0 && i == 0){
							oSortItem.setSelected(true);
						}
						this._oDialog.addSortItem(oSortItem);
					}
				}
			}
		},

		handleConfirm : function(oEvent) {
			var oBinding = this._oTable.getBinding("items");
			// var oView = this.getView();
			var mParams = oEvent.getParameters();
			var aSorters = [];
			var sPath = mParams.sortItem.getKey();
			var bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);
		}

	});

});