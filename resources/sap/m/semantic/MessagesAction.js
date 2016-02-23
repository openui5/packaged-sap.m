/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/m/semantic/SemanticButton', 'sap/ui/base/ManagedObject'], function(SemanticButton, ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new MessagesAction.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Custom initial settings for the new control
	 *
	 * @class
	 * A MessagesAction button has default semantic-specific properties and is
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticButton
	 *
	 * @author SAP SE
	 * @version 1.36.3
	 *
	 * @constructor
	 * @public
	 * @since 1.36
	 * @alias sap.m.semantic.MessagesAction
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var MessagesAction = SemanticButton.extend("sap.m.semantic.MessagesAction", /** @lends sap.m.semantic.MessagesAction.prototype */ {
		metadata: {
			library: "sap.m",
			properties : {

				/**
				 * The count of messages to indicate
				 */
				count : {
					type : "int",
					group : "Appearance",
					defaultValue : 0
				}
			}
		}
	});

	MessagesAction.prototype.init = function() {
		if (SemanticButton.prototype.init) {
			SemanticButton.prototype.init.call(this);
		}
		this._applyProperty("text", "0");
	};

	MessagesAction.prototype.setCount = function(iValue) {
		ManagedObject.prototype.setProperty.call(this, "count", iValue);

		this._applyProperty("text", iValue);
		return this;
	};

	return MessagesAction;

}, /* bExport= */ true);
