sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/m/MessageToast'
], function (Object,JSONModel,dataEvents,MessageToast) {
	"use strict";
	return Object.extend("App.controller.idioma.IdiomaFormDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.idioma.IdiomaFormDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			
			this._idiomaInput = sap.ui.getCore().byId('idiomaInput');
			this._acceptButton =  sap.ui.getCore().byId('acceptButton');


			return this._oDialog;
		},
		
		open : function (oView) {
			this.id = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Nuevo Idioma");
			this._acceptButton.setText("Enviar");

			// open dialog
			oDialog.open();

			this.clearForm();

		},

		openToEdit : function (oView, data) {
			this.id = data.id;

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Actualizar Idioma");
			this._acceptButton.setText("Actualizar");

			// open dialog
			oDialog.open();

			this.clearForm();

			this._idiomaInput.setValue(data.name);

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
						//url : PROXY + "/idioma", // Se comenta para pruebas- Vero
						url : 'http://api.grupoassa.com:1337/idioma',  // ---> Test Vero
						method : "POST",
						dataType : "JSON",
						data : {
							name : that._idiomaInput.getValue()
						},
						success : function(data) {
							that._eventBus.publish(dataEvents.add_idioma.channel,dataEvents.add_idioma.name,{});
							that.onCloseDialog();
							MessageToast.show("Idioma creado con exito!!!");
						},
						error : function(error){
							MessageToast.show("ERROR");
						}
					});
				} else {
					//UPDATE
					jQuery.ajax({
						//url : PROXY + "/idioma/" + that.id, // Se comenta para pruebas- Vero
						url : 'http://api.grupoassa.com:1337/idioma' + that.id,  // ---> Test Vero
						method : "PUT",
						dataType : "JSON",
						data : {
							name : that._idiomaInput.getValue()
						},
						success : function(data) {
							that._eventBus.publish(dataEvents.update_idioma.channel,dataEvents.update_idioma.name,{});
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

			if (this._idiomaInput.getValue().length == 0 ) {
				result = false;
				this._idiomaInput.setValueState("Error");
				this._idiomaInput.setValueStateText("Este campo es requerido");
				this._idiomaInput.setShowValueStateMessage(true);
			} else {
				this._idiomaInput.setValueState("None");
				this._idiomaInput.setShowValueStateMessage(false);
			}

			return result;
		},

		clearForm : function() {
			this._idiomaInput.setValue("");
			this._idiomaInput.setValueState("None");
			this._idiomaInput.setShowValueStateMessage(false);
		}

	});
});