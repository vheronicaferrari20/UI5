sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/m/MessageToast',
	'App/controller/ConfirmDialog'
], function (Object,JSONModel,dataEvents,MessageToast,ConfirmDialog) {
	"use strict";
	return Object.extend("App.controller.recruitings.VincularRecruitingDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.recruitings.VincularRecruitingDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._legajoInput = sap.ui.getCore().byId('legajoInput');

			this._acceptButton =  sap.ui.getCore().byId('acceptButton');

			this._ConfirmDialog = new ConfirmDialog();


			return this._oDialog;
		},
		
		open : function (oView, recruitingId) {
			
			this._recruitingId = recruitingId;

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			// open dialog
			oDialog.open();

			this.clearForm();

		},

		
		onCloseDialog : function (oEvent) {
			this._getDialog().destroy();
			this._oDialog = undefined;
		},

		onPressAccept : function(oEvent){
			var that = this;
			if (this.validateForm()){
				var legajo = this._legajoInput.getValue();
				this._save(legajo, this._recruitingId);
				
			}
		},

		_save : function(legajo, recruitingId) {
			var that = this;
			
			jQuery.ajax({
				url : PROXY + "/recruiting/" +  recruitingId + "/vincular",
				method : "POST",
				data : {
					legajo : legajo
				},
				success : function(data) {
					that.onCloseDialog();
					MessageToast.show("Vacante Asignada");
				},
				error : function(error){
					that._showErrors(error);
				}
			});
			
		},

		_showErrors : function(res) {
			var msg = "";
			if (res.responseText){
				msg = res.responseText;
			} else {
				msg = "Ha surgido un error";
			}
			MessageToast.show(msg);
		},

		validateForm : function() {
			var result = true;

			if (this._legajoInput.getValue().length == 0 ) {
				result = false;
				this._legajoInput.setValueState("Error");
				this._legajoInput.setValueStateText("Este campo es requerido");
				this._legajoInput.setShowValueStateMessage(true);
			} else {
				this._legajoInput.setValueState("None");
				this._legajoInput.setShowValueStateMessage(false);
			}

			return result;
		},

		clearForm : function() {
			this._legajoInput.setValue("");
			this._legajoInput.setValueState("None");
			this._legajoInput.setShowValueStateMessage(false);
		}

	});
});