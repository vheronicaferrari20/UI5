sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/ui/core/routing/History"
], function (Controller,History) {
	"use strict";
	return Controller.extend("App.controller.NotAuthorized", {
		onNavBack : function (oEvent){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getTargets().display("login");	
		}
	});
});