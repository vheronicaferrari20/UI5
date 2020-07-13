sap.ui.define([
	"App/model/models",
	"App/util/ModelTools",
	'sap/ui/model/Filter'
], function(models, ModelTools, Filter) {
	"use strict";

	var RecruitingsModel;

	var modelTools = new ModelTools();

	function loadData(filterSearh, filter, sorter, model) {
		return new Promise(
			function (resolve, reject) {
				_loadData(filterSearh, filter, sorter, model, resolve, reject);
			}
		);
	}
	
	function _loadData(filterSearh, filter, sorter, model, resolve, reject) {
		filter.push(new Filter("estado","EQ","GENERADO"));
		filter.push(new Filter("estado","EQ","FINALIZADO"));
		filter.push(new Filter("estado","EQ","CANCELADO"));

		var where = modelTools.getWhere(filterSearh, filter);
		var sorter = modelTools.getSort(sorter, "CreatedAt DESC");
		console.log("sorter",sorter);

		jQuery.ajax({
			url : PROXY + "/recruiting",
			method : 'GET',
			dataType : 'JSON',
			data : {
				where : where,
				sort : sorter,
				skip : modelTools.skip,
				limit : modelTools.limit,
				populate : "asignacion,asignacion.pais,candidato" },
			success : function(data){
				if (data.length > 0) {
					console.log("data", data);
					var dataObj = model.getProperty('/data');
					if (dataObj.length == 0) {
						dataObj = {};
					}
					for (var i=0; i < data.length; i++){
						dataObj[i] = data[i];
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
			url : PROXY + "/opportunityViewSalesforce",
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

			if (RecruitingsModel) {
				return RecruitingsModel;
			}

			RecruitingsModel = models.createDeviceModel();

			RecruitingsModel.setData({
					loading : false,
					data : {}
				});

			return RecruitingsModel;
		},

		loadData : function(bRefresh, filterSearh, filter, sorter) {
			if (! RecruitingsModel ) {
				return;
			}

			if (bRefresh) {
				RecruitingsModel.setData({
					loading : false,
					data : {}
				});
				modelTools.setSkip();
				modelTools.setLimit();
			}

			RecruitingsModel.setProperty('/loading',true);

			return loadData(filterSearh, filter, sorter, RecruitingsModel)
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
			
			if (! RecruitingsModel ) {
				return;
			}

			loadDataByOpportunityId(RecruitingsModel, opportunityId, opportunityLineItemId);
		}


		
	};
});