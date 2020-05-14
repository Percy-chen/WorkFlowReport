sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"report/WorkFlowReport/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("report.WorkFlowReport.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// this.oListSelector = new ListSelector();
			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createLocalModel());
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			//获取当前用户User Name
			var that = this;
			this.getModel("userAttributes").attachRequestCompleted(function (oEvent) {
				var userAttributes = this.getData();
				that.getModel().setProperty("/Username", userAttributes.name);
				
				var sPath = "/EMPLOYEES" + "('" + userAttributes.name + "')";
				var mParameters = {
					success: function (oData) {
						var v = oData.DEPARTMENT ? oData.DEPARTMENT : "";
						var ecVis = false;
						if(v.indexOf("研") !== -1 || v.indexOf("企") !== -1){
							ecVis = true;
						}
						that.getModel().setProperty("/ECVis", ecVis);
					}
				};
				that.getModel("EMPLOYEES").read(sPath, mParameters);
				
			});
			
			// enable routing
			this.getRouter().initialize();
		}
	});
});