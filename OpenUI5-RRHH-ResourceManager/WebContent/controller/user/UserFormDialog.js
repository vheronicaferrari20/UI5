sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/m/MessageToast'
], function (Object,JSONModel,dataEvents,MessageToast) {
	"use strict";
	return Object.extend("App.controller.user.UserFormDialog", {
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.user.UserFormDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			}

			this._userNameGAInput = sap.ui.getCore().byId('userNameGAInput');

			this._acceptButton =  sap.ui.getCore().byId('acceptButton');

			return this._oDialog;
		},
		
		open : function (oView) {
			this.id = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Nuevo Usuario");
			this._acceptButton.setText("Enviar");

			// open dialog
			oDialog.open();

			this.clearForm();

		},

		openToEdit : function (oView, data) {
			this.id = data.id;

			this._eventBus = sap.ui.getCore().getEventBus();
			
			var oDialog = this._getDialog();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			oDialog.setTitle("Actualizar Usuario");
			this._acceptButton.setText("Actualizar");

			// open dialog
			oDialog.open();

			this.clearForm();

			this._userNameGAInput.setValue(data.userNameGA);
			
		},
		
		onCloseDialog : function (oEvent) {
			this._getDialog().destroy();
			this._oDialog = undefined;
		},

		onPressAccept : function(oEvent){
			if (this.validateForm()){
				var that = this;
				if (this.id === undefined) {
					// CREATE
					jQuery.ajax({
						//url : PROXY + "/user",  //-->Se comenta para test- Vero
						url : 'http://api.grupoassa.com:1337/user',  // --->Test Vero
						method : "POST",
						dataType : "JSON",
						data : {
							userNameGA : that._userNameGAInput.getValue()
						},
						success : function(data) {
							that._eventBus.publish(dataEvents.add_user.channel,dataEvents.add_user.name,{});
							that.onCloseDialog();
							MessageToast.show("Usuario creado con exito!!!");
						},
						error : function(error){
							var dataError = error.responseJSON;
							var message = "";
							if ('invalidAttributes' in dataError) {
								jQuery.each(dataError.invalidAttributes,function(key,value){
									jQuery.each(value, function(i, error) {
										message += error.message + '\n';
									});
								});
								return MessageToast.show(message);
							}
							MessageToast.show("ERROR");
						}
					});
				} else {
					//UPDATE
					jQuery.ajax({
						//url : PROXY + "/user/" + that.id,  //-->Se comenta para test- Vero
						url : 'http://api.grupoassa.com:1337/user' + that.id,  // --->Test Vero
						method : "PUT",
						dataType : "JSON",
						data : {
							userNameGA : that._userNameGAInput.getValue()
						},
						success : function(data) {
							that._eventBus.publish(dataEvents.update_user.channel,dataEvents.update_user.name,{});
							that.onCloseDialog();
							MessageToast.show("Usuario actualizado con exito!!!");
						},
						error : function(error){
							MessageToast.show("ERROR");
						}
					});
				}
				

			}
		},

		validateForm : function() {
			var result = true;

			if (this._userNameGAInput.getValue().length == 0 ) {
				result = false;
				this._userNameGAInput.setValueState("Error");
				this._userNameGAInput.setValueStateText("Este campo es requerido");
				this._userNameGAInput.setShowValueStateMessage(true);
			} else {
				this._userNameGAInput.setValueState("None");
				this._userNameGAInput.setShowValueStateMessage(false);
			}

			return result;
		},

		clearForm : function() {
			this._userNameGAInput.setValue("");
			this._userNameGAInput.setValueState("None");
			this._userNameGAInput.setShowValueStateMessage(false);
		}

	});
});