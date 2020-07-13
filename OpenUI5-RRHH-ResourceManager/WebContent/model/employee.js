sap.ui.define([
	"App/model/models",
], function(models) {
	"use strict";

	var EmployeesModel;

	var currentPromise;

	function loadData(skip, model){
		if (!currentPromise) {
			currentPromise = new Promise(function(resolve, reject){
				_loadData(skip, model, resolve, reject);
			});
		}
		return currentPromise;
	}

	function _loadData(skip, model, resolve, reject) {
		var limit = 100;
		//SOCKET.get(PROXY + '/employee', // --->Se comenta para pruebas en locales http://api.grupoassa.com:1337
			SOCKET.get('http://api.grupoassa.com:1337/employee',	
			{
				where : '{"fechaEgresoEmpleado" : null , "codEmpleado" : {"!" : "0"} }',
				populate : 'mentor,coach,pais,industria,myk,myk.skills,myk.languages,viaja,proyectosActuales,practica,subPractica,comentarios,site,estructura,equipo',
				skip : skip,
				limit : limit
			},
			function(data){
					if (data.length > 0) {
						var dataObj = model.getProperty('/data');
						if (dataObj.length == 0) {
							dataObj = {};
						}
						for (var i=0; i < data.length; i++){
							dataObj[data[i].codEmpleado] = data[i];
						}
						
						model.setProperty('/data',dataObj);
						//model.refresh(true);
						if (data.length == limit) {
							return _loadData(skip + limit, model, resolve, reject);
						} else {
							model.setProperty('/loading',false);
							currentPromise = null;
							return resolve(dataObj);
							//model.refresh(true);
						}
						model.setProperty('/loading',false);
						currentPromise = null;
						return resolve(model.getProperty('/data'));
					} else {
						model.setProperty('/loading',false);
						currentPromise = null;
						return resolve(model.getProperty('/data'));
						//model.refresh(true);
					}
					
				}



			);
	}

	function loadDataById(model, employeeId) {
		var limit = 100;
		SOCKET.get(PROXY + '/employee',
			{
				where : '{ "codEmpleado" : ' + employeeId + ' }',
				populate : 'mentor,coach,pais,industria,viaja,proyectosActuales,practica,subPractica,comentarios',
			},
			function(data){
					if (data.length) {
						console.log("Employee To Update", data[0]);
						/*var dataObj = model.getProperty('/data');
						if (dataObj.length == 0) {
							dataObj = {};
						}*/
						
						//dataObj[data[i].codEmpleado] = data[i];
						
						
						model.setProperty('/data/' + employeeId,data[0]);
						model.setProperty('/loading',false);
						//model.refresh(true);
					} else {
						model.setProperty('/loading',false);
						//model.refresh(true);
					}
					
				}



			);
	}

	function loadDataAsignacionesByRango(model, desde, hasta) {
		SOCKET.get(PROXY + '/asignacion/reservadoAsignadoByRango',
			{
				desde : desde,
				hasta : hasta
			},
			function(data){
					if (data) {
						var dataObjEmployees = model.getProperty('/data');
						for (var codEmpleado in data) {
							if (codEmpleado in dataObjEmployees) {
								console.log("data[codEmpleado]",data[codEmpleado]);
								dataObjEmployees[codEmpleado]._asignaciones = data[codEmpleado];
							}
						}
						model.setProperty('/data',dataObjEmployees);
						model.setProperty('/loading',false);
						//model.refresh(true);
					} else {
						model.setProperty('/loading',false);
						//model.refresh(true);
					}
					
				}

			);
	}

	return {
		getModel : function(){

			if (EmployeesModel) {
				return EmployeesModel;
			}

			EmployeesModel = models.createDeviceModel();

			return EmployeesModel;

		},

		loadData : function() {
			if (! EmployeesModel ) {
				return;
			}

			EmployeesModel.setData({
				loading : false,
				data : []
			});

			EmployeesModel.setProperty('/loading',true);
			//Employees//model.refresh(true);
			return loadData(0,EmployeesModel);

		},

		getAsignacionesByRango : function (desde, hasta) {
			if (! EmployeesModel ) {
				return;
			}
			loadDataAsignacionesByRango(EmployeesModel, desde, hasta);
		},


		refreshById : function(employeeId){
			if (! EmployeesModel ) {
				return;
			}
			loadDataById(EmployeesModel, employeeId);
		}


	};


	

});