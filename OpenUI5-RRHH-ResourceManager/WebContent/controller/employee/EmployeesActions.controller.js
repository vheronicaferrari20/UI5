sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'sap/ui/model/json/JSONModel',
		'App/controller/employee/EmployeesViewSettingsDialog',
		'App/model/employee'
		
	], function(Controller,dataEvents,JSONModel,EmployeesViewSettingsDialog, employeeModel) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesActions", {
		
		onInit : function() {

			this._ModelName = "EmployeesModel";
			
			this._ViewSettingsDialog = this.getOwnerComponent().getEmployeesViewSettingsDialog();

			this._Model = employeeModel.getModel();

			this._infoFilterBar = this.getView().byId("infoFilterBar");

			this._infoFilterLabelTotal = this.getView().byId("infoFilterLabelTotal");
			
			this._infoFilterLabel = this.getView().byId("infoFilterLabel");

			this.getView().setModel(this._Model,this._ModelName);

			this._serchField = this.getView().byId("serchField");

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.search_employee_actions.channel, dataEvents.search_employee_actions.name,this.onSuscribeSearch, this);
			this._eventBus.subscribe(dataEvents.update_viewsettings_employees.channel, dataEvents.update_viewsettings_employees.name,this.onSuscribeUpdateViewsettings, this);
			this._eventBus.subscribe(dataEvents.employee_binding.channel, dataEvents.employee_binding.name,this.onSuscribeBinding, this);
		},

		onSuscribeUpdateViewsettings : function(channel, event, data){

			this._infoFilterLabel.setText(data.filterString);

		},

		onSuscribeBinding : function(channel, event, data) {
			
			this._infoFilterLabelTotal.setText("Total ("+data.aIndices.length +")"); // Comentado para testing-Vero

		},

		onSuscribeSearch : function(channel, event, data) {

			this._serchField.setValue(data.sQuery);

		},
		
		onPressConfig : function(oEvent){
			
			this._ViewSettingsDialog.open(this.getView());

		},

		onPressRefresh : function(oEvent){

			this._eventBus.publish(
				dataEvents.refresh_employee_actions.channel,
				dataEvents.refresh_employee_actions.name);
			this._infoFilterLabelTotal.setText("Total ("+data.aIndices.length +")");

		},

		onDataExport : function(oEvent) {

			this._eventBus.publish(
				dataEvents.export_employee_actions.channel,
				dataEvents.export_employee_actions.name);

		},

		onSearch : function (oEvt) {

			this._eventBus.publish(
				dataEvents.search_employee_actions.channel,
				dataEvents.search_employee_actions.name,
				{
					sQuery : oEvt.getSource().getValue()
				});

		}
        
	
	});
});
