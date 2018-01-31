/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Design Time Metadata for the sap.m.Table control
sap.ui.define([],
	function () {
		"use strict";

		return {
			aggregations: {
				columns: {
					domRef: ":sap-domref .sapMListTblHeader",
					actions: {
						move: "moveTableColumns"
					}
				}
			},
			name: {
				singular: "TABLE_NAME",
				plural: "TABLE_NAME_PLURAL"
			}
		};

	}, /* bExport= */ false);