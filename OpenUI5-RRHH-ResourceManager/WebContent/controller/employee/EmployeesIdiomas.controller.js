sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'App/controller/employee/EmployeeIdiomaFormDialog',
		'App/controller/ConfirmDialog'
		
	], function(Controller,dataEvents, EmployeeIdiomaFormDialog, ConfirmDialog) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeesIdiomas", {
		
		onInit : function() {

			this._Table = this.getView().byId('idiomasList');

			this._ConfirmDialog = new ConfirmDialog();

			this._ModelName = 'EmployeeModel';

			this._EmployeeIdiomaFormDialog = new EmployeeIdiomaFormDialog();

			this._deleteButton = this.getView().byId('deleteIdioma');

		},

		onBeforeRendering : function(){
			this._Model = this.getView().getModel(this._ModelName);
		},

		addIdioma : function(oEvent){
			this._EmployeeIdiomaFormDialog.open(this.getView());
		},

		onPressIdioma : function(oEvent){
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			this._EmployeeIdiomaFormDialog.openToEdit(this.getView(),data);
		},

		onSelectionChangeTable : function(oEvent){
			this._deleteButton.setEnabled(true);
		},

		onPressDelete : function(oEvent){
			var oItem = this._Table.getSelectedItem();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			var that = this;
			
			this._deleteButton.setEnabled(false);
			this._ConfirmDialog.open(
				'Confirm',
				'Ud esta seguro que desea eliminar este Idioma',
				function(){
					jQuery.ajax({
						//url : PROXY + '/idiomaxemployee/' + data.id,//--->Se comenta para testing-Vero
						url:'http://api.grupoassa.com:1337/idiomaxemployee/' + data.id,
						method : 'DELETE',
						dataType : 'JSON',
						success : function(data){
							that._Table.removeSelections(true);
						},
						error : function(err){
							alert("Error");
						}
					});
				},
				function(){
					that._Table.removeSelections(true);
				}
				);
		},
	
	});
});