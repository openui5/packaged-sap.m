/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2019 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Design Time Metadata for the sap.m.Button control
sap.ui.define([],
	function () {
		"use strict";

		return {
			actions: {
				combine: {
					changeType: "combineButtons",
					changeOnRelevantContainer : true,
					isEnabled : true
				},
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.$().find(".sapMBtnContent")[0];
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	}, /* bExport= */ false);