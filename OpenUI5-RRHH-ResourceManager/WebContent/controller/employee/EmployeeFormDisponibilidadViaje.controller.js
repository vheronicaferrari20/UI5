sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeeFormDisponibilidadViaje", {
		
		onInit : function() {
			this._radioButtonViaja = this.getView().byId('radioButtonViaja');
			this._radioButtonNoViaja = this.getView().byId('radioButtonNoViaja');
		},

		onBeforeRendering : function() {
			this._Model = this.getView().getModel('EmployeeModel');
		},

		
		onSelectViaja : function(oEvent) {
			var value = oEvent.getParameters().selected;
			if (value) {
				this._createOrUpdateViaja(true);
			}

		},

		onSelectNoViaja : function(oEvent) {
			var value = oEvent.getParameters().selected;
			if (value) {
				this._createOrUpdateViaja(false);
			}
		},

		_createOrUpdateViaja : function(value){
			var that = this;
			jQuery.ajax({
				url : PROXY + '/employeeViaja',
				method : 'POST',
				dataType : 'JSON',
				data  : {
					value : value,
					employee : this._Model.getProperty('/data/codEmpleado')
				},
				success : function(data){

				},
				error : function(error){
					console.log(error);
				}
			});
		},

		// formatters
		toViaja : function(value) {
			return (value);
		},

		toNoViaja : function(value) {
			return (value === false);
		}

	});
});
