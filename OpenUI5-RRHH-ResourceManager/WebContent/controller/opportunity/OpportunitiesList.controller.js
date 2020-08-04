sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/data/dataEvents',
		'App/controller/ConfirmDialog',
		'sap/ui/model/Filter',
		'App/controller/opportunity/OpportunitiesViewSettingsDialog',
		'App/model/formatter',
		'App/model/opportunities',
		'sap/ui/model/Sorter',
		'sap/m/GroupHeaderListItem',
		'sap/ui/Device',
		'sap/ui/core/Fragment',
		'sap/m/TablePersoController',
		'./LayoutServiceOpport' 
		
	], function(Controller,JSONModel,dataEvents,ConfirmDialog,Filter,OpportunitiesViewSettingsDialog, formatter, opportunities, 
			    Sorter,GroupHeaderListItem,Device,Fragment,TablePersoController, LayoutServiceOpport) {
	"use strict";

	return Controller.extend("App.controller.opportunity.OpportunitiesList", {
		
		formatter : formatter,
		
		varInit: function(){ 
	           
	           //initialize variables with appropriate view elements
			this._Table = this.getView().byId("opportunitiesListTable");
	            },

		onInit : function() {

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._ModelName = "OpportunityModel";

			this._ViewSettingsDialog = new OpportunitiesViewSettingsDialog();

			this._ConfirmDialog = new ConfirmDialog();

			this._Table = this.getView().byId("opportunitiesListTable");

			this._infoFilterBar = this.getView().byId("infoFilterBar");

			this._infoFilterLabel = this.getView().byId("infoFilterLabelO");
			
			this._infoFilterLabelTotal = this.getView().byId("infoFilterLabelTotalO");

			this._Model = opportunities.getModel();

			this.getView().setModel(this._Model,this._ModelName);
			
			//*************Inicio de Test Vero
			//var oPersId = {container: "mycontainer-1", item: "myitem-1"};
			
			//var oProvider = sap.ushell.Container.getService("Personalization").getPersonalizer(oPersId);
			// init and activate controller
			this._oTPC2 = new TablePersoController({
				table: this._Table, //this.byId("employeesListTable"),
				componentName: "App",
				persoService: LayoutServiceOpport  // oProvider
			}).activate();
			//*************FIN de Test Vero

			this.getData();
			
			this._aSorters = [];
			this._aFilters = [];
			this._filterSearh = undefined;

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.update_viewsettings_opportunities.channel, dataEvents.update_viewsettings_opportunities.name,this.onSuscribeUpdateViewsettings, this);
			
			
			//Prueba Gusta Agilizar model por pais=
			var oModelPopover = new JSONModel(this._Model);
	          this.getView().setModel(oModelPopover);
	          var that = this;
	          if (!this._oResponsivePopover) {
	            this._oResponsivePopover = sap.ui.xmlfragment("App.view.opportunity.Popover", this);
	            this._oResponsivePopover.setModel(this.getView().getModel());
	          }
	          
	          var oTable = this.getView().byId("opportunitiesListTable");
	          oTable.addEventDelegate({
	            onAfterRendering: function() {
	              var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
	              for (var i = 0; i < oHeader.length; i++) {
	                var oID = oHeader[i].id;
	                that.onClick(oID);
	              }
	            }
	          }, oTable);
	          

		},
		/*
		***************************************************************************************
		* FIN ON INIT
		***************************************************************************************
		*/	
		
		/*
		***************************************************************************************
		* START POPOVER GUS FILTER
		***************************************************************************************
		*/	
		//New Filter Gusta
		onOpenViewSettings : function (oEvent, oView) {
			var sDialogTab = "filter";
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().getId();
				if (sButtonId.match("sort")) {
					sDialogTab = "sort";
				} else if (sButtonId.match("group")) {
					sDialogTab = "group";
				}
			}
			// load asynchronous XML fragment
			if (!this.byId("viewSettingsDialogGus")) {
				Fragment.load({
					id: this.getView().getId(),
					name: "App.view.opportunity.ViewSettingsDialogGus",
					controller: this
				}).then(function(oDialog){
					// connect dialog to the root view of this component (models, lifecycle)
					this.getView().addDependent(oDialog);
					this.getView().getController().getOwnerComponent().loadDataOpportunitiesAccountMasterModel();
					oDialog.open(sDialogTab);
				}.bind(this));
			} else {
				this.byId("viewSettingsDialogGus").open(sDialogTab);
			}
		},
		
		onConfirmViewSettingsDialog : function (oEvent) {
			var oModelFilter = new JSONModel(this._Model);
	          this.getView().setModel(oModelFilter);
	          var that = this;
	          var table = this._Table;
			var aFilterItems = oEvent.getParameters().filterItems,
				aFilters = [],
				aCaptions = [];

			// update filter state:
			// combine the filter array and the filter string
			aFilterItems.forEach(function (oItem, oEvt) {
				switch (oItem.getKey()) {
					case "Filter1" :
						aFilters.push(new Filter("CreatedDate", FilterOperator.LE, "LastModifiedDate"));
						break;
					case "Filter2" :
						aFilters.push(new Filter("CreatedDate", FilterOperator.GT, "LastModifiedDate"));
						break;
					case "prueb" :
		                var oItems = table.getBinding("items");
                      var oParams = oItem.getText();
                      var oCompanyCode = oParams;
                      if (oCompanyCode != "") {
                        var oFilter1 = [new sap.ui.model.Filter("StageName", "EQ", oCompanyCode)];
                        var allFilters = new sap.ui.model.Filter(oFilter1, false);
                        oItems.filter(allFilters);
                      } else {
                        var oFilter = new sap.ui.model.Filter("StageName", sap.ui.model.FilterOperator.Contains, oCompanyCode);
                        oItems.filter(oFilter);
                      }
						break;
					case "platformList" :
		                var oItems = table.getBinding("items");
                      var oParams = oItem.getText();
                      var oCompanyCode = oParams;
                      if (oCompanyCode != "") {
                        var oFilter1 = [new sap.ui.model.Filter("Platform__c", "EQ", oCompanyCode)];
                        var allFilters = new sap.ui.model.Filter(oFilter1, false);
                        oItems.filter(allFilters);
                      } else {
                        var oFilter = new sap.ui.model.Filter("Platform__c", sap.ui.model.FilterOperator.Contains, oCompanyCode);
                        oItems.filter(oFilter);
                      }
						break;
					case "TypeServices" :
		                var oItems = table.getBinding("items");
                      var oParams = oItem.getText();
                      var oCompanyCode = oParams;
                      if (oCompanyCode != "") {
                        var oFilter1 = [new sap.ui.model.Filter("ServiceType__c", "EQ", oCompanyCode)];
                        var allFilters = new sap.ui.model.Filter(oFilter1, false);
                        oItems.filter(allFilters);
                      } else {
                        var oFilter = new sap.ui.model.Filter("ServiceType__c", sap.ui.model.FilterOperator.Contains, oCompanyCode);
                        oItems.filter(oFilter);
                      }
						break;
					default :
						break;
				}
				aCaptions.push(oItem.getText());
			});
			this._applySortGroup(oEvent);

		},
		
		_applySortGroup: function (oEvent) {
			var that = this;
			var table = this._Table;
			var oItems = table.getBinding("items");
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			// apply sorter to binding
			// (grouping comes before sorting)
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				var vGroup = this._oGroupFunctions["OpportunityPais"];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			table.getBinding("items").sort(aSorters);
			that._infoFilterLabelTotal.setText("Total Registros: ("+oItems.aIndices.length+")");
			
		},
		
		onClick: function(oID) {
	          var that = this;
	          $('#' + oID).click(function(oEvent) { //Attach Table Header Element Event
	            var oTarget = oEvent.currentTarget; //Get hold of Header Element
	            var oLabelText = oTarget.childNodes[0].textContent; //Get Column Header text
	            var oIndex = oTarget.id.slice(-1); //Get the column Index
	            var oView = that.getView();
	            var oTable = oView.byId("opportunitiesListTable");
	            var oModel = that._Model.getProperty('/data');
	            //var oModel = oTable.getModel().getProperty("/data"); //Get Hold of Table Model Values
	            var oKeys = Object.keys(oModel); //Get Hold of Model Keys to filter the value
	            oView.getModel().setProperty("/bindingValue", oKeys[oIndex]); //Save the key value to property
	            that._oResponsivePopover.openBy(oTarget);
	          });
	        },
	        
	        onChange: function(oEvent) {
	            var oValue = oEvent.getParameter("value");
	            var oMultipleValues = oValue.split(",");
	            var oTable = this.getView().byId("opportunitiesListTable");
	            var oBindingPath = this.getView().getModel().getProperty("/bindingValue"); //Get Hold of Model Key value that was saved
	            var aFilters = [];
	            for (var i = 0; i < oMultipleValues.length; i++) {
	              var oFilter = new Filter(oBindingPath, "Contains", oMultipleValues[i]);
	              aFilters.push(oFilter)
	            }
	            var oItems = oTable.getBinding("items");
	            var oFilter = new sap.ui.model.Filter(aFilters[0].sPath, sap.ui.model.FilterOperator.Contains, oItems.aIndices);
	            oItems.filter(oFilter);
	            //oItems.filter(aFilters[0].sPath, oItems.aIndices);
	            this._oResponsivePopover.close();
	          },
	          
	         /* onAscending: function(oEvent) {
	        	  var oTable = this.getView().byId("opportunitiesListTable");
	        	  var sPath = oEvent.getParameter("column").getSortProperty();
	              var bDescending = false;
	              if (oEvent.getParameter("sortOrder") == "Descending") {
	                  bDescending = true;
	              }
	             var oSorter = new sap.ui.model.Sorter(sPath, bDescending );
	              
	              // override compare function only for birthday path
	              
	              if (sPath === "CloseDate") {
	                  oSorter.fnCompare = function(a, b) {
	                  
	                      // parse to Date object
	                      var aDate = new Date(a);
	                      var bDate = new Date(b);
	                      
	                      if (bDate == null) {
	                          return -1;
	                      }
	                      if (aDate == null) {
	                          return 1;
	                      }
	                      if (aDate < bDate) {
	                          return -1;
	                      }
	                      if (aDate > bDate) {
	                          return 1;
	                      }
	                      return 0;
	                  };
	              } 
	             
	             oTable.getBinding('rows').sort(oSorter);
	              // prevent internal sorting by table
	             oEvent.preventDefault();
	            },*/

	              onOpen: function(oEvent){
	                  //On Popover open focus on Input control
	                  var oPopover = sap.ui.getCore().byId(oEvent.getParameter("id"));
	                  var oPopoverContent = oPopover.getContent()[0];
	                  var oCustomListItem = oPopoverContent.getItems()[2];
	                  var oCustomContent = oCustomListItem.getContent()[0];
	                  var oInput = oCustomContent.getItems()[1];
	                  oInput.focus();
	                  oInput.$().find('.sapMInputBaseInner')[0].select();
	                },
	                
	               
	                FunctionTestPais: function(oEvt,data){
	                	var that = this;
	                	var oTable = this.getView().byId("opportunitiesListTable");
		                var oItems = oTable.getBinding("items");
                      var oParams = oEvt.getParameter("value");
                      var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
                      var oCompanyCode = oParams;
                      if (oCompanyCode != "") {
                        var oFilter1 = [new sap.ui.model.Filter("OpportunityPais", "EQ", oCompanyCode)];
                        var allFilters = new sap.ui.model.Filter(oFilter1, false);
                        oItems.filter(allFilters);
                      } else {
                        var oFilter = new sap.ui.model.Filter("OpportunityPais", sap.ui.model.FilterOperator.Contains, oCompanyCode);
                        oItems.filter(oFilter);
                      }
                      that._infoFilterLabelTotal.setText("Total Registros: ("+oItems.aIndices.length+")");
                      this._infoFilterLabel.setText(data.filterString);
                      this._oResponsivePopover.close();
	                  },
	                 
	                      FunctionTestPlatform: function(oEvt,data){
	                    	  var that = this;
	                    	  var oTable = this.getView().byId("opportunitiesListTable");
				                var oItems = oTable.getBinding("items");
	                          var oParams = oEvt.getParameter("value");
	                          var oBindingPath = this.getView().getModel().getProperty("/bindingValue");
	                          var oPlatform = oParams;
	                          if (oPlatform != "") {
	                            var oFilter1 = [new sap.ui.model.Filter("Platform__c", "EQ", oPlatform)];
	                            var allFilters = new sap.ui.model.Filter(oFilter1, false);
	                            oItems.filter(allFilters);
	                          } else {
	                            var oFilter = new sap.ui.model.Filter("Platform__c", sap.ui.model.FilterOperator.Contains, oPlatform);
	                            oItems.filter(oFilter);
	                          }
	                          that._infoFilterLabelTotal.setText("Total Registros: ("+oItems.aIndices.length+")");
	                          this._infoFilterLabel.setText(data.filterString);
	                          this._oResponsivePopover.close();
	                      },
  
	                   
	               
	                /*
	        		***************************************************************************************
	        		* FIN POPOVER FILTER GUS
	        		***************************************************************************************
	        		*/	
		
		/*
		***************************************************************************************
		* ON SUSCRIBE METHODS
		***************************************************************************************
		*/	
		

		onSuscribeUpdateViewsettings : function(channel, event, data){

			this._aSorters = data.aSorters;
			console.log("data.aSorters", data.aSorters);
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
			var sQuery = oEvt.getSource().getValue().trim();
			var aQuery = [];

			if (sQuery.length > 2 && sQuery[0] == "\"" && sQuery[sQuery.length - 1] == "\""){
				aQuery.push(sQuery.substring(1, sQuery.length-1));
				console.log("sQuery", sQuery.substring(1, sQuery.length-1));
			} else {
				aQuery = sQuery.split(' ');
			}
			
			for (var i = 0; i < aQuery.length; i++){

				if (aQuery[i] && aQuery[i].length > 0) {
					var filters = [];
					aFilters.push({'AccountName' : {'contains' : aQuery[i]}});
					aFilters.push({'Name' : {'contains' : aQuery[i]}});
					aFilters.push({'OpportunityPais' : {'contains' : aQuery[i]}});
					aFilters.push({'StageName' : {'contains' : aQuery[i]}});
					aFilters.push({'Platform__c' : {'contains' : aQuery[i]}});
					aFilters.push({'ServiceType__c' : {'contains' : aQuery[i]}});
				}
			}
			

			this._filterSearh = aFilters;

			this.applyFilterSorters();
 
		},

		onItemPressTable : function(oEvent){
			var that = this;
			var oItem = oEvent.getSource();
			var path = oItem.getBindingContext(this._ModelName).getPath();
			var data = this._Model.getProperty(path);
			if (data.OpportunityLineItemId) {
				this._oRouter.navTo("requirements_detail", 
					{
						opportunityId : data.Id,
						opportunityLineItemId : data.OpportunityLineItemId
					});

			} else {
				this._oRouter.navTo("requirements_detail_without_oli", 
					{
						opportunityId : data.Id
					});
			}
			
		},
		createGroupHeader : function (oGroup) {
			return new GroupHeaderListItem({
				title : oGroup.text,
				upperCase : false
			});
		},	 

		onPressRefresh : function(oEvent){
			this.getData(true);
		},

		onPressAdd : function(oEvent) {
			this._FormDialog.open(this.getView());
		},

		onPressConfig : function(oEvent){
			this._ViewSettingsDialog.open(this.getView());

		},

		updateStarted : function(oEvent){
			console.log(oEvent.getParameters().reason);

			if ( oEvent.getParameters().reason == 'Growing') {
				this.getData();
			}
		},

		//*************Inicio de Test Vero
		onLayoutButtonPress: function (oEvent) {
			//console.log('Pasa x onLayoutoButtonPress');
			this._oTPC2.openDialog();
		},
		//*************Fin de Test Ve
		/*
		***************************************************************************************
		***************************************************************************************
		***************************************************************************************
		*/

		applyFilterSorters : function(){

			this.getData(true);

		},

		getData : function(bRefresh) {
			//var that = this;
			//this._Table.setBusy(true);
			var that = this;
			this._Table.setBusy(true);
			opportunities
				.loadData(bRefresh, this._filterSearh, this._aFilters, this._aSorters)
				.then(function(){
					that._Table.setBusy(false);
					var binding =  that._Table.getBinding("items");
					console.log("binding.aIndices.length: "+ binding.aIndices.length);
					that._infoFilterLabelTotal.setText("Total Registros: ("+binding.aIndices.length+")");
				});
						
		},

		// formatters
		perfiles : function(
			CountPerfiles, 
			CountPerfilesDraft, 
			CountPerfilesReservados, 
			CountPerfilesAsignados, 
			CountPerfilesRecruiting) {
			
			return (CountPerfiles) ? (CountPerfiles + " [D:"+CountPerfilesDraft+"; R:"+CountPerfilesReservados+"; A:"+CountPerfilesAsignados+"; Rc:"+CountPerfilesRecruiting+"]") : '';
		}
			
	});
});