sap.ui.define([
	"App/model/models",
	"App/util/ModelTools"
], function(models, ModelTools) {
	"use strict";

	var MyOpportunitiesModel;

	var modelTools = new ModelTools();

	function loadData(filterSearh, filter, sorter, model) {
		return new Promise(
			function (resolve, reject) {
				_loadData(filterSearh, filter, sorter, model, resolve, reject);
			}
		);
	}
	
	function _loadData(filterSearh, filter, sorter, model, resolve, reject) {
		var where = modelTools.getWhere(filterSearh, filter);
		var sorter = modelTools.getSort(sorter, "index ASC");

		jQuery.ajax({	
			//url : PROXY + "/myOpportunity", //--->Se comenta para pruebas en locales http://api.grupoassa.com:1337
			url : "http://api.grupoassa.com:1337/myOpportunity",
			method : 'GET',
			dataType : 'JSON',
			data : {
				where : where,
				sort : sorter,
				skip : modelTools.skip,
				limit : modelTools.limit },
			success : function(data){
				if (data.length > 0) {

					var dataObj = model.getProperty('/data');
					if (dataObj.length == 0) {
						dataObj = {};
					}
					for (var i=0; i < data.length; i++){
						dataObj[data[i].id] = data[i]
					}
					
					model.setProperty('/data',dataObj);
					model.setProperty('/count',Object.keys(dataObj).length);
				} 
				
				model.setProperty('/loading',false);
				
				return resolve(data.length);

			}, 
			error : function(error) {
				reject();
			}
		});
	}

	function loadById(model, id) {
		return new Promise(
			function (resolve, reject) {
				_loadById(model, id, resolve, reject);
			}
		);
	}
	
	function _loadById(model, id, resolve, reject) {
		
		jQuery.ajax({
			//url : PROXY + "/myOpportunity/" + id, //--->Se comenta para pruebas en locales http://api.grupoassa.com:1337
			url : "http://api.grupoassa.com:1337/myOpportunity/" + id,
			method : 'GET',
			dataType : 'JSON',
			success : function(data){
				
				model.setProperty('/data/' + data.id, data);

				model.setProperty('/count',Object.keys(model.getProperty('/data')).length)
				
				model.setProperty('/loading',false);
				resolve();

			}, 
			error : function(error) {
				reject();
			}
		});
	}

	function remove(model, id) {
		return new Promise(
			function (resolve, reject) {
				_remove(model, id, resolve, reject);
			}
		);
	}

	function _remove(model, id, resolve, reject) {
		jQuery.ajax({
			//url : PROXY + '/myOpportunity', //--->Se comenta para pruebas en locales http://api.grupoassa.com:1337
			url : 'http://api.grupoassa.com:1337/myOpportunity', 
			method : 'DELETE',
			data : {
				id : id
			},
			success : function(data) {
				var dataObj = model.getProperty('/data');
				delete dataObj[id];
				model.setProperty('/data',dataObj);
				model.setProperty('/count',Object.keys(dataObj).length);

				return resolve();
			},
			error : function(error) {
				return reject();
			}
		});

	}

	function updateIndexes(model, indexesToUpdate) {
		return new Promise(
			function (resolve, reject) {
				_updateIndexes(model, indexesToUpdate, resolve, reject);
			}
		);
	}

	function _updateIndexes(model, indexesToUpdate, resolve, reject) {
		jQuery.ajax({
			//url : PROXY + '/myOpportunity/updateIndexes', //--->Se comenta para pruebas en locales http://api.grupoassa.com:1337
			url : 'http://api.grupoassa.com:1337/myOpportunity/updateIndexes',
			method : 'PUT',
			data : {
				indexesToUpdate : indexesToUpdate
			},
			success : function(data) {
				console.log("success");
				var dataObj = model.getProperty('/data');
				for (var i = 0; i < indexesToUpdate.length; i++){
					if (indexesToUpdate[i].id in dataObj) {
						console.log("actualizando index");
						dataObj[indexesToUpdate[i].id].index = indexesToUpdate[i].index;
					}
				}
				model.setProperty('/data',dataObj);
				model.setProperty('/count',Object.keys(dataObj).length);
				return resolve();
			},
			error : function(error) {
				return reject();
			}
		});

	}


	return {

		getModel : function(){

			if (MyOpportunitiesModel) {
				return MyOpportunitiesModel;
			}

			MyOpportunitiesModel = models.createDeviceModel();

			MyOpportunitiesModel.setData({
					loading : false,
					data : {},
					count : 0
				});

			modelTools.setLimit(9999);

			return MyOpportunitiesModel;
		},

		loadData : function(bRefresh, filterSearh, filter, sorter) {
			if (! MyOpportunitiesModel ) {
				return;
			}

			if (bRefresh) {
				MyOpportunitiesModel.setData({
					loading : false,
					data : {},
					count : 0
				});
				modelTools.setSkip(0);
				modelTools.setLimit(9999);
			}

			MyOpportunitiesModel.setProperty('/loading',true);

			return loadData(filterSearh, filter, sorter, MyOpportunitiesModel)
				.then(function(count){
					if (count < modelTools.limit) {
						modelTools.setSkip(modelTools.skip + count);
					} else {
						modelTools.setSkip(modelTools.skip + modelTools.limit);
					}
					return;
				});
		},

		loadById : function(id){
			
			if (! MyOpportunitiesModel ) {
				return;
			}

			loadById(MyOpportunitiesModel, id);
		},

		refreshByOpportunity : function(opportunityId, opportunityLineItemId){
			
			if (! MyOpportunitiesModel ) {
				return;
			}

			var data = MyOpportunitiesModel.getProperty('/data');
			var that = this;

			jQuery.each(data, function(id, value){
				if (opportunityId == value.opportunity &&
					opportunityLineItemId == value.opportunityLineItem) {
					console.log("la tengo en favorito");
					that.loadById(id);
					return;
				}
			});

		},

		remove : function(id) {
			if (! MyOpportunitiesModel ) {
				return;
			}

			remove(MyOpportunitiesModel, id);
		},

		updateIndexes : function(indexesToUpdate) {
			if (! MyOpportunitiesModel ) {
				return;
			}

			updateIndexes(MyOpportunitiesModel, indexesToUpdate);
		}
		
	};
});