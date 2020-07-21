sap.ui.define([
	"sap/ui/core/UIComponent",
	"App/model/models",
	"sap/ui/Device",
	'sap/ui/model/json/JSONModel',
	'sap/m/MessageToast',
    'App/data/dataModel',
    'App/data/dataEvents',
    'App/model/employee',
    'App/jquery-cookie/jquery.cookie',
    'App/model/notificacion',
    'App/model/notificacionHistorico',
    'App/model/employee',
    'App/model/employeeDetail',
    'App/model/requirements',
    'App/model/opportunities',
    'App/model/formatter',
    'App/model/myopportunities',
    'App/controller/employee/EmployeesViewSettingsDialog',
    'App/AppRouter',
   

], function(UIComponent, models, Device, JSONModel, MessageToast,dataModel,dataEvents, employeeModel,jqueryCookie, notificacion, notificacionHistorico, employee, employeeDetail, requirements, opportunities, formatter, myopportunities, EmployeesViewSettingsDialog, AppRouter) {
	"use strict";

    return UIComponent.extend("App.Component", {
    	formatter : formatter,
    	
    	metadata: {
			manifest: "json"
		},
		
		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		
		
		init: function() {
			
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().register("AppRouter");
			
			this.setModel(new JSONModel(dataModel));
			
			this.setModel(new JSONModel({headerVisible:false}),'App');
			
			$.ajaxSetup({
				crossDomain: true,
				useDefaultHeader :false,
			    beforeSend: function (xhr, settings)
			    {
			    	var _token = sap.ui.getCore()._token; //-->Testing Vero
			    	//console.log('jqueryCookie: '+jqueryCookie);
			    	if (settings.url.indexOf('?') >= 0) {
			    		settings.url += '&';
			    	} else {
			    		settings.url += '?';
			    	}
			    	//settings.url += 'token=' + jQuery.cookie('api_token'); //-->comentado para tenting Vero
			    	var _data = sap.ui.getCore()._data; //-->Testing Vero
			    	if( !_data ){                       //-->Testing Vero
			    		that.setDataUser(_data);        //-->Testing Vero
			    	};
			    	settings.url += 'token=' + _token; //-->Testing Vero
			    	//console.log('settings.url: '+settings.url);
			    	
			       	//xhr.setRequestHeader("Authorization","Token " + jQuery.cookie('token'));        
			    },
			    statusCode: {
				    403: function(data) {
				    	jQuery.removeCookie("token");
				    	that.setHeaderVisible(false);
						that.getRouter().getTargets().display("login");
				    }
				}
			});

			var that = this;

			if (!jQuery.cookie('api_token')) {
				//console.log('Paso por !jQuery.cookie');
				that.setHeaderVisible(false); 
				that.getRouter().getTargets().display("login");	
			}else{

				// verifico el token				
				jQuery.ajax({
					//url : PROXY + '/auth/verifyToken', --->Se comenta para pruebas en localhost
					url: 'http://api.grupoassa.com:1337/auth/verifyToken',
					method : 'POST',
					data : {
						token : jQuery.cookie('api_token')
					},
					success : function(data){
						//console.log('Pasa por: http://api.grupoassa.com:1337/auth/verifyToken');
						that.setDataUser(data);
						that.configIO();
						that.getRouter().initialize();
						that.setHeaderVisible(true);
						that.setMastersModels();
					},
					error : function(error){
						// Renderizo Login
						//that.setHeaderVisible(false);
						//that.getRouter().getTargets().display("login");
					}
				}); 
				
			}
			

			this._eventBus = sap.ui.getCore().getEventBus();
			
			this._eventBus.subscribe(dataEvents.add_skill.channel, dataEvents.add_skill.name,this.loadDataMasterSkillModel , this);
			this._eventBus.subscribe(dataEvents.update_skill.channel, dataEvents.update_skill.name,this.loadDataMasterSkillModel , this);
			this._eventBus.subscribe(dataEvents.delete_skill.channel, dataEvents.delete_skill.name,this.loadDataMasterSkillModel , this);
			
			this._eventBus.subscribe(dataEvents.add_idioma.channel, dataEvents.add_idioma.name,this.loadDataMasterIdiomaModel , this);
			this._eventBus.subscribe(dataEvents.update_idioma.channel, dataEvents.update_idioma.name,this.loadDataMasterIdiomaModel , this);
			this._eventBus.subscribe(dataEvents.delete_idioma.channel, dataEvents.delete_idioma.name,this.loadDataMasterIdiomaModel , this);

			this._EmployeesViewSettingsDialog = new EmployeesViewSettingsDialog();
		},

		setHeaderVisible : function(value){
			this.setModel(new JSONModel({headerVisible:value}),'App');
		},

		setDataUser : function(data) {
			this.setModel(new JSONModel(data),'DataUser'); 
		},

		setMastersModels : function(){
			
			this._UserPreferencesMasterModel = new JSONModel();
			this.setModel(this._UserPreferencesMasterModel, 'UserPreferencesMasterModel');

			this._IdiomaMasterModel = new JSONModel();
			this.setModel(this._IdiomaMasterModel, 'IdiomaMasterModel');

			// MyK SKILS

			this._MyKPracticeModules_KPracticeMasterModel = new JSONModel();
			this.setModel(this._MyKPracticeModules_KPracticeMasterModel, 'MyKPracticeModules_KPracticeMasterModel');

			this._MyKPracticeModules_KSubPracticeMasterModel = new JSONModel();
			this.setModel(this._MyKPracticeModules_KSubPracticeMasterModel, 'MyKPracticeModules_KSubPracticeMasterModel');

			this._MyKPracticeModules_KModulesMasterModel = new JSONModel();
			this.setModel(this._MyKPracticeModules_KModulesMasterModel, 'MyKPracticeModules_KModulesMasterModel');

			this._MyKPracticeModules_KSubModulesMasterModel = new JSONModel();
			this.setModel(this._MyKPracticeModules_KSubModulesMasterModel, 'MyKPracticeModules_KSubModulesMasterModel');

			this._KLevelMasterModel = new JSONModel();
			this.setModel(this._KLevelMasterModel, 'KLevelMasterModel');

			////////////////////////////////////////////////////////////////////////////////////////////////////////

			// MyK Idiomas

			this._MyKLanguages = new JSONModel();
			this.setModel(this._MyKLanguages, 'MyKLanguagesMasterModel');

			this._MyKActivityLanguages = new JSONModel();
			this.setModel(this._MyKActivityLanguages, 'MyKActivityLanguages');

			this._MyKLevelLanguages = new JSONModel();
			this.setModel(this._MyKLevelLanguages, 'MyKLevelLanguages');


			////////////////////////////////////////////////////////////////////////////////////////////////////////

			this._CategoriaMasterModel = new JSONModel();
			this.setModel(this._CategoriaMasterModel, 'CategoriaMasterModel');

			this._IndustriaMasterModel = new JSONModel();
			this.setModel(this._IndustriaMasterModel, 'IndustriaMasterModel');

			this._PracticaMasterModel = new JSONModel();
			this.setModel(this._PracticaMasterModel, 'PracticaMasterModel');

			this._SubPracticaMasterModel = new JSONModel();
			this.setModel(this._SubPracticaMasterModel, 'SubPracticaMasterModel');

			this._UnidadMasterModel = new JSONModel();
			this.setModel(this._UnidadMasterModel, 'UnidadMasterModel');

			this._OpportunitiesStagesMasterModel = new JSONModel();
			this.setModel(this._OpportunitiesStagesMasterModel, 'OpportunitiesStagesMasterModel');

			this._OpportunitiesPlatformsMasterModel = new JSONModel();
			this.setModel(this._OpportunitiesPlatformsMasterModel, 'OpportunitiesPlatformsMasterModel');

			this._OpportunitiesServiceTypeMasterModel = new JSONModel();
			this.setModel(this._OpportunitiesServiceTypeMasterModel, 'OpportunitiesServiceTypeMasterModel');

			this._PaisMasterModel = new JSONModel();
			this.setModel(this._PaisMasterModel, 'PaisMasterModel');

			this._PaisSalesforceMasterModel = new JSONModel({Name : 'no especificado'});
			this.setModel(this._PaisSalesforceMasterModel, 'PaisSalesforceMasterModel');

			this._NotificacionesCountModel = new JSONModel();
			this.setModel(this._NotificacionesCountModel, 'NotificacionesCountModel');

			this._SitesMasterModel = new JSONModel();
			this.setModel(this._SitesMasterModel, 'SitesMasterModel');

			this._EstructurasMasterModel = new JSONModel();
			this.setModel(this._EstructurasMasterModel, 'EstructurasMasterModel');

			this._EquiposMasterModel = new JSONModel();
			this.setModel(this._EquiposMasterModel, 'EquiposMasterModel');

			this._OpportunitiesAccountMasterModel = new JSONModel([]);
			this.setModel(this._OpportunitiesAccountMasterModel, 'OpportunitiesAccountMasterModel');

			this.loadDataUserPreferencesMasterModel();

			this.loadDataMyKPracticeModules_KPractice();
			this.loadDataMyKPracticeModules_KSubPracticeMasterModel();
			this.loadDataMyKPracticeModules_KModulesMasterModel();
			this.loadDataMyKPracticeModules_KSubModulesMasterModel();
			this.loadDataKLevelMasterModel();

			this.loadDataMyKLanguages();
			this.loadDataMyKActivityLanguages();
			this.loadDataMyKLevelLanguages();

			this.loadDataCategoriaMasterModel();
			this.loadDataIndustriaMasterModel();
			this.loadDataPracticaMasterModel();
			this.loadDataSubPracticaMasterModel();
			this.loadDataUnidadMasterModel();
			this.loadDataSitesMasterModel();
			this.loadDataEstructurasMasterModel();
			this.loadDataEquiposMasterModel();

			this.loadDataOpportunitiesStagesMasterModel();
			this.loadDataOpportunitiesPlatformsMasterModel();
			this.loadDataOpportunitiesServiceTypeMasterModel();

			this.loadDataPaisMasterModel();

			this.loadDataNotificacionesCountModel();

			this.loadDataPaisSalesforceMasterModel();
		},

		loadDataMyKPracticeModules_KPractice : function() {
			this._MyKPracticeModules_KPracticeMasterModel.loadData( 'http://api.grupoassa.com:1337/MyKPracticeModules_KPractice_View?limit=false');
					//(PROXY + '/MyKPracticeModules_KPractice_View?limit=false');// --->Se comenta para pruebas en locales
		},

		loadDataMyKPracticeModules_KSubPracticeMasterModel: function() {
			this._MyKPracticeModules_KSubPracticeMasterModel.loadData('http://api.grupoassa.com:1337/MyKPracticeModules_KSubpractice_View?limit=false');
			//(PROXY + '/MyKPracticeModules_KSubpractice_View?limit=false');  //--->Se comenta para pruebas en locales
		},

		loadDataMyKPracticeModules_KModulesMasterModel: function() {
			this._MyKPracticeModules_KModulesMasterModel.loadData('http://api.grupoassa.com:1337/MyKPracticeModules_KModule_View?limit=false')
			//(PROXY + '/MyKPracticeModules_KModule_View?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataMyKPracticeModules_KSubModulesMasterModel: function() {
			this._MyKPracticeModules_KSubModulesMasterModel.loadData('http://api.grupoassa.com:1337/MyKPracticeModules_KSubmodule_View?limit=false'); 
			//(PROXY + '/MyKPracticeModules_KSubmodule_View?limit=false');  //--->Se comenta para pruebas en locales
		},

		loadDataKLevelMasterModel: function() {
			this._KLevelMasterModel.setData([
				{'KLevelID': 1, 'KLevelDescription_Code': 'Básico'}, 
				{'KLevelID': 2, 'KLevelDescription_Code': 'Intermedio'}, 
				{'KLevelID': 3, 'KLevelDescription_Code': 'Avanzado'}, 
				{'KLevelID': 4, 'KLevelDescription_Code': 'Experto'}
			]);
		},

		loadDataMyKLanguages: function(){
			this._MyKLanguages.loadData('http://api.grupoassa.com:1337/MyKLanguages');
			//(PROXY + '/MyKLanguages'); //--->Se comenta para pruebas en locales
		},

		loadDataMyKActivityLanguages: function() {
			this._MyKActivityLanguages.setData([
				{'Catalogue_Code': 1, 'Description_Code': 'Lectura'}, 
				{'Catalogue_Code': 2, 'Description_Code': 'Escritura'}, 
				{'Catalogue_Code': 3, 'Description_Code': 'Conversación'}
			]);

		},

		loadDataMyKLevelLanguages: function() {
			this._MyKLevelLanguages.setData([
				{'Catalogue_Code': 1, 'Description_Code': 'Ninguno'}, 
				{'Catalogue_Code': 2, 'Description_Code': 'Básico'}, 
				{'Catalogue_Code': 3, 'Description_Code': 'Intermedio'},
				{'Catalogue_Code': 4, 'Description_Code': 'Avanzado'},
				{'Catalogue_Code': 5, 'Description_Code': 'Nativo'}
			]);

		},

		loadDataUserPreferencesMasterModel : function() {
			this._UserPreferencesMasterModel.loadData("http://api.grupoassa.com:1337/UserPreferences/myPreferences");
			//(PROXY + "/UserPreferences/myPreferences"); //--->Se comenta para pruebas en locales
		},

		loadDataMasterIdiomaModel : function(){
			this._IdiomaMasterModel.loadData('http://api.grupoassa.com:1337/idioma?limit=false');
			//(PROXY + '/idioma?limit=false');  //--->Se comenta para pruebas en locales
		},

		loadDataCategoriaMasterModel : function(){
			this._CategoriaMasterModel.loadData('http://api.grupoassa.com:1337/categoria?limit=false');
			//(PROXY + '/categoria?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataIndustriaMasterModel : function(){
			this._IndustriaMasterModel.loadData('http://api.grupoassa.com:1337/industria?limit=false');
			//(PROXY + '/industria?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataPracticaMasterModel : function(){
			this._PracticaMasterModel.loadData('http://api.grupoassa.com:1337/practica?limit=false');
			//(PROXY + '/practica?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataSubPracticaMasterModel : function(){
			this._SubPracticaMasterModel.loadData('http://api.grupoassa.com:1337/subPractica?limit=9999&activa=S');
			//(PROXY + '/subPractica?limit=9999&activa=S'); //--->Se comenta para pruebas en locales
		},

		loadDataUnidadMasterModel : function(){
			this._UnidadMasterModel.loadData('http://api.grupoassa.com:1337/unidad?limit=false');
			//(PROXY + '/unidad?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataSitesMasterModel : function(){
			this._SitesMasterModel.loadData('http://api.grupoassa.com:1337/sites?limit=false');
			//(PROXY + '/sites?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataEstructurasMasterModel : function(){
			this._EstructurasMasterModel.loadData('http://api.grupoassa.com:1337/estructura?limit=false');
			//(PROXY + '/estructura?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataEquiposMasterModel : function(){
			this._EquiposMasterModel.loadData('http://api.grupoassa.com:1337/equipo?limit=false');
			//(PROXY + '/equipo?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataOpportunitiesStagesMasterModel : function(){
			this._OpportunitiesStagesMasterModel.loadData('http://api.grupoassa.com:1337/opportunitySalesforce/getOpportunitiesStages');
			//(PROXY + '/opportunitySalesforce/getOpportunitiesStages'); //--->Se comenta para pruebas en locales
		},

		loadDataOpportunitiesPlatformsMasterModel : function(){
			this._OpportunitiesPlatformsMasterModel.loadData('http://api.grupoassa.com:1337/opportunityLineItemSalesforce/getAllPlatform');
			//(PROXY + '/opportunityLineItemSalesforce/getAllPlatform'); //--->Se comenta para pruebas en locales
		},

		loadDataOpportunitiesServiceTypeMasterModel : function(){
			this._OpportunitiesServiceTypeMasterModel.loadData('http://api.grupoassa.com:1337/opportunityLineItemSalesforce/getAllPlatform');
			//(PROXY + '/opportunityLineItemSalesforce/getAllServiceType'); //--->Se comenta para pruebas en locales
		},


		loadDataPaisMasterModel : function(){
			this._PaisMasterModel.loadData('http://api.grupoassa.com:1337/pais?limit=false');
			//(PROXY + '/pais?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataPaisSalesforceMasterModel : function(){
			this._PaisSalesforceMasterModel.loadData('http://api.grupoassa.com:1337/paisSalesforce?limit=false');
			//(PROXY + '/paisSalesforce?limit=false'); //--->Se comenta para pruebas en locales
		},

		loadDataNotificacionesCountModel : function() {
			this._NotificacionesCountModel.loadData('http://api.grupoassa.com:1337/notificacion/countPendientes');
			//(PROXY + '/notificacion/countPendientes'); //--->Se comenta para pruebas en locales
		},

		loadDataOpportunitiesAccountMasterModel : function() {
			if(this._OpportunitiesAccountMasterModel.getData().length == 0){
				this._OpportunitiesAccountMasterModel.setSizeLimit(99999);
				this._OpportunitiesAccountMasterModel.loadData('http://api.grupoassa.com:1337/AccountSalesforce?limit=99999');
				//(PROXY + '/AccountSalesforce?limit=99999');	 //--->Se comenta para pruebas en locales	
			}
		},

		updateCountModel : function(op) { // op -> ['+'|'-']
			var count = this._NotificacionesCountModel.getProperty('/count');
			if (op == '+') {
				count++;
			} else if (op == '-') {
				count--;
			}
			this._NotificacionesCountModel.setProperty('/count', count);
		},

		resetCountModel : function() { 
			this._NotificacionesCountModel.setProperty('/count', 0);
		},

		configIO : function() {
			/**
			 //--->Se comenta para pruebas en localhost
			 */
			io.sails.headers = {   
			  "Authorization": "Token " + jQuery.cookie("api_token")  
			};

			var that = this;

			SOCKET = io.sails.connect();             

			SOCKET.get('/notificacion',{limit : 1}); 

			SOCKET.get('/asignacion',{limit : 0});   

			var assaID = this.getModel('DataUser').getProperty('/assaID'); 
			
			SOCKET.on("notificacion",function(msg){
				//if (msg.verb == 'created' && assaID != msg.data.user) {
					that.updateCountModel('+')
					notificacion.pop(msg.data);
					notificacionHistorico.pop(msg.data);
				//}
			});

			SOCKET.on("employeeupdate",function(employeeId){
				console.log("employeeupdate",employeeId);
				employee.refreshById(employeeId);
				employeeDetail.refreshById(employeeId);
			});

			SOCKET.on("people_flow_change",function(msg){
				console.log("msg", msg);
				requirements.refreshByOpportunityIdAsignacionId(
					msg.opportunity_id,
					msg.opportunity_line_item_id,
					msg.asignacion_id,
					msg.destroyed,
					msg.reload
					);
				
				opportunities.refreshByOpportunityId(
					msg.opportunity_id,
					msg.opportunity_line_item_id
					);
				
				myopportunities.refreshByOpportunity(
					msg.opportunity_id,
					msg.opportunity_line_item_id
					);
				console.log("people_flow_change",msg);
			});



			this._NotificacionesModel = notificacion.getModel();
			this.setModel(this._NotificacionesModel,'NotificacionesModel');
			
		},

		getEmployeesViewSettingsDialog : function() {
			return this._EmployeesViewSettingsDialog;
		}
		
    } );

});