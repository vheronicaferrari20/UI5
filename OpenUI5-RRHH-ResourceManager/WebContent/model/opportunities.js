sap.ui.define([
	"App/model/models",
	"App/util/ModelTools"
], function(models, ModelTools) {
	"use strict";

	var OpportunitiesModel;

	var modelTools = new ModelTools();

	function loadData(filterSearh, filter, sorter, model) {
		var history = sap.ui.getCore()._hFlag;
		
		return new Promise(
			function (resolve, reject) {
				_loadData(filterSearh, filter, sorter, model, resolve, reject,history);
			}
		);
	}
	
	function _loadData(filterSearh, filter, sorter, model, resolve, reject,history) {
		
		var country = ["ARGENTINA","BRASIL","CHILE","COLOMBIA","MEXICO","ESPAÑA","ESTADOS UNIDOS"];
		
		var where = modelTools.getWhere(filterSearh, filter);
		
		var flag;
	
		if(!where){
			flag = false;
		}
		
		if (history) {
			//For cuando history is TRUE
			country.forEach(function(elemento, indice, array) {
				
		        var countryid = country[indice];
			    if(flag === false){
				    where = '{"IsDeleted" : false,  "OpportunityPais" : "'+ countryid + '"}'; //  "MEXICO"}';			
			    }
				
			    var sorter = modelTools.getSort(sorter, "CreatedDate DESC");
			    console.log('modelTools.skip: '+modelTools.skip);
			    var limit = 2000;

			jQuery.ajax({
				//url : PROXY + "/opportunityViewSalesforce", //-->Se comenta para Test-Vero
				url: 'http://api.grupoassa.com:1337/opportunityViewSalesforce', //Test Vero
				method : 'GET',
				dataType : 'JSON',
				data : {
					where : where,
					sort : sorter,
					skip : modelTools.skip,
					limit : limit }, //modelTools.limit }, //-->Se comenta x testing Vero
				async: true,		
				success : function(data){
					if (data.length > 0) {
						//console.log("data", data);
						var dataObj = model.getProperty('/data');
						if (dataObj.length == 0) {
							dataObj = {};
						}
						//console.log('countryid: '+ countryid+ ' data.length: '+data.length);
						for (var i=0; i < data.length; i++){

							if ( ! data[i].OpportunityLineItemId) {
								dataObj[data[i].Id + '_'] = data[i];
							} else {
								dataObj[data[i].Id + '_' + data[i].OpportunityLineItemId] = data[i];
							}
						}
						
						model.setProperty('/data',dataObj);
					} 
					
					model.setProperty('/loading',false);
					
					return resolve(data.length);

				}, 
				error : function(error) {
					reject();
				}
			});
			})
			//Fin cuando history es True
		} else {
			
		//For cuando history is false
		country.forEach(function(elemento, indice, array) { 
	        var countryid = country[indice];
		    if(flag === false){
			    where = '{"IsDeleted" : false,  "OpportunityPais" : "'+ countryid + '"}'; //  "MEXICO"}';			
		    }
			
		    var sorter = modelTools.getSort(sorter, "CreatedDate DESC");
		    var limit = 2000;

		jQuery.ajax({
			//url : PROXY + "/opportunityViewSalesforce", //-->Se comenta para Test-Vero
			url: 'http://api.grupoassa.com:1337/opportunityViewSalesforce', //Test Vero
			method : 'GET',
			dataType : 'JSON',
			data : {
				where : where,
				sort : sorter,
				skip : modelTools.skip,
				limit : limit }, //modelTools.limit }, //-->Se comenta x testing Vero
			async: true,		
			success : function(data){
				var today = new Date();
				var currentYear = today.getFullYear().toString(); 
				var yearToday = parseInt(currentYear); //año actual
				var oneYearAgo = yearToday - 1; //un año atras
				var contCant0 = 0;
				var contCant1 = 0;
				var cleanStage = '';
				var cleanYear = '';
				var limitMonth = '';
				var yearMonthAgo1 = oneYearAgo + '-11';
				var yearMonthAgo2 = oneYearAgo + '-12';
				var yearMonthAgo = '';
				
				if (data.length > 0) {
					var dataObj = model.getProperty('/data');
					if (dataObj.length == 0) {
						dataObj = {};
					}
					//console.log('countryid: '+ countryid+ ' data.length: '+data.length);
					
					for (var i=0; i < data.length; i++){
						cleanStage = data[i].StageName.slice(0,2); //etapa 
											
						//Esto porque CreatedDate (Inicio SF) puede venir null
						if(data[i].CreatedDate){ 
							cleanYear = data[i].CreatedDate.slice(0,4) //tag text <Inicio SF> CreatedDate
							limitMonth = data[i].CreatedDate.slice(5,7) //tag text <Inicio SF>
							yearMonthAgo = data[i].CreatedDate.slice(0,7); //tag text <Inicio SF>
						
							var yearOpp = parseInt(cleanYear); //Año oportunidad.
							var monthOpp = parseInt(limitMonth); // Mes oportunidad
						
						//Limitar el modelo en etapas y años:
							if (((cleanStage != "09") && (cleanStage != "10") && (cleanStage != "11") && (cleanStage != "12"))) {
								contCant0 += 1
								if (yearOpp && monthOpp) { 
									if ((yearOpp >= yearToday) || (yearMonthAgo == yearMonthAgo1) || (yearMonthAgo == yearMonthAgo2)){
										contCant1 += 1
			
										if ( !data[i].OpportunityLineItemId) {
											dataObj[data[i].Id + '_'] = data[i];
										} else {
											dataObj[data[i].Id + '_' + data[i].OpportunityLineItemId] = data[i];								
										}
									}
								} 
							}
						} else { //Si inicio SF bien undefiand
							
							if (((cleanStage != "09") && (cleanStage != "10") && (cleanStage != "11") && (cleanStage != "12"))) {
								if ( !data[i].OpportunityLineItemId) {
									dataObj[data[i].Id + '_'] = data[i];
								} else {
									dataObj[data[i].Id + '_' + data[i].OpportunityLineItemId] = data[i];								
								}
							}
						}
					}
					
					model.setProperty('/data',dataObj);
				} 
				
				model.setProperty('/loading',false);
				
				return resolve(data.length);

			}, 
			error : function(error) {
				reject();
			}
		});
		}) // Fin: For cuando history is false
		}
	}

	function loadDataByOpportunityId(model, opportunityId, opportunityLineItemId) {
		return new Promise(
			function (resolve, reject) {
				_loadDataByOpportunityId(model, opportunityId, opportunityLineItemId, resolve, reject);
			}
		);
	}
	
	function _loadDataByOpportunityId(model, opportunityId, opportunityLineItemId, resolve, reject) {
		

		var pModel = opportunityId + "_" + ((opportunityLineItemId) ? opportunityLineItemId : '');
		
		if (!model.getProperty("/data/" + pModel)) {
			return resolve();
		}

		var where = {
			Id : opportunityId
		};

		if (opportunityLineItemId) {
			where.OpportunityLineItemId = opportunityLineItemId;
		}

		jQuery.ajax({
			//url : PROXY + "/opportunityViewSalesforce", //-->Se comenta para Test-Vero
			url: 'http://api.grupoassa.com:1337/opportunityViewSalesforce', //Test Vero
			method : 'GET',
			dataType : 'JSON',
			data : {
				where : JSON.stringify(where)
			},
			success : function(data){
				if (data.length) {
					model.setProperty('/data/' + pModel ,data[0]);
				} 
				model.setProperty('/loading',false);
				resolve();

			}, 
			error : function(error) {
				reject();
			}
		});
	}

	return {

		getModel : function(){

			if (OpportunitiesModel) {
				return OpportunitiesModel;
			}

			OpportunitiesModel = models.createDeviceModel();

			OpportunitiesModel.setData({
					loading : false,
					data : {}
				});

			return OpportunitiesModel;
		},

		loadData : function(bRefresh, filterSearh, filter, sorter) {
			if (! OpportunitiesModel ) {
				return;
			}

			if (bRefresh) {
				OpportunitiesModel.setData({
					loading : false,
					data : {}
				});
				modelTools.setSkip();
				modelTools.setLimit();
			}

			OpportunitiesModel.setProperty('/loading',true);

			return loadData(filterSearh, filter, sorter, OpportunitiesModel)
				.then(function(count){
					if (count < modelTools.limit) {
						modelTools.setSkip(modelTools.skip + count);
					} else {
						modelTools.setSkip(modelTools.skip + modelTools.limit);
					}
					return;
				});
		},

		refreshByOpportunityId : function(opportunityId, opportunityLineItemId){
			
			if (! OpportunitiesModel ) {
				return;
			}

			loadDataByOpportunityId(OpportunitiesModel, opportunityId, opportunityLineItemId);
		}	
	};
});