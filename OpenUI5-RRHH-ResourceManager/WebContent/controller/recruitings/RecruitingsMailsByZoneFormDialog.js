sap.ui.define([
    "sap/ui/base/Object",
    'sap/ui/model/json/JSONModel',
    'App/data/dataEvents',
    'sap/m/MessageToast',
    'App/controller/ConfirmDialog',
    'sap/ui/core/ListItem',
    'sap/m/Token'
], function (Object,JSONModel,dataEvents,MessageToast,ConfirmDialog,ListItem,Token) {
    "use strict";
    return Object.extend("App.controller.mailByZone.UserFormDialog", {
        _getDialog : function () {
            var that = this;
            // create dialog lazily
            if (!this._oDialog) {
                // create dialog via fragment factory
                this._oDialog = sap.ui.xmlfragment("App.view.recruitings.RecruitingsMailsByZoneFormDialog", this);
                this._oDialog.attachAfterClose(function(){
                    that.onCloseDialog();
                });
            }

            this._zoneComboBox = sap.ui.getCore().byId('zoneComboBox');
            this._ccInput = sap.ui.getCore().byId('ccInput');
            this._toInput = sap.ui.getCore().byId('toInput');
            this._toInput.setFilterFunction(function(sTerm, oItem) {
                // A case-insensitive 'string contains' style filter
                return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getAdditionalText().match(new RegExp(sTerm, "i")) ;
            });
            this._ccInput.setFilterFunction(function(sTerm, oItem) {
                // A case-insensitive 'string contains' style filter
                return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getAdditionalText().match(new RegExp(sTerm, "i")) ;
            });

            this._acceptButton =  sap.ui.getCore().byId('acceptButton');

            this._ConfirmDialog = new ConfirmDialog();

            
            return this._oDialog;
        },

        open : function (oView) {
            this.id = undefined;

            this._eventBus = sap.ui.getCore().getEventBus();

            var oDialog = this._getDialog();

            // connect dialog to view (models, lifecycle)
            oView.addDependent(oDialog);

            oDialog.setTitle("Nuevo Email de zona");
            this._acceptButton.setText("Enviar");

            this._SuggestToCollection = new JSONModel({
                SuggestToCollection : []
            });

            oDialog.setModel(this._SuggestToCollection);

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

            oDialog.setTitle("Actualizar Email");
            this._acceptButton.setText("Actualizar");

            this._SuggestToCollection = new JSONModel({
                SuggestToCollection : []
            });

            oDialog.setModel(this._SuggestToCollection);

            // open dialog
            oDialog.open();

            this.clearForm();

            var updateTo=[];
            var to=new Token({text:data.to.userNameGA+"@grupoassa.com",
                              key:data.to.codEmpleado});
            updateTo.push(to);

            var updateCc=[];
            var cc;
            for(var i=0;i<data.cc.length;i++){
                cc=new Token({
                            text:data.cc[i].userNameGA+"@grupoassa.com",
                            key: data.cc[i].codEmpleado
                });
                updateCc.push(cc);
            }

            this._toInput.setTokens(updateTo);
            this._ccInput.setTokens(updateCc);

            this._zoneComboBox.setSelectedKey(data.pais.codPais);
            this._zoneComboBox.setValue(data.pais.name);
        },

        onCloseDialog : function (oEvent) {
            this._getDialog().destroy();
            this._oDialog = undefined;
        },

        onPressAccept : function(oEvent){
            var that = this;
            var ccArray=[];
            for(var i=0;i<this._ccInput.getTokens().length;i++){
                ccArray.push(this._ccInput.getTokens()[i].getKey());
            }

            if (this.validateForm()){
                var zone = this._zoneComboBox.getSelectedKey();
                that._save(zone,that._toInput.getTokens()[0].getKey(),ccArray);
            }
        },

        _save : function(pais, to, cc) {
            var that = this;
            if (this.id === undefined) {
                // CREATE
                jQuery.ajax({
                    url : PROXY + "/recruitingEmail",
                    method : "POST",
                    dataType : "JSON",
                    data : {
                        pais : pais,
                        to : to,
                        cc : cc
                    },
                    success : function(data) {
                        that._eventBus.publish(dataEvents.add_mailsByZone.channel,dataEvents.add_mailsByZone.name,{});
                        that.onCloseDialog();
                        MessageToast.show("E-mail creado con exito!!!");
                    },
                    error : function(error){
                        that._showErrors(error);
                    }
                });
            } else {
                //UPDATE
                jQuery.ajax({
                    url : PROXY + "/recruitingEmail/" + that.id,
                    method : "PUT",
                    dataType : "JSON",
                    data : {
                        pais : pais,
                        to : to,
                        cc : cc
                    },
                    success : function(data) {
                        that._eventBus.publish(dataEvents.update_mailsByZone.channel,dataEvents.update_mailsByZone.name,{});
                        that.onCloseDialog();
                        MessageToast.show("E-mail actualizado con exito!!!");
                    },
                    error : function(error){
                        that._showErrors(error);
                    }
                });
            }

        },

        _showErrors : function(res) {
            var msg = "";
            if ('Errors' in res.responseJSON){
                jQuery.each(res.responseJSON.Errors,function(i,value){
                    jQuery.each(value,function(i,error){
                        msg += error.message + "\n";
                    });
                });
            } else {
                msg = "Ha surgido un error";
            }
            MessageToast.show(msg);
        },

        validateForm : function() {
            var result = true;

            var zone = this._zoneComboBox.getSelectedKey();
            var zoneValue = this._zoneComboBox.getValue();

            if (zone.length == 0 && zoneValue.trim().length == 0) {
                result = false;
                this._zoneComboBox.setValueState("Error");
                this._zoneComboBox.setValueStateText("Este campo es requerido");
                this._zoneComboBox.setShowValueStateMessage(true);
            } else {
                this._zoneComboBox.setValueState("None");
                this._zoneComboBox.setShowValueStateMessage(false);
            }


            if (this._toInput.getTokens().length == 0 ) {
                result = false;
                this._toInput.setValueState("Error");
                this._toInput.setValueStateText("Este campo es requerido");
                this._toInput.setShowValueStateMessage(true);
            } else {
                this._toInput.setValueState("None");
                this._toInput.setShowValueStateMessage(false);
            }

            return result;
        },

        clearForm : function() {
            this._toInput.setValue("");
            this._toInput.setValueState("None");
            this._toInput.setShowValueStateMessage(false);
        },



        handdleSuggestTo : function(oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            jQuery.ajax({
                url : PROXY + "/employee",
                method : "GET",
                data : {
                    where : {
                        or : [
                            {fullName : {contains : sTerm}},
                            {userNameGA : {contains : sTerm}}
                        ]
                    }
                },
                context : this,
                success : function(data) {
                    console.log("data",data);
                    this._SuggestToCollection.setProperty("/SuggestToCollection", data);

                }
            });

        },
        

    });
});