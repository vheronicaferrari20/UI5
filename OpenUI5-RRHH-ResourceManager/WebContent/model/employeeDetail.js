sap.ui.define([
	"App/model/models",
], function(models) {
	"use strict";

	var EmployeeModel;

	function loadDataById(model, employeeId){
		return new Promise(function(resolve, reject){
			_loadDataById(model, employeeId, resolve, reject);
		});
	}

	function _loadDataById(model, employeeId, resolve, reject) {
		console.log('_loadDataById'+ employeeId);
		//Inicio ajax --->Test pruebas locales	
		jQuery.ajax({
			url:'http://api.grupoassa.com:1337/employee/'+ employeeId,
			method : 'GET',
			data: {
				populate : 'myk,myk.skills,myk.languages,asignaciones,pais,asignaciones.opportunity,mentor,coach,industria,viaja,comentarios,comentarios.user_crea,proyectosActuales,practica,subPractica,site',
			},
			success : function(data){
				if (data) {
					data.planningCalendar = calcularDataPlanningCalendar(data);
					console.log("DATA ->, ",data);
					model.setProperty('/data/',data);
					model.setProperty('/loading',false);
				} else {
					model.setProperty('/loading',false);
				}
				return resolve(data);
			}, 
			error : function(error){
				return reject();
			}
		});
// Fin ajax --->Test pruebas locales
		
		/**
		//SOCKET.get(PROXY + '/employee/'+ employeeId, //--->Se comenta para pruebas en locales http://api.grupoassa.com:1337
		SOCKET.get('http://api.grupoassa.com:1337/employee/'+ employeeId,		
			{
				populate : 'myk,myk.skills,myk.languages,asignaciones,pais,asignaciones.opportunity,mentor,coach,industria,viaja,comentarios,comentarios.user_crea,proyectosActuales,practica,subPractica,site',
			},
			function(data){
					if (data) {
						data.planningCalendar = calcularDataPlanningCalendar(data);
						console.log("DATA ->, ",data);
						model.setProperty('/data/',data);
						model.setProperty('/loading',false);
					} else {
						model.setProperty('/loading',false);
					}
					return resolve(data);
				},
			function(error){
				return reject();
			}
			);
		
		
		 * 
		 */
	}

	function calcularDataPlanningCalendar (employee) {
		
		var pCalendarData = [];
		for (var i = 0; i < employee.asignaciones.length; i++) {
			pCalendarData.push( {
				title : employee.asignaciones[i]._opportunity.Account.Name,
				text : employee.asignaciones[i]._opportunity.Name,
				appointments : 
				[
					{
						startDate : new Date(employee.asignaciones[i].desde),
						endDate : new Date(employee.asignaciones[i].hasta),
						title : employee.asignaciones[i].estado,
						key : [employee.asignaciones[i].opportunity, employee.asignaciones[i].opportunityLineItem, employee.asignaciones[i].id],
						type : ESTADOS[employee.asignaciones[i].estado].appointmentType,
						icon : ESTADOS[employee.asignaciones[i].estado].icon
					}
				] 
			});
		}

		return pCalendarData;
	}
	
	return {
		_currentId : undefined,

		getModel : function(){

			if (EmployeeModel) {
				return EmployeeModel;
			}

			EmployeeModel = models.createDeviceModel();

			return EmployeeModel;
		},

		loadDataById : function(employeeId) {
			this._currentId = employeeId;

			if (! EmployeeModel ) {
				return;
			}

			EmployeeModel.setData({
				loading : false,
				data : []
			});

			EmployeeModel.setProperty('/loading',true);
			return loadDataById(EmployeeModel,employeeId);
		},

		refreshById : function(employeeId) {
			console.log("employeeId",employeeId);
			console.log("this._currentId", this._currentId);
			if (! EmployeeModel || employeeId != this._currentId) {

				return;
			}
			console.log("actualizando employee");
			EmployeeModel.setProperty('/loading',true);
			loadDataById(EmployeeModel,employeeId);
		}

	};

});