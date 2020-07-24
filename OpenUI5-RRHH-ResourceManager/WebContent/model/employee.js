sap.ui.define([
	"App/model/models",
	'sap/ui/model/json/JSONModel',
], function(models) {
	"use strict";

	var EmployeesModel;

	var currentPromise;
	
	function loadData(skip, model){

		console.log("llama al loadData -skip: "+ skip+' model '+model);
		if (!currentPromise) {
			currentPromise = new Promise(function(resolve, reject){
				_loadData(skip, model, resolve, reject);
			});
		}
		return currentPromise;
	}

	function _loadData(skip, model, resolve, reject) {
		
	      //Inicio ajax --->Test pruebas locales	
		var country = ["ARG","BRA","CHI","COL","MEX","ESP","USA"];
		var cluster =["0","ACC","AYC","CDJ","CEP","CGP","CO0","COR","CRD","CSC","FIN","LEG",
			          "MKT","RGA","RGB","RGC","RGN","RGU","RRH","SGS","SSN","SST","TAX","TEC"];

        var limit = 1000;
        
        country.forEach(function(elemento, indice, array) {
        	
            var countryid = country[indice];
            var where = '{"fechaEgresoEmpleado" : null,  "codEmpleado" : {"!" : "0"}, "pais" : "' + countryid +'"}';
        
		jQuery.ajax({
			url:'http://api.grupoassa.com:1337/employee',
			method : 'GET',
			data: {
				where : where, 
				populate : 'mentor,coach,pais,industria,myk,myk.skills,myk.languages,viaja,proyectosActuales,practica,subPractica,comentarios,site,estructura,equipo',
				skip : skip,
				limit : limit
			},
			async: true,
			success : function(data){
				if (data.length > 0) {
					var dataObj = model.getProperty('/data');
					if (dataObj.length == 0) {
						dataObj = {};
					}
					
					var eq = false;
					for (var i=0; i < data.length; i++){
						cluster.forEach(function(elemento, indice, array){
							if(  data[i].cluster === cluster[indice]){
								eq = true;
							}
							});
						if(eq === false){
							dataObj[data[i].codEmpleado] = data[i];
						}
						eq = false;
					}
					
					model.setProperty('/data',dataObj);
					
					if (data.length == limit) {
						return _loadData(skip + limit, model, resolve, reject);
					} else {
						model.setProperty('/loading',false);
						currentPromise = null;
						return resolve(dataObj);
					}
					model.setProperty('/loading',false);
					currentPromise = null;
					return resolve(model.getProperty('/data'));
				} else {
					model.setProperty('/loading',false);
					currentPromise = null;
					return resolve(model.getProperty('/data'));
				}
			}, 
			error : function(error){
				console.log("error", error);
			}
		});
        })        
// Fin ajax --->Test pruebas locales
		
		/**
// Se comenta para testing local-Vero
		var limit = 1000; //--> de 100 a 1000 -Test Vero

		//SOCKET.get(PROXY + '/employee', // --->Se comenta para pruebas en locales http://api.grupoassa.com:1337
			SOCKET.get( url, //'http://api.grupoassa.com:1337/employee',	
			{
				where : '{"fechaEgresoEmpleado" : null , "codEmpleado" : {"!" : "0"} }',
				populate : 'mentor,coach,pais,industria,myk,myk.skills,myk.languages,viaja,proyectosActuales,practica,subPractica,comentarios,site,estructura,equipo',
				skip : skip,
				limit : limit
			},
			function(data){
				console.log('function(data) data.length'+ data.length );
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
			
  *///Fin de testing local-Vero
	}

	function loadDataById(model, employeeId) {
		console.log('loadDataById: '+ employeeId);
		var limit = 100;
		//Inicio de testing local-Vero
		jQuery.ajax({
			url:'http://api.grupoassa.com:1337/employee',
			method : 'GET',
			data: {
				where : '{ "codEmpleado" : ' + employeeId + ' }',
				populate : 'mentor,coach,pais,industria,viaja,proyectosActuales,practica,subPractica,comentarios',
				//limit : limit
			},
			async: false,
			success : function(data){
				console.log("Employee To Update", data[0]);				
				model.setProperty('/data/' + employeeId,data[0]);
				model.setProperty('/loading',false);
			}, 
			error : function(error){
				model.setProperty('/loading',false);
			}
		});
		
		/**
		 * //Se comenta la llamada Sails
		
		SOCKET.get(PROXY + '/employee',
			{
				where : '{ "codEmpleado" : ' + employeeId + ' }',
				populate : 'mentor,coach,pais,industria,viaja,proyectosActuales,practica,subPractica,comentarios',
			},
			function(data){
					if (data.length) {
						console.log("Employee To Update", data[0]);
						//var dataObj = model.getProperty('/data');
						//if (dataObj.length == 0) {
						//	dataObj = {};
						//}
						
						//dataObj[data[i].codEmpleado] = data[i];
						
						
						model.setProperty('/data/' + employeeId,data[0]);
						model.setProperty('/loading',false);
						//model.refresh(true);
					} else {
						model.setProperty('/loading',false);
						//model.refresh(true);
					}
					
				}

			); //-->Fin comentario a la llamada x Sails -Vero
*/ //Fin de testing local-Vero
	}

	function loadDataAsignacionesByRango(model, desde, hasta) {
		console.log('loadDataAsignacionesByRango desde: '+ desde +' hasta: '+hasta );
		
		//Inicio de testing local-Vero
		jQuery.ajax({
			url:'http://api.grupoassa.com:1337/asignacion/reservadoAsignadoByRango',
			method : 'GET',
			data: {
					desde : desde,
					hasta : hasta
			},
			async: false,
			success : function(data){
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
				} else {
					model.setProperty('/loading',false);
				}
			}
		});

		/** //Se comenta la llamada x Sails
		 * 	 
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
			*/ //-->Fin comentario Vero
		//Fin de testing local-Vero
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