sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/ui/core/routing/History"

], function (Controller,History) {
	"use strict";
	return Controller.extend("App.controller.NotFound", {
		onInit: function () {
			
			
			
		},
		// override the parent's onNavBack (inherited from BaseController)
		onNavBack : function (oEvent){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("home", true);
			}
			
			
		}
	});
});