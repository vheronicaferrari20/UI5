sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents'
], function (Object,JSONModel,dataEvents) {
	"use strict";
	return Object.extend("App.controller.resource.ResourcesDialog", {
		_getDialog : function () {
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.resource.ResourcesDialog", this);
			}
			return this._oDialog;
		},
		
		open : function (oView) {
			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			// open dialog
			oDialog.open();
		},
		
		handleClose : function(oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var fullName;
			if (aContexts && aContexts.length) {
				fullName = oEvent.getSource().getBinding("items").getModel().getProperty(aContexts[0].sPath).fullName;	
				this._eventBus.publish(dataEvents.select_resource.channel,dataEvents.select_resource.name,{fullName : fullName});
			}
			oEvent.getSource().getBinding("items").filter([]);


			
		}

	});
});