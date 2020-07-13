sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/m/MessageToast'
], function (Object,JSONModel,dataEvents,MessageToast) {
	"use strict";
	return Object.extend("App.controller.employee.EmployeeIdiomaFormDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.employee.EmployeeIdiomaFormDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._idiomaSelect = sap.ui.getCore().byId('idiomaSelect');
			this._nivelRating = sap.ui.getCore().byId('nivelRating');

			
			this._acceptButton =  sap.ui.getCore().byId('acceptButton');


			return this._oDialog;
		},
		
		open : function (oView) {

			this._codEmpleado = oView.getModel('EmployeeModel').getProperty('/data').codEmpleado;

			var employeeIdiomas = oView.getModel('EmployeeModel').getProperty('/data').idiomas;

			var idiomas = oView.getModel('IdiomaMasterModel').getData();

			var IdiomasModel = new JSONModel();

			
			for (var j = 0; j < idiomas.length; j++) {
				idiomas[j].visible = true;
			}
			
			for (var i = 0; i < employeeIdiomas.length; i++) {
				for (var j = 0; j < idiomas.length; j++) {
					if (employeeIdiomas[i].idioma == idiomas[j].id) {
						idiomas[j].visible = false;
					}
				}
			}

			IdiomasModel.setData(idiomas);
			
			this.id = undefined;

			var oDialog = this._getDialog();

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Nuevo Idioma");
			this._acceptButton.setText("Enviar");

			// open dialog
			oDialog.open();

			oDialog.setModel(IdiomasModel, 'IdiomasModel');

			this.clearForm();

		},

		openToEdit : function (oView, data) {
			this.id = data.id;

			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Actualizar Idioma");
			this._acceptButton.setText("Actualizar");

			// open dialog
			oDialog.open();

			oDialog.setModel(oView.getModel('IdiomaMasterModel'), 'IdiomasModel');

			this.clearForm();
			
			this._idiomaSelect.setSelectedKey(data.idioma);
			this._idiomaSelect.setEnabled(false);
			this._nivelRating.setValue(data.level);

		},
		
		onCloseDialog : function (oEvent) {
			this._getDialog().destroy();
			this._oDialog = undefined;
		},

		onPressAccept : function(oEvent){
			if (this.validateForm()){
				var that = this;
				if (this.id === undefined) {
					// CREATE
					jQuery.ajax({
						url : PROXY + "/idiomaxemployee",
						method : "POST",
						dataType : "JSON",
						data : {
							employee : that._codEmpleado,
							idioma : that._idiomaSelect.getSelectedKey(),
							level : that._nivelRating.getValue()
						},
						success : function(data) {
							that.onCloseDialog();
							MessageToast.show("Idioma agregado con exito!!!");
						},
						error : function(error){
							MessageToast.show("ERROR");
						}
					});
				} else {
					//UPDATE
					jQuery.ajax({
						url : PROXY + "/idiomaxemployee/" + that.id,
						method : "PUT",
						dataType : "JSON",
						data : {
							level : that._nivelRating.getValue()
						},
						success : function(data) {
							that.onCloseDialog();
							MessageToast.show("Idioma actualizado con exito!!!");
						},
						error : function(error){
							MessageToast.show("ERROR");
						}
					});
				}
				

			}
		},

		validateForm : function() {
			var result = true;

			if (! this._idiomaSelect.getSelectedKey()) {
				result = false;
				MessageToast.show("Eleccione un Idioma por favor.")
			} 

			return result;
		},

		clearForm : function() {
			this._nivelRating.setValue(0);
		}

	});
});