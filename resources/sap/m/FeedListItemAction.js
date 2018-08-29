/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(["sap/ui/core/Element"],
	function(Element) {
	"use strict";

	/**
	 * Constructor for a new FeedListItemAction.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class An action item of FeedListItem
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.52.18
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.FeedListItemAction
	 * @since 1.52.0
	 * @ui5-metamodel This element will be described in the UI5 (legacy) designtime metamodel as well
	 */
	var FeedListItemAction = Element.extend("sap.m.FeedListItemAction", /** @lends sap.m.FeedListItemAction.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * The icon of the action.
				 */
				icon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: null },

				/**
				 * The text of the item. It is used as a tooltip and for accessibility reasons.
				 */
				text: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * The key of the item.
				 */
				key: { type: "string", group: "Misc", defaultValue: "" }
			},
			events: {
				/**
				 * The <code>press</code> event is fired when the user triggers the corresponding action.
				 */
				press: {}
			}
		}
	});

	return FeedListItemAction;
});
