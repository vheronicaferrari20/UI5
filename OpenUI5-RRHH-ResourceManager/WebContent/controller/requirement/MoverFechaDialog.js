sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast) {
	"use strict";
	return Object.extend("App.controller.requirement.MoverFechaDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.MoverFechaDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			
			this._cantidadDiasInput = sap.ui.getCore().byId('cantidadDiasInput');

			return this._oDialog;
		},

		
		open : function (oView, opportunityId, opportunityLineItemId) {
			this._eventBus = sap.ui.getCore().getEventBus();

			this._opportunityId  = opportunityId;
			this._opportunityLineItemId = opportunityLineItemId;
			
			var oDialog = this._getDialog();

			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			// open dialog
			oDialog.open();
		},
		
		onCloseDialog : function (oEvent) {
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		onPressAcept : function(oEvent){
			if (this.validarForm()){
				var that = this;

				jQuery.ajax({
					//url : PROXY + '/asignacionCambioFechaByOpportunity',  //-->Se comenta para test- Vero
					url : 'http://api.grupoassa.com:1337/asignacionCambioFechaByOpportunity',  // --->Test Vero
					method : 'POST',
					dataType : 'JSON',
					data : {
						opportunity : this._opportunityId,
						opportunityLineItemId : this._opportunityLineItemId,
						cantDias : this._cantidadDiasInput.getValue()
					},
					success : function(data) {
						that.onCloseDialog();
					},
					error : function(error) {
						alert("ERROR");
					}
				});

			}

			
		},

		validarForm : function() {
			var result = true;
			var value = this._cantidadDiasInput.getValue().trim();
			if (value.length == 0 ) {
				result = false;
				this._cantidadDiasInput.setValueState("Error");
				this._cantidadDiasInput.setValueStateText("Este campo es requerido");
				this._cantidadDiasInput.setShowValueStateMessage(true);
			} else if( ! parseInt(value)) {
				result = false;
				this._cantidadDiasInput.setValueState("Error");
				this._cantidadDiasInput.setValueStateText("Ingrese un valor valido");
				this._cantidadDiasInput.setShowValueStateMessage(true);
			} else {
				this._cantidadDiasInput.setValueState("None");
				this._cantidadDiasInput.setShowValueStateMessage(false);
			}

			return result;
		}

		

	});
});