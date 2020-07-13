sap.ui.define([
		'sap/m/NotificationListItem',
		'App/controller/notificaciones/CloseButton',
		'App/controller/notificaciones/GoOpportunityFromSalesforceNotificationButton'
	], function(NotificationListItem, CloseButton, GoOpportunityFromSalesforceNotificationButton) {
	"use strict";
	return sap.ui.jsfragment("App.view.notificaciones.OpportunityStage", {
		
		createContent: function(oController ) {
			
			var that = this;
			var listItem = new NotificationListItem({
			    			title : 'Oportunidad Stage',
			    			press : function(oEvent){
			    				return GoOpportunityFromSalesforceNotificationButton.go(oEvent,oController)
			    			},
			    			unread : true,
			    			authorPicture : "sap-icon://opportunity",
			    			description :  'La oportunidad {NotificacionesModel>datos/opportunityName} cliente {NotificacionesModel>datos/opportunityAccountName} cambio de la etapa {NotificacionesModel>datos/opportunityOldStage} a {NotificacionesModel>datos/opportunityNewStage}.',
			    			priority : { path : 'NotificacionesModel>level',  formatter : oController.formatter.notificationLevel	},
			    			datetime : { path : 'NotificacionesModel>createdAt',  formatter : oController.formatter.formatDateTimeComentarios	},
			    			showCloseButton : false
			    		});
			listItem.addStyleClass('cursor-pointer-notification');
			listItem.addButton(CloseButton.generate(oController, listItem));
			return listItem;
		} 
	})



	
});
