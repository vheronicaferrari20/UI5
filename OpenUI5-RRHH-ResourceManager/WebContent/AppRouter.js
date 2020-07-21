sap.ui.define([
		'sap/ui/core/routing/Router',
		'sap/m/routing/RouteMatchedHandler',
		'sap/ui/core/routing/History',
		'sap/m/routing/Targets',
		 
	], function(Router,RouterMatchedHandler,History) {
	"use strict";
	sap.ui.core.routing.Router.extend("App.AppRouter",{
		constructor:function(){  //sap.m.routing.Router or sap.m.routing.Targets
			sap.ui.core.routing.Router.apply(this,arguments);
			this.oRouteMatchedHandler = new sap.m.routing.RouteMatchedHandler(this);
			console.log("Router",this.oRouterMatchedHandler);
		},
		onBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.navTo("home", null, true);
			}
		},
	});
});