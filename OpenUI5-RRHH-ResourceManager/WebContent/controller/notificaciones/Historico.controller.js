sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'App/model/notificacionHistorico',
		'App/model/formatter',
		'sap/ui/model/json/JSONModel',
		'sap/ui/model/Filter'
	], function(Controller,notificacionHistorico,formatter, JSONModel, Filter) {
	"use strict";

	return Controller.extend("App.controller.notificaciones.Historico", {

		notificacion : notificacionHistorico,

		formatter : formatter,
		
		onInit : function() {

			this._TipoNotificaciones = new JSONModel([
					{
						title : "Nueva Oportunidad",
						key : "nueva_opportunity"
					},
					{
						title : "Oportunidad Committed",
						key : "opportunity_committed"
					},
					{
						title : "Oportunidad Committed Cancelado",
						key : "opportunity_committed_cancel"
					},
					{
						title : "Oportunidad Stage",
						key : "opportunity_stage"
					},
					{
						title : "Nuevo Requerimiento",
						key : "nueva_asignacion"
					},
					{
						title : "Nueva Vacante",
						key : "asignacion_draft_recruiting"
					},
					{
						title : "Vacante Cancelada",
						key : "asignacion_recruiting_draft"
					},
					{
						title : "Candidato Asignado",
						key : ['asignacion_draft_asignado','asignacion_reservado_asignado']
					},
					{
						title : "Candidato Reservado",
						key : "asignacion_draft_reservado"
					},
					{
						title : "Candidato Asignado Cancelado",
						key : "asignacion_asignado_draft"
					},
					{
						title : "Candidato Reservado Cancelado",
						key : "asignacion_reservado_draft"
					}

				]);

			this.getView().setModel(this._TipoNotificaciones, "TipoNotificaciones");

			this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			this._notificacionesList = this.getView().byId('notificacionesList');

			this._tiposNotificacionesList = this.getView().byId('tiposNotificacionesList');
			
			this._NotificacionesModel = notificacionHistorico.getModel();

			this.getView().setModel(this._NotificacionesModel,'NotificacionesModel');

			this.getView().setModel(new JSONModel({hideCloseButton : true}));

			this.listarNotificaciones();

		},

		onAfterRendering : function() {
			if (!this._onAfterRendering) {
				this.getData();
				this._onAfterRendering = true;
			}
		},
		
		listarNotificaciones : function() {
			var that = this;
			this._notificacionesList.bindAggregation("items", "NotificacionesModel>/data", function(sId, oContext) {
				var notificacionObj = that._NotificacionesModel.getProperty(oContext.sPath);
				var frag;
				switch(notificacionObj.tipo) {
					case 'nueva_opportunity':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.NuevaOpportunity", that);
				        break;
				    case 'opportunity_committed':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.OpportunityCommitted", that);
				        break;
				    case 'opportunity_committed_cancel':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.OpportunityCommittedCancel", that);
				        break;
				    case 'opportunity_stage':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.OpportunityStage", that);
				        break;
				    case 'nueva_asignacion':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.NuevaAsignacion", that);
				        break;
				    case 'asignacion_draft_reservado':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionDraftReservado", that);
				        break;
				    case 'asignacion_draft_asignado':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionDraftAsignado", that);
				        break;
				    case 'asignacion_reservado_asignado':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionReservadoAsignado", that);
				        break;
				    case 'asignacion_draft_recruiting':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionDraftRecruiting", that);
				        break;
				    case 'asignacion_reservado_draft':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionReservadoDraft", that);
				        break;
				    case 'asignacion_asignado_draft':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionAsignadoDraft", that);
				        break;
				    case 'asignacion_recruiting_draft':
				        frag =  sap.ui.jsfragment("App.view.notificaciones.AsignacionRecruitingDraft", that);
				        break;
				    
				    default:
				        frag = null;
				}

				return frag;
				
			});
		},

		onSelectionChange : function(oControlEvent) {
			var aFilters = [];
			var listItems = this._tiposNotificacionesList.getSelectedItems();
			
			if (listItems.length < this._TipoNotificaciones.getProperty('/').length){
				for (var i = 0; i < listItems.length; i++ ) {
					var oItem = listItems[i];
					var path = oItem.getBindingContext("TipoNotificaciones").getPath();
					var data = this._TipoNotificaciones.getProperty(path);
					if (typeof data.key == 'string') {
						aFilters.push(new Filter('tipo', 'EQ', data.key));
					} else {
						for (var j = 0; j < data.key.length; j++){
							aFilters.push(new Filter('tipo', 'EQ', data.key[j]));
						}
					}
				}
			} 
			
			this._aFilters = aFilters;
			this.getData(true);
		},
		
		getData : function(bRefresh) {
			notificacionHistorico.loadData(bRefresh, this._filterSearh, this._aFilters, this._aSorters);
		},

		updateStarted : function(oEvent){
			if ( oEvent.getParameters().reason == 'Growing') {
				this.getData();
			}
		}

	});
});