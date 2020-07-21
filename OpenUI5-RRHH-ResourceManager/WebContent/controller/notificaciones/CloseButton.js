sap.ui.define([
	'sap/m/Button'
], function (Button) {
	"use strict";
	return {

		generate : function(oController, listItem) {
			var closeButton = new Button({
			    					textDirection: 'LTR',
			    					type : 'Transparent',
			    					icon : 'sap-icon://decline',
			    					iconDensityAware:false,
			    					visible : '{= !${/hideCloseButton}}',
			    					class : 'minButton',
			    					press : function(oEvent){
			    						var oItem = oEvent.getSource();
										var path = oItem.getBindingContext("NotificacionesModel").getPath();
										var data = oController._NotificacionesModel.getProperty(path);
										jQuery.ajax({
											//url : PROXY + '/notificacion/marcarVisto', // Se comenta para pruebas
											url : 'http://api.grupoassa.com:1337/notificacion/marcarVisto', //-->Test Vero
											method : 'POST',
											data : {
												id : data.id
											},
											success : function(){
												$(listItem.getDomRef()).hide();
												oController.getOwnerComponent().updateCountModel('-');
												oController.updateCountDeleted();
											}
										});
										
									}
			    				});
			closeButton.addStyleClass("minButton");
			return closeButton;
		}
		
	};
});