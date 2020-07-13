sap.ui.define([
	'sap/m/Button'
], function (Button) {
	"use strict";
	function goToOpportunity(oEvent, oController) {
		var oItem = oEvent.getSource();
		var path = oItem.getBindingContext("NotificacionesModel").getPath();
		var data = oController._NotificacionesModel.getProperty(path);
		if (data.datos.opportunityLineItemId) {
			oController._oRouter.navTo("requirements_detail_asignacion", 
				{
					opportunityId : data.datos.opportunityId,
					opportunityLineItemId : data.datos.opportunityLineItemId,
					asignacionId : data.datos.asignacionId
				});
		} else {
			oController._oRouter.navTo("requirements_detail_asignacion_without_oli", 
				{
					opportunityId : data.datos.opportunityId,
					asignacionId : data.datos.asignacionId
				});
		}
	}
	return {

		generate : function(oController) {
			var button = new Button({
					textDirection: 'LTR',
					type : 'Emphasized',
					icon : 'sap-icon://shortcut',
					press : function(oEvent){
						return goToOpportunity(oEvent, oController);
					}
				});
			button.addStyleClass("minButton");
			return button;
		},

		go : function(oEvent, oController) {
			return goToOpportunity(oEvent, oController);
		}
		
	};
});