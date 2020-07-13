sap.ui.define([
		'sap/m/NotificationListItem',
		'App/controller/notificaciones/CloseButton',
		'App/controller/notificaciones/GoOpportunityFromSalesforceNotificationButton'
	], function(NotificationListItem, CloseButton, GoOpportunityFromSalesforceNotificationButton) {
	"use strict";
	return sap.ui.jsfragment("App.view.notificaciones.NuevaOpportunity", { 
		createContent: function(oController ) {
			
			var listItem = new NotificationListItem({
			    			title : 'Nueva Oportunidad',
			    			press : function(oEvent){
			    				return GoOpportunityFromSalesforceNotificationButton.go(oEvent,oController)
			    			},
			    			unread : true,
			    			authorPicture : "sap-icon://opportunity",
			    			description :  'Se ha creado la oportunidad {NotificacionesModel>datos/opportunityName} cliente {NotificacionesModel>datos/opportunityAccountName}',
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
