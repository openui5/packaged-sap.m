/*
 * ! UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.P13nFilterItem.
sap.ui.define([
	'./library', 'sap/ui/core/Item'
], function(library, Item) {
	"use strict";

	/**
	 * Constructor for a new P13nFilterItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for <code>filterItems</code> aggregation in P13nFilterPanel control.
	 * @extends sap.ui.core.Item
	 * @version 1.52.23
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.P13nFilterItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var P13nFilterItem = Item.extend("sap.m.P13nFilterItem", /** @lends sap.m.P13nFilterItem.prototype */
	{
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * sap.m.P13nConditionOperation
				 */
				operation: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * value of the filter
				 */
				value1: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * to value of the between filter
				 */
				value2: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * key of the column
				 */
				columnKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * defines if the filter is an include or exclude filter item
				 */
				exclude: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			}
		}
	});


	P13nFilterItem.prototype.setOperation = function(sOperation) {
		return this.setProperty("operation", sOperation, true);
	};

	P13nFilterItem.prototype.setColumnKey = function(sKey) {
		return this.setProperty("columnKey", sKey, true);
	};

	P13nFilterItem.prototype.setValue1 = function(sKey) {
		return this.setProperty("value1", sKey, true);
	};

	P13nFilterItem.prototype.setValue2 = function(sKey) {
		return this.setProperty("value2", sKey, true);
	};

	P13nFilterItem.prototype.setExclude = function(sKey) {
		return this.setProperty("exclude", sKey, true);
	};

	return P13nFilterItem;

});
