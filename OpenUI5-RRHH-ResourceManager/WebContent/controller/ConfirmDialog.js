sap.ui.define([
	"sap/ui/base/Object",
	'sap/m/Button',
	'sap/m/Dialog',
	'sap/m/Text'
], function (Object,Button,Dialog,Text) {
	"use strict";
	return Object.extend("App.controller.ConfirmDialog", {
		open: function (
				title,
				message,
				fnCallbackAccept,
				fnCallbackReject
			) {
			var dialog = new Dialog({
				title: title,
				type: 'Message',
				content: new Text({ text: message }),
				beginButton: new Button({
					type :'Accept',
					text: (typeof fnCallbackAccept === 'function') ? 'Aceptar' : 'Ok',
					press: function () {
						if (typeof fnCallbackAccept === 'function'){
							fnCallbackAccept();
						}
						dialog.close();
					}
				}),
				endButton: new Button({
					type: 'Reject',
					text: 'Cancelar',
					//visible : (typeof fnCallbackReject === 'function'),
					press: function () {
						if (typeof fnCallbackReject === 'function'){
							fnCallbackReject();
						}
						dialog.close();
					}
				}),
				afterClose: function() {
					dialog.destroy();
				}
			});
 
			dialog.open();
		}
	});
});