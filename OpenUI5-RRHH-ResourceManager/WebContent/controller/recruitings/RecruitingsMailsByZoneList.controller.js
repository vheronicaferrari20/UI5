sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'App/controller/recruitings/RecruitingsMailsByZoneFormDialog',
    'App/data/dataEvents',
    'App/controller/ConfirmDialog',
    'sap/ui/model/Filter',
    'App/controller/recruitings/RecruitingsMailsByZoneViewSettingsDialog'
], function(Controller,JSONModel,RecruitingsMailsByZoneFormDialog,dataEvents,ConfirmDialog,Filter,RecruitingsMailsByZoneViewSettingsDialog) {
    "use strict";

    return Controller.extend("App.controller.recruitings.RecruitingsMailsByZoneList", {

        onInit : function() {

            this._ModelName = "MailsByZoneModel";

            this._ViewSettingsDialog = new RecruitingsMailsByZoneViewSettingsDialog();

            this._ConfirmDialog = new ConfirmDialog();

            this._FormDialog = new RecruitingsMailsByZoneFormDialog();

            this._Table = this.getView().byId("recruitingsMailsByZoneListTable");

            this._infoFilterBar = this.getView().byId("infoFilterBar");

            this._infoFilterLabel = this.getView().byId("infoFilterLabel");

            this._deleteButton = this.getView().byId("deleteButton");

            this._Model = new JSONModel();

            this.getView().setModel(this._Model,this._ModelName);

            this.getData();

            this._aSorters = [];
            this._aFilters = [];
            this._filterSearh = undefined;

            this._eventBus = sap.ui.getCore().getEventBus();
            this._eventBus.subscribe(dataEvents.add_mailsByZone.channel, dataEvents.add_mailsByZone.name,this.onSuscribeAdd , this);
            this._eventBus.subscribe(dataEvents.update_mailsByZone.channel, dataEvents.update_mailsByZone.name,this.onSuscribeUpdate , this);
            this._eventBus.subscribe(dataEvents.delete_mailsByZone.channel, dataEvents.delete_mailsByZone.name,this.onSuscribeDelete , this);
            this._eventBus.subscribe(dataEvents.update_viewsettings_mailsByZone.channel, dataEvents.update_viewsettings_mailsByZone.name,this.onSuscribeUpdateViewsettings, this);
        },

        /*
         ***************************************************************************************
         * ON SUSCRIBE METHODS
         ***************************************************************************************
         */

        onSuscribeAdd : function(){
            this.getData();
        },

        onSuscribeUpdate : function(){
            this.getData();
        },

        onSuscribeDelete : function(){
            this.getData();
        },

        onSuscribeUpdateViewsettings : function(channel, event, data){

            this._aSorters = data.aSorters;
            this._aFilters = data.aFilters;

            this._infoFilterBar.setVisible(data.aFilters.length > 0);
            this._infoFilterLabel.setText(data.filterString);

            this.applyFilterSorters();
        },

        /*
         ***************************************************************************************
         * ON EVENTS METHODS
         ***************************************************************************************
         */

        onSearch : function (oEvt) {

            // add filter for search
            var aFilters = [];
            var sQuery = oEvt.getSource().getValue();
            var binding = this._Table.getBinding("items");
            if (sQuery && sQuery.length > 0) {
                var filter1 = new Filter("pais/name", sap.ui.model.FilterOperator.Contains, sQuery);
                var filter2 = new Filter("to/fullName", sap.ui.model.FilterOperator.Contains, sQuery);
                aFilters.push(filter1);
                aFilters.push(filter2);
                this._filterSearh = new Filter(aFilters);
            } else {
                this._filterSearh = undefined;
            }

            this.applyFilterSorters();

        },

        onItemPressTable : function(oEvent){
            //var that = this;
            var oItem = oEvent.getSource();
            var path = oItem.getBindingContext(this._ModelName).getPath();
            var data = this._Model.getProperty(path);
            this._FormDialog.openToEdit(this.getView(),data);
        },

        onSelectionChangeTable : function(oEvent){
            this._deleteButton.setEnabled(true);
        },

        onPressDelete : function(oEvent){
            var oItem = this._Table.getSelectedItem();
            var path = oItem.getBindingContext(this._ModelName).getPath();
            var data = this._Model.getProperty(path);
            var that = this;

            this._deleteButton.setEnabled(false);
            this._ConfirmDialog.open(
                'Confirm',
                '¿¿¿Ud. esta seguro que desea realizar esta acción???',
                function(){
                    jQuery.ajax({
                        url : PROXY + '/recruitingEmail/' + data.id,
                        method : 'DELETE',
                        dataType : 'JSON',
                        success : function(data){
                            that.getData();
                            that._Table.removeSelections(true);
                        },
                        error : function(err){
                            that._Table.removeSelections(true);
                            if (err.responseJSON.invalidAttributes.pais) {
                                that._ConfirmDialog.open("Error",err.responseJSON.invalidAttributes.mails_by_zone[0].message);
                            } else {
                                that._ConfirmDialog.open("Error","Há surgido un error al intentar eliminar esta Zona");
                            }

                        }
                    });
                },
                function(){
                    that._Table.removeSelections(true);
                }
            );
        },

        onPressRefresh : function(oEvent){
            this.getData();
            this._deleteButton.setEnabled(false);
            this._Table.removeSelections(true);
        },

        onPressAdd : function(oEvent) {
            this._FormDialog.open(this.getView());
        },

        onPressConfig : function(oEvent){
            this._ViewSettingsDialog.open(this.getView());

        },

        /*
         ***************************************************************************************
         ***************************************************************************************
         ***************************************************************************************
         */

        applyFilterSorters : function(){
            var binding = this._Table.getBinding("items");

            binding.sort(this._aSorters);

            var filters = [];

            if (this._filterSearh) {
                filters.push(this._filterSearh)
            }

            for (var i=0; i < this._aFilters.length; i++){
                filters.push(this._aFilters[i]);
            }

            binding.filter(filters);

        },

        getData : function() {
            var that = this;
            this._Table.setBusy(true);

            jQuery.ajax({
                url : PROXY + "/recruitingEmail",
                method : "GET",
                data : {
                    populate : "pais,cc,to"
                },
                dataType : "JSON",
                success : function(data){
                    that._Table.setBusy(false);
                    that._Model.setData(data);
                }
            });
        },
        //formatters
        
        ccFormatter : function (cc) {
            var r = [];
            if (cc.length){
                for (var i = 0; i < cc.length; i++){
                    r.push( cc[i].fullName );
                }
            }
            return r.join("; ");
        }

    });
});