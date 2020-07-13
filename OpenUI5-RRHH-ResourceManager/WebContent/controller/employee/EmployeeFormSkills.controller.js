sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/data/dataEvents',
		'App/controller/employee/EmployeeFormSkillsFormDialog',
		'App/controller/ConfirmDialog',
		'sap/m/MessageToast'
		
	], function(Controller,dataEvents, EmployeeFormSkillsFormDialog, ConfirmDialog, MessageToast) {
	"use strict";

	return Controller.extend("App.controller.employee.EmployeeFormSkills", {
		
		onInit : function() {

			this._Table = this.getView().byId('idiomasList');

			this._ConfirmDialog = new ConfirmDialog();

			this._ModelName = 'EmployeeModel';

			this._SkillsFormDialog = new EmployeeFormSkillsFormDialog();

			this._deleteButton = this.getView().byId('deleteIdioma');
		},

		onBeforeRendering : function(){
			this._Model = this.getView().getModel(this._ModelName);
		},

		addSkill : function(oEvent){
			this._SkillsFormDialog.open(this.getView());
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
			var codEmpleado = this._Model.getProperty('/data').codEmpleado;
			var that = this;
			console.log("data",data);
			this._deleteButton.setEnabled(false);
			this._ConfirmDialog.open(
				'Confirm',
				'Ud esta seguro que desea eliminar este Skill',
				function(){
					jQuery.ajax({
						url : PROXY + '/myKKnowPracticeModuleConsultants/'+ data.ID,
						method : 'DELETE',
						success : function(data){
							that._Table.removeSelections(true);
							MessageToast.show("Skill eliminado con exito");
						},
						error : function(err){
							MessageToast.show("No fue posible eliminar este Skill");
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