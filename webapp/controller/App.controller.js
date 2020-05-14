sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("report.WorkFlowReport.controller.App", {
		onInit: function () {
			this.getView().addStyleClass("sapUiSizeCompact");
		}
	});
});