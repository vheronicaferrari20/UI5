sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'sap/ui/core/routing/History'
		
	], function(Controller, JSONModel, dataEvents,History) {
	"use strict";

	return Controller.extend("App.controller.resource.ResourcesForm", {
		
		onInit : function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("resources_form").attachPatternMatched(this._onObjectMatched, this);
			this._eventBus = sap.ui.getCore().getEventBus();
		},
		
		_onObjectMatched : function(oEvent) {
			
			
			var sPath = "/ResourcesCollection/" +  oEvent.getParameter("arguments").id;
			
			var oModel = this.getView().getModel().getProperty(sPath);
			
			this.getOwnerComponent().setModel(new JSONModel(oModel),"ResourceModel");
			
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"resources"});
		},
	
		onBack : function () {
			sap.ui.core.routing.Router.getRouter("AppRouter").onBack();
		}
	
	});
});