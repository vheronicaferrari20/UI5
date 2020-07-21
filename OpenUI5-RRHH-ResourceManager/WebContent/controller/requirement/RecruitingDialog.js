sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast) {
	"use strict";
	return Object.extend("App.controller.requirement.RecruitingDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.RecruitingDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			
			this._tipoRecruitingSelect = sap.ui.getCore().byId('tipoRecruitingSelect');

			return this._oDialog;
		},

		
		open : function (oView, asignacionId) {
			this._eventBus = sap.ui.getCore().getEventBus();

			this._asignacionId  = asignacionId;
			
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

			var that = this;

			jQuery.ajax({
				//url : PROXY + '/asignacion/' + this._asignacionId + '/generarRecruitingDraft',  //-->Se comenta para test- Vero
				url : 'http://api.grupoassa.com:1337/asignacion/'+ this._asignacionId + '/generarRecruitingDraft',  // --->Test Vero
				method : 'POST',
				data : {
					tipoRecruiting : this._tipoRecruitingSelect.getSelectedKey()
				},
				success : function(data) {
					that.onCloseDialog();
				},
				error : function(error) {
					alert("ERROR");
				}
			});
		}
	});
});