sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'sap/ui/model/json/JSONModel',
		'App/controller/employee/EmployeesViewSettingsDialog'
		
	], function(Controller,dataEvents,JSONModel,EmployeesViewSettingsDialog) {
	"use strict";

	return Controller.extend("App.controller.employee.Employees", {
		
		onInit : function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("resources").attachPatternMatched(this._onObjectMatched, this);
			this._eventBus = sap.ui.getCore().getEventBus();
		},
		
		_onObjectMatched : function() {
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"resources"});
		},

	
	});
});
