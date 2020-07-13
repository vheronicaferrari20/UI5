sap.ui.define([
		'sap/m/NotificationListItem',
		'App/controller/notificaciones/CloseButton',
		'App/controller/notificaciones/GoOpportunityFromSalesforceNotificationButton'
	], function(NotificationListItem, CloseButton, GoOpportunityFromSalesforceNotificationButton) {
	"use strict";
	return sap.ui.jsfragment("App.view.notificaciones.OpportunityCommittedCancel", { 
		createContent: function(oController ) {
			
			var listItem = new NotificationListItem({
			    			title : 'Oportunidad Committed Cancelado',
			    			press : function(oEvent){
			    				return GoOpportunityFromSalesforceNotificationButton.go(oEvent,oController)
			    			},
			    			unread : true,
			    			authorPicture : "sap-icon://opportunity",
			    			description :  'Se ha cancelado el Committed a la oportunidad {NotificacionesModel>datos/opportunityName} cliente {NotificacionesModel>datos/opportunityAccountName}.',
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
