/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.SelectionDetailsItemLine.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Element", 'sap/ui/base/Interface'],
	function(jQuery, Element, Interface) {
	"use strict";

	/**
	 * Constructor for a new SelectionDetailsItemLine.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This Element provides a means to fill an {@link sap.m.SelectionDetailsItem} with content.
	 * It is used for a form-like display of a label followed by a value with an optional unit.
	 * If the unit is used, the value is displayed bold.
	 * <b><i>Note:<i></b>It is protected and should ony be used within the framework itself.
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.48.1
	 *
	 * @constructor
	 * @protected
	 * @alias sap.m.SelectionDetailsItemLine
	 * @since 1.48.0
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SelectionDetailsItemLine = Element.extend("sap.m.SelectionDetailsItemLine", /** @lends sap.m.SelectionDetailsItemLine.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {
				/**
				 * The label that is shown as the first part of the line.
				 * It may contain the name of the currently selected dimension or measure.
				 */
				label: { type: "string", group: "Data" },

				/**
				 * The value of the line, for example the value of the currently selected measure.
				 */
				value: { type: "string", group: "Data" },

				/**
				 * The display value of the line. If this property is set, it overrides the value property and is displayed as is.
				 */
				displayValue: { type: "string", defaultValue: null, group: "Data" },

				/**
				 * The unit of the given value. If this unit is given, the line is displayed bold.
				 */
				unit: { type: "string", defaultValue: null, group: "Data" }

			}
		}
	});

	return SelectionDetailsItemLine;
});
