sap.ui.define([
		'sap/m/NotificationListItem',
		'App/controller/notificaciones/CloseButton',
		'App/controller/notificaciones/GoOpportunityFromSalesforceNotificationButton'
	], function(NotificationListItem, CloseButton, GoOpportunityFromSalesforceNotificationButton) {
	"use strict";
	return sap.ui.jsfragment("App.view.notificaciones.OpportunityCommitted", { 
		createContent: function(oController ) {
			

			var listItem = new NotificationListItem({
			    			title : 'Oportunidad en Committed',
			    			press : function(oEvent){
			    				return GoOpportunityFromSalesforceNotificationButton.go(oEvent,oController)
			    			},
			    			unread : true,
			    			authorPicture : "sap-icon://opportunity",
			    			description :  'La oportunidad {NotificacionesModel>datos/opportunityName} para el cliente {NotificacionesModel>datos/opportunityAccountName} esta Committed.',
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
