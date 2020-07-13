sap.ui.define([
	"sap/ui/base/Object",
	'sap/ui/model/json/JSONModel',
	'App/data/dataEvents',
	'sap/ui/model/Filter',
	'sap/ui/core/Item',
	'sap/m/MessageToast',
	'App/model/formatter',
	'sap/m/NotificationListItem',
	'App/controller/requirement/CandidatosListDialog',
	'App/controller/ConfirmDialog',
	'App/controller/requirement/RecruitingDialog',
	'App/controller/requirement/PeopleFlowDialog',
	'App/controller/recruitings/VincularRecruitingDialog'
], function (Object,JSONModel,dataEvents, Filter, Item, MessageToast, formatter, NotificationListItem, CandidatosListDialog, ConfirmDialog, RecruitingDialog, PeopleFlowDialog, VincularRecruitingDialog ) {

	"use strict";
	return Object.extend("App.controller.requirement.AsignacionDetailDialog", {
		formatter : formatter,

		
		_getDialog : function () {
			var that = this;
			// create dialog lazily
			if (!this._oDialog) {
				// create dialog via fragment factory
				this._oDialog = sap.ui.xmlfragment("App.view.requirement.AsignacionDetailDialog", this);
				this._oDialog.attachAfterClose(function(){
					that.onCloseDialog();
				});
			} 

			this._comentariosList = sap.ui.getCore().byId('comentariosList');

			this._feedInput = sap.ui.getCore().byId('feedInput');

			this._candidatosList = sap.ui.getCore().byId('candidatosList');

			this._PlannigCalendar = sap.ui.getCore().byId('asignacionPlanningCalendar');

			this._VincularRecruitingDialog = new VincularRecruitingDialog();

			return this._oDialog;
		},

		//open : function (oView, AsignacionData) {
		open : function(oView, model, path, visibleButtonBack){

			console.log("ABRIENDO ASIGNACION DETAIL");

			this._visibleButtonBack= (visibleButtonBack)? true:false;

			this._PeopleFlowDialog = new PeopleFlowDialog();

			this._model = model;

			this._path = path;	

			this._path = path;

			this._RecruitingDialog = new RecruitingDialog();

			this._ConfirmDialog = new ConfirmDialog();

			this._oView = oView;

			this._AsignacionData = model.getProperty('/'+path);//AsignacionData;

			console.log("_AsignacionData",this._AsignacionData);

			this._CandidatosListDialog = new CandidatosListDialog();

			this._AsignacionId = this._AsignacionData.id;

			this._eventBus = sap.ui.getCore().getEventBus();

			var oDialog = this._getDialog();

			//oDialog.bindContext('AsignacionModel>/' + path);

			this._AsignacionModel = new JSONModel(this._AsignacionData);
			this._Model = new JSONModel();

			oDialog.setModel(this._AsignacionModel,'AsignacionModel' );
			oDialog.setModel(this._Model);

			this.setMasterModel();
			
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			
			// open dialog
			oDialog.open();

			this.getCandidatos();
			
			var that = this;

			this._binding = new sap.ui.model.Binding(model, "/" + path, model.getContext("/"+path));
			this._binding.attachChange(function(){
				console.log("attachChange");
				that._AsignacionData = model.getProperty('/'+path);
				if (that._AsignacionData) {
					that._AsignacionModel.setData( model.getProperty('/'+path));
					that.getCandidatos();
			    	that.setMasterModel();
				}
			});

			this._eventBus.subscribe(dataEvents.asignacion_employee_add.channel, dataEvents.asignacion_employee_add.name,this.onSuscribAasignacionEmployeeAdd, this);
		},

		

		setMasterModel : function() {
			this._Model.setData(
				{isVisibleFeed : false, 
				 isVisibleList : true, 
				 skillFieldName : 'name',
				 isDraft : (this._AsignacionModel.getProperty('/estado') == 'DRAFT'),
				 isReservado : (this._AsignacionModel.getProperty('/estado') == 'RESERVADO'),
				 isAsignado : (this._AsignacionModel.getProperty('/estado') == 'ASIGNADO'),
				 isRecruiting : (this._AsignacionModel.getProperty('/estado') == 'RECRUITING'),
				 isCandidatoRecruiting : (!this._AsignacionModel.getProperty('/recruiting') && this._AsignacionModel.getProperty('/estado') == 'DRAFT'),
				 isGenerarRecruiting : (typeof this._AsignacionModel.getProperty('/recruiting') === 'object' && this._AsignacionModel.getProperty('/estado') == 'DRAFT'),
				 visibleButtonBack:this._visibleButtonBack,
				});
		},

		onSuscribAasignacionEmployeeAdd : function() {
			this.getCandidatos();
		},

		close : function() {
			if (this._oDialog) {
				this.onCloseDialog();
			}
		},
		
		onCloseDialog : function (oEvent) {
			this._eventBus.unsubscribe(dataEvents.asignacion_employee_add.channel, dataEvents.asignacion_employee_add.name,this.onSuscribAasignacionEmployeeAdd, this);
			this._binding.destroy();
			this._oDialog.close();
			this._oDialog.destroy();
			this._oDialog = undefined;
		},

		onPressAcept : function(oEvent){


			
		},

		validateForm : function() {
			
			var result = true;


			return result;
		},

		/*onCandidatosSelectionChange : function(oEvent) {
			var oItem = this._candidatosList.getSelectedItem();
			var path = oItem.getBindingContext("AsignacionModel").getPath();
			var candidato = this._AsignacionModel.getProperty(path);
			if (candidato.recruiting) {
				console.log("onCandidatosSelectionChange");
				oItem.setSelected(false);
			}
		},*/

		onPressAddCandidato : function(oEvent) {
			console.log("this._AsignacionData",this._AsignacionData);
			this._CandidatosListDialog.open(this._oView, this._AsignacionData);
		},

		onPressDeleteCandidato : function(oEvent) {
			var oItem = this._candidatosList.getSelectedItem();
			

			if (oItem) {
				var path = oItem.getBindingContext("AsignacionModel").getPath();
				var candidato = this._AsignacionModel.getProperty(path);
				var that = this;
				if (candidato.id) {
					
					this._ConfirmDialog.open(
						'Confirm',
						'Se procedera a eliminar a ' + candidato.employee.fullName + ' como candidato de la asignación. \n ¿Desea Continuar?',
						function() {
							jQuery.ajax({
								url : PROXY + '/asignacion/' + that._AsignacionId + '/candidatos',
								method : 'DELETE',
								dataType : 'JSON',
								data : {
									id : candidato.id
								},
								success : function() {
									MessageToast.show(candidato.employee.fullName + ' a sido eliminado como candidato.');
									that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
								},
								error : function() {
									alert("error");
								}
							});

						}
						);
				} else if (candidato.recruiting) {
					this._ConfirmDialog.open(
						'Confirm',
						'Se procedera a eliminar el recruiting como candidato de la asignación. \n ¿Desea Continuar?',
						function() {
							jQuery.ajax({
								url : PROXY + '/asignacion/' + that._AsignacionId ,
								method : 'PUT',
								dataType : 'JSON',
								data : {
									recruiting : false
								},
								success : function() {
									MessageToast.show('El recruiting a sido eliminado como candidato.');
									that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
								},
								error : function() {
									alert("error");
								}
							});

						}
						);

				}
				
			}
			
		},

		onPressReservarCandidato : function(oEvent) {
			var oItem = this._candidatosList.getSelectedItem();
			

			if (oItem) {
				var path = oItem.getBindingContext("AsignacionModel").getPath();
				var candidato = this._AsignacionModel.getProperty(path);

				if (candidato.id) {
					var that = this;
					this._ConfirmDialog.open(
						'Confirm',
						'Se reservara a ' + candidato.employee.fullName + ' como candidato de la asignación. \n ¿Desea Continuar?',
						function() {
							jQuery.ajax({
								url : PROXY + '/asignacion/' + that._AsignacionId ,
								method : 'PUT',
								dataType : 'JSON',
								data : {
									estado : 'RESERVADO',
									candidato : candidato.employee
								},
								success : function() {
									MessageToast.show(candidato.employee.fullName + ' a sido reservado como candidato.');
									that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
								},
								error : function() {
									alert("error");
								}
							});

						}
						);
				} else {
					MessageToast.show('Seleccione un Candidato por favor.');
				} 
			} else {
				MessageToast.show('Seleccione un Candidato por favor.');
			} 

		},

		onPressDratfToAsignarCandidato : function(oEvent) {

			var oItem = this._candidatosList.getSelectedItem();
			

			if (oItem) {
				var path = oItem.getBindingContext("AsignacionModel").getPath();
				var candidato = this._AsignacionModel.getProperty(path);

				if (candidato.id) {
					var that = this;
					this._ConfirmDialog.open(
						'Confirm',
						'Se asignara a ' + candidato.employee.fullName + '. \n ¿Desea Continuar?',
						function() {
							jQuery.ajax({
								url : PROXY + '/asignacion/' + that._AsignacionId ,
								method : 'PUT',
								dataType : 'JSON',
								data : {
									estado : 'ASIGNADO',
									candidato : candidato.employee
								},
								success : function() {
									MessageToast.show(candidato.employee.fullName + ' ha sido asignado.');
									that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
								},
								error : function() {
									alert("error");
								}
							});

						}
						);
				} else {
					MessageToast.show('Seleccione un Candidato por favor.');
				} 
			} else {
				MessageToast.show('Seleccione un Candidato por favor.');
			} 

		},

		onPressAsignarCandidato : function(oEvent) {
			var candidato = this._AsignacionData.candidato;
			var that = this;
			this._ConfirmDialog.open(
				'Confirm',
				'Se asignara a ' + candidato.fullName + '. \n ¿Desea Continuar?',
				function() {
					jQuery.ajax({
						url : PROXY + '/asignacion/' + that._AsignacionId ,
						method : 'PUT',
						dataType : 'JSON',
						data : {
							estado : 'ASIGNADO',
							candidato : candidato.codEmpleado
						},
						success : function() {
							MessageToast.show(candidato.fullName + ' ha sido asignado.');
							that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
						},
						error : function() {
							alert("error");
						}
					});

				}
				);
		},

		onPressVolverDraft : function(oEvent) {
			var that = this;
			this._ConfirmDialog.open(
				'Confirm',
				'Se procedera a volver al modo DRAFT. \n ¿Desea Continuar?',
				function() {
					jQuery.ajax({
						url : PROXY + '/asignacion/' + that._AsignacionId + '/toDraft',
						method : 'POST',
						success : function() {
							MessageToast.show('La asignación ahora esta en modo DRAFT');
							that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
						},
						error : function() {
							alert("error");
						}
					});

				}
			);

		},

		onPressRecruiting : function(oEvent) {
			this._RecruitingDialog.open(this._oView,this._AsignacionId);
		},

		onPressGenerarRecruiting : function(oEvent) {
			var that = this;
			this._ConfirmDialog.open(
				'Confirm',
				'Se procedera a generar la Vacante para esta asignación. \n ¿Desea Continuar?',
				function() {
					jQuery.ajax({
						url : PROXY + '/asignacion/' + that._AsignacionId + "/generarRecruiting" ,
						method : 'POST',
						success : function() {
							MessageToast.show('Recruiting generado');
							that._eventBus.publish(dataEvents.asignacion_change.channel,dataEvents.asignacion_change.name,{});
						},
						error : function() {
							alert("error");
						}
					});

				}
			);

		},

		onPressVincularRecruiting : function(oEvent) {
			this._VincularRecruitingDialog.open(
				this._oView,
				this._AsignacionData.recruiting.id
				);
		},

		onPressAddComentario : function(oEvent) {
			this._Model.setProperty('/isVisibleFeed',true);
			this._Model.setProperty('/isVisibleList',false);
			var that = this;
			this._feedInput.addEventDelegate({
			    onAfterRendering: function(){
			        that._feedInput.focus();
			    }
			});
		},

		onPostComentario : function(oEvent){
			this._Model.setProperty('/isVisibleFeed',false);
			this._Model.setProperty('/isVisibleList',true);
			
			var that = this;

			jQuery.ajax({
				url : PROXY + "/asignacion/" + this._AsignacionId + "/comentarios",
				method : 'POST',
				data : { nota : oEvent.getParameter('value')},
				success : function(data){
					//that._eventBus.publish(dataEvents.people_flow.channel,dataEvents.people_flow.name,{});
				},
				error : function(error){

				}

			});

		},

		onBack : function () {
			sap.ui.core.routing.Router.getRouter("AppRouter").onBack();
		},

		getCandidatos : function() {
			var that = this;
			jQuery.ajax({
				url : PROXY + "/candidatoAsignacion",
				method : 'GET',
				data : { 
					asignacion : this._AsignacionId,
					populate : 'employee,employee.skills,employee.asignaciones,employee.asignaciones.opportunity'
				},
				success : function(data){
					
					var aData = [];
					for (var i = 0; i < data.length; i++){
						var row = {
							title : data[i].employee.fullName,
							text : data[i].employee.vCategoriaEmpleado,
							appointments : []
						};
						if (data[i].employee._asignaciones) {
							for (var j = 0; j < data[i].employee._asignaciones.length; j++){
								row.appointments.push(
									{
										startDate : new Date(data[i].employee._asignaciones[j].desde),
										endDate : new Date(data[i].employee._asignaciones[j].hasta),
										title : data[i].employee._asignaciones[j].estado,
										text : data[i].employee._asignaciones[j]._opportunity.Account.Name + ' ' +data[i].employee._asignaciones[j]._opportunity.Name,
										type : ESTADOS[data[i].employee._asignaciones[j].estado].appointmentType,
										icon : ESTADOS[data[i].employee._asignaciones[j].estado].icon,
										key: [data[i].employee._asignaciones[j].opportunity,data[i].employee._asignaciones[j].opportunityLineItem,data[i].employee._asignaciones[j].id]
									}
			                	);
							}

						}
						
						

	                	aData.push(row);
					} 
					that._AsignacionModel.setProperty('/candidatosPlannnigCalendar',aData);
					that._AsignacionModel.refresh(true);

					if (that._AsignacionData.recruiting) {
						data.push({
							recruiting : true,
							employee : {
								fullName : 'Vacante',
								vCategoriaEmpleado : that._AsignacionData.recruiting.tipoRecruiting
							}
						});
					}
					that._AsignacionModel.setProperty('/candidatosPopulated',data);
					that._AsignacionModel.refresh(true);
					
				},
				error : function(error){

				}
			});
		},

		getComentarios : function() {
			var that = this;
			jQuery.ajax({
				url : PROXY + '/asignacion/' + this._AsignacionId + '/comentarios',
				method : 'GET',
				dataType : 'JSON',
				data : {
					populate : 'user_crea'
				},
				success : function(data) {
					that._AsignacionModel.setProperty('/comentarios',data);
				}
			});

		},

		handleAppointmentSelect : function(oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			if (oAppointment) {
				var aKeys =  oAppointment.getKey().split(',');
				var opportunityId = aKeys[0];
				var opportunityLineItemId = aKeys[1];
				var asignacionId = aKeys[2];

				this.onCloseDialog();

				if (opportunityLineItemId) {
					sap.ui.core.routing.Router.getRouter("AppRouter").navTo("requirements_detail_asignacion", 
						{
							opportunityId : opportunityId,
							opportunityLineItemId : opportunityLineItemId,
							asignacionId : asignacionId
						});
				} else {
					sap.ui.core.routing.Router.getRouter("AppRouter").navTo("requirements_detail_asignacion_without_oli", 
						{
							opportunityId : opportunityId,
							asignacionId : asignacionId
						});
				}
			}
		},

		onRowSelectionChange : function(oEvent) {
			var rows = oEvent.getParameters().rows;
			if (rows.length >= 0) {
				var aAppointments = rows[0].getAppointments();
				if (aAppointments.length > 0) {
					var startDate = aAppointments[0].getStartDate();
					for (var i = 0; i < aAppointments.length; i++){
						var auxDate = aAppointments[i].getStartDate();
						if (startDate.getTime() > auxDate.getTime()){
							startDate = auxDate;
						}
					}
					this._AsignacionModel.setProperty('/startDate',startDate);
				}
			}
			this._PlannigCalendar.selectAllRows(false);
		},

		onPressEditAsignacion : function(oEvent) {
			this._PeopleFlowDialog.openToEdit(this._oView,this._AsignacionData);
		}

		

	});
});