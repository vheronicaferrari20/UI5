sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		"App/model/formatter",
		'sap/m/MessageToast',
		"sap/ui/core/routing/History",
		'sap/ui/core/format/DateFormat',
		'App/data/dataEvents',
		'sap/ui/core/BusyIndicator'
	], function(Controller,JSONModel,formatter,MessageToast,History,DateFormat,dataEvents,BusyIndicator) {
	"use strict";

	return Controller.extend("App.controller.LoginCuit", {
		formatter : formatter,
		
		onInit : function() {
			this._userNameGAInput = this.getView().byId("userNameGAInput");
			this._passwordInput = this.getView().byId("passwordInput");
			
			this._tokenInput = this.getView().byId("tokenInput"); //--->Test pruebas locales	
			this._idButtonLogin = this.getView().byId("idButtonLogin");
			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
		},
		
		onLogin : function(oEvent){
					
			if (this.validateForm()){
				var that = this;

				jQuery.ajax({
						//url : SERVER_DELIVERY_TOOLS + "/authenticate", //--->Se comenta para pruebas en localhost	
					    url : 'http://api.grupoassa.com:3001/authenticate',
					    method : "POST",
						dataType : "JSON",
						data : {
							username : that._userNameGAInput.getValue(),
							password : that._passwordInput.getValue()
						},
						success : function(data){

							jQuery.ajax({
								//url : PROXY + '/auth/verifyToken', //--->Se comenta para pruebas en localhost	
								url: 'http://api.grupoassa.com:1337/auth/verifyToken',
								method : 'POST',
								data : {
									token : data.token
								},
								success : function(){
									console.log("OK");
									jQuery.cookie('api_token', data.token, { path: '/', domain : '.grupoassa.com' });
									jQuery.cookie('api_access_token', data.accessToken, { path: '/', domain : '.grupoassa.com' });
		                            jQuery('#__shell0-content').removeClass('sapMShellGlobalInnerBackground');
		                            console.log('Token: '+ data.token );
		                            //this._tokenInput.setValue(data.token ); //--->Test pruebas locales
		                           // console.log('tokenInput: '+ this._tokenInput.getValue( ) );
		                            console.log(' AccessToken: ' + data.accessToken);
									that.getOwnerComponent().setDataUser(data);
									that.getOwnerComponent().configIO();
									that._oRouter.initialize();
									that.getOwnerComponent().setHeaderVisible(true);
									
									that.getOwnerComponent().setMastersModels();
									//console.log("that.getOwnerComponent(): "+ that.getMastersModels());
								}, 
								error : function(error){
									console.log("error", error);
								}
							});
							
							

						},
						error : function(error) {
							MessageToast.show('Usuario o Password incorrecto.');
						
						}
		
					});				
			}	
		
		},
		
		validateForm : function() {
			var result = true;
			if (jQuery.trim(this._userNameGAInput.getValue()).length == 0) {
				result = false;
				this._userNameGAInput.setValueState("Error");
				this._userNameGAInput.setValueStateText("Este campo es requerido");
				this._userNameGAInput.setShowValueStateMessage(true);
			} else {
				this._userNameGAInput.setValueState("None");
				this._userNameGAInput.setShowValueStateMessage(false);
			}

			if (jQuery.trim(this._passwordInput.getValue()).length == 0) {
				result = false;
				this._passwordInput.setValueState("Error");
				this._passwordInput.setValueStateText("Este campo es requerido");
				this._passwordInput.setShowValueStateMessage(true);
			} else {
				this._passwordInput.setValueState("None");
				this._passwordInput.setShowValueStateMessage(false);
			}


			return result;
		}
	});
});