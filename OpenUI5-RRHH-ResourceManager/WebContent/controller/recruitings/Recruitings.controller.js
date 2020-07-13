sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents'
		
	], function(Controller,dataEvents) {
	"use strict";

	return Controller.extend("App.controller.recruitings.Recruitings", {
		
		onInit : function() {
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("recruitings").attachPatternMatched(this._onObjectMatched, this);
			this._eventBus = sap.ui.getCore().getEventBus();
		},
		
		_onObjectMatched : function() {
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"recruitings"});
		}
	
	});
});