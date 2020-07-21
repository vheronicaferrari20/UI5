sap.ui.define([
	'sap/m/Button',
	'sap/m/ActionSheet'
], function (Button, ActionSheet) {
	"use strict";
	function goToOpportunity(oEvent, oController, element) {
		var oItem = oEvent.getSource();
		var path = oItem.getBindingContext("NotificacionesModel").getPath();
		var data = oController._NotificacionesModel.getProperty(path);
		
		new Promise(function(resolve, reject){
			jQuery.ajax({
				//url : PROXY + "/opportunitySalesforce/"+data.datos.opportunityId+"/opportunityLineItems",  // Se comenta para pruebas
				url : 'http://api.grupoassa.com:1337/opportunitySalesforce/'+ data.datos.opportunityId +'/opportunityLineItems', //-->Test Vero
				method : "GET",
				dataType : "JSON",
				success : function(opportunityLineItems){
					resolve(opportunityLineItems);
				},
				error : function() {
					reject();
				}
			});
		}).
		then(function(opportunityLineItems){
			if (opportunityLineItems.length == 0) {
				// no tiene OpportunityLineItem
				oController._oRouter.navTo("requirements_detail_without_oli", 
				{
					opportunityId : data.datos.opportunityId
				});
			} else if (opportunityLineItems.length == 1) {
				// tiene unicamente una OpportunityLineItem
				oController._oRouter.navTo("requirements_detail", 
				{
					opportunityId : data.datos.opportunityId,
					opportunityLineItemId : opportunityLineItems[0].Id
				});
			} else {
				// tiene mas de una OpportunityLineItem
				// ofrecer listado action sheet
				var buttons = [];
				jQuery.each(opportunityLineItems, function(i, oli){
					buttons.push({
						text : oli.Platform__c + " " + oli.ServiceType__c,
						press : function(oEvent){
							oController._oRouter.navTo("requirements_detail", 
							{
								opportunityId : data.datos.opportunityId,
								opportunityLineItemId : oli.Id
							});
						}
					});
				});
				
				var actionSheet = new ActionSheet({
					buttons : buttons,
					placement : 'Auto'
				});
				actionSheet.attachAfterClose(function(){
					actionSheet.destroy();
				});
				oController.getView().addDependent(actionSheet);
				actionSheet.openBy(element);
			}

		});

	}
	return {

		generate : function(oController) {
			var button = new Button({
					textDirection: 'LTR',
					type : 'Emphasized',
					icon : 'sap-icon://shortcut'
				});

			button.attachPress(function(oEvent){
				return goToOpportunity(oEvent, oController, button);
			});

			button.addStyleClass("minButton");
			return button;
		},

		go : function(oEvent, oController) {
			return goToOpportunity(oEvent, oController, oEvent.getSource());
		}
		
	};
});