sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'App/model/formatter'
	], function(Controller,dataEvents,formatter) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeeFormComentarios", {
		
		formatter : formatter,

		onInit : function() {
			this._radioButtonViaja = this.getView().byId('radioButtonViaja');
			this._radioButtonNoViaja = this.getView().byId('radioButtonNoViaja');
		},

		onBeforeRendering : function() {
			this._Model = this.getView().getModel('EmployeeModel');
		},

		onPostComentario : function(oEvent) {
			var that = this;
			jQuery.ajax({
				//url : PROXY + '/employee/' + this._Model.getProperty('/data/codEmpleado') + '/comentarios', //-->Se comenta para test-Vero
				url : 'http://api.grupoassa.com:1337/employee/' + this._Model.getProperty('/data/codEmpleado') + '/comentarios', 
				method : 'POST',
				dataType : 'JSON',
				data : { nota : oEvent.getParameter('value')}
			});
		}		
	});
});
