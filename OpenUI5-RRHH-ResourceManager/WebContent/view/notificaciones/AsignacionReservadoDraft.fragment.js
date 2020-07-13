sap.ui.define([
		'sap/m/NotificationListItem',
		'App/controller/notificaciones/CloseButton',
		'App/controller/notificaciones/GoOpportunityButton'
	], function(NotificationListItem, CloseButton, GoOpportunityButton) {
	"use strict";
	return sap.ui.jsfragment("App.view.notificaciones.AsignacionReservadoDraft", { 
		createContent: function(oController ) {
			
			var listItem = new NotificationListItem({
			    			title : 'Candidato Reservado Cancelado',
			    			press : function(oEvent){
			    				return GoOpportunityButton.go(oEvent,oController)
			    			},
			    			unread : true,
			    			authorPicture : "sap-icon://company-view",
			    			description :  '{NotificacionesModel>user} ha cancelado la reserva para {NotificacionesModel>datos/vCandidato} para la oportunidad {NotificacionesModel>datos/opportunityAccountName}\n FLOW : RESERVADO -> DRAFT',
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
