sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel',
		'App/controller/requirement/PeopleFlowDialog',
		'App/data/dataEvents',
		'App/model/formatter',
		'App/controller/requirement/AsignacionDetailDialog',
		'App/controller/requirement/MoverFechaDialog',
		'App/model/requirements',
		'App/model/myopportunities',
		'sap/ui/core/routing/History'
		
		
	], function(Controller,JSONModel,PeopleFlowDialog,dataEvents, formatter,AsignacionDetailDialog,MoverFechaDialog, requirements, myopportunities, History) {
	"use strict";

	return Controller.extend("App.controller.requirement.RequirementsDetail", {

		formatter : formatter,
		
		onInit : function() {

			this._MoverFechaDialog = new MoverFechaDialog();

			this._AsignacionDetailDialog = new AsignacionDetailDialog();

			this._scrollContainer = this.getView().byId("scrollContainer");

			this._iconTabBar = this.getView().byId("iconTabBar");

			this._OppotunitySimpleForm = this.getView().byId("OppotunitySimpleForm");

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this._oRouter.getRoute("requirements_detail").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_without_oli").attachPatternMatched(this._onObjectMatched, this);
			this._oRouter.getRoute("requirements_detail_asignacion").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
			this._oRouter.getRoute("requirements_detail_asignacion_without_oli").attachPatternMatched(this._onObjectMatchedDetailAsignacion, this);
			
			this._eventBus = sap.ui.getCore().getEventBus();
			
			this.OpportunityModel = new JSONModel();

			this.getView().setModel(this.OpportunityModel,'Opportunity');

			this._DataModel = new JSONModel({isNotFullScreen : true, showFovoriteButton : false, showFovoriteIcon : false});
			this.getView().setModel(this._DataModel);

			this._eventBus = sap.ui.getCore().getEventBus();
			this._eventBus.subscribe(dataEvents.people_flow_full_screen.channel, dataEvents.people_flow_full_screen.name,this.onSuscribePeopleFlowFullScreen , this);
		},
		
		_onObjectMatched : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null;
			this._iconTabBar.setSelectedKey("listado");
			this.OpportunityModel.setData({});
			this.getDataOpportunity();
			this.isMyFovorite();
			this._PeopleFlowModel = requirements.getModel(this._OpportunityId, this._OpportunityLineItemId);
			this.getView().setModel(this._PeopleFlowModel,'PeopleFlowModel');
			requirements.loadData();
			this._AsignacionDetailDialog.close();
			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"requirements"});
		},

		_onObjectMatchedDetailAsignacion : function(oEvent) {
			this._OpportunityId = oEvent.getParameter("arguments").opportunityId;
			this._OpportunityLineItemId = (oEvent.getParameter("arguments").opportunityLineItemId) ? oEvent.getParameter("arguments").opportunityLineItemId : null;
			var asignacionId = oEvent.getParameter("arguments").asignacionId;
			this._iconTabBar.setSelectedKey("listado");
			this.OpportunityModel.setData({});
			this.getDataOpportunity();
			this.isMyFovorite();
			this._PeopleFlowModel = requirements.getModel(this._OpportunityId, this._OpportunityLineItemId);
			this.getView().setModel(this._PeopleFlowModel,'PeopleFlowModel');
			var that = this;
			requirements.loadData().then(function(){
				that._AsignacionDetailDialog.close();
				that._AsignacionDetailDialog.open(that.getView(), that.getView().getModel('PeopleFlowModel'), 'data/' + asignacionId,true);
			});

			this._eventBus.publish(dataEvents.select_menu_main.channel,dataEvents.select_menu_main.name,{route:"requirements"});
		},

		

		onSuscribePeopleFlowFullScreen : function(channel, event, data) {
			if (data.fullScreen) {
				this._iconTabBar.addStyleClass('hide-header-icon-tab-bar');
				this._iconTabBar.setApplyContentPadding(false);
				this._DataModel.setData({isNotFullScreen : false});
			} else {
				this._iconTabBar.removeStyleClass('hide-header-icon-tab-bar');
				this._iconTabBar.setApplyContentPadding(true);
				this._DataModel.setData({isNotFullScreen : true});
			}
		},

		getDataOpportunity : function() {
			var that = this;
			jQuery.ajax({
				//url : PROXY + "/opportunitySalesforce/" + this._OpportunityId,  //-->Se comenta para test- Vero
				url : 'http://api.grupoassa.com:1337/opportunitySalesforce/' + this._OpportunityId,  // --->Test Vero
				method : "GET",
				dataType : "JSON",
				data : {
					populate : 'Account,OpportunityLineItems'
				},
				success : function(data){
					var OpportunityLineItem = undefined;
					if (data.OpportunityLineItems.length && that._OpportunityLineItemId) {
						for (var i = 0; i < data.OpportunityLineItems.length; i++) {
							if (data.OpportunityLineItems[i].Id == that._OpportunityLineItemId) {
								OpportunityLineItem = data.OpportunityLineItems[i];
							}
						}
					}
					data.OpportunityLineItem = OpportunityLineItem;
					that.OpportunityModel.setProperty("/",data);
				}

			});
		},

		moverFechaOnPress : function(oEvent) {
			this._MoverFechaDialog.open(this.getView(),this._OpportunityId);
		},

		onBack : function () {
			sap.ui.core.routing.Router.getRouter("AppRouter").onBack();
		},

		onPressAddFavorite : function(oEvent) {
			var that = this;

			jQuery.ajax({
				//url : PROXY + '/MyOpportunity',  //-->Se comenta para test- Vero
				url : 'http://api.grupoassa.com:1337/MyOpportunity',  // --->Test Vero
				method : 'POST',
				data : {
					opportunity : this._OpportunityId,
					opportunityLineItem : (this._OpportunityLineItemId) ? this._OpportunityLineItemId : null
				},
				success : function(data) {
					myopportunities.loadById(data.id);
					that._DataModel.setProperty('/showFovoriteButton', false);
					that._DataModel.setProperty('/showFovoriteIcon', true);
				},
				error : function(error) {
					console.log("error", error);
				}
			});

		},

		isMyFovorite : function() {
			var that = this;
			this._DataModel.setProperty('/showFovoriteButton', false);
			this._DataModel.setProperty('/showFovoriteIcon', false);
			jQuery.ajax({
				//url : PROXY + '/MyOpportunity/isMyFavorite',  //-->Se comenta para test- Vero
				url : 'http://api.grupoassa.com:1337/MyOpportunity/isMyFavorite',  // --->Test Vero
				data : {
					opportunity : this._OpportunityId,
					opportunityLineItem : this._OpportunityLineItemId
				},
				success : function (data) {
					console.log( "data", data);
					that._DataModel.setProperty('/showFovoriteButton', !data.isFavorite);
					that._DataModel.setProperty('/showFovoriteIcon', data.isFavorite);
				}
			});

		},

		// formatters

		setTitleOLI : function (OpportunityLineItem) {
			console.log("OpportunityLineItem",OpportunityLineItem);
			if (OpportunityLineItem) {
				return OpportunityLineItem.Platform__c + ' ' + OpportunityLineItem.ServiceType__c;
			} else {
				return "People Flow";
			}
		}
	});
});