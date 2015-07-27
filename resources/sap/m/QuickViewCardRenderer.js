/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		"use strict";

		/**
		 * @class QuickViewCard renderer.
		 * @static
		 */
		var QuickViewCardRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *          oRm the RenderManager that can be used for writing to the render output buffer
		 * @param {sap.ui.core.Control}
		 *          oQuickView an object representation of the control that should be rendered
		 */
		QuickViewCardRenderer.render = function(oRm, oQuickViewCard) {

			var oContent = oQuickViewCard.getNavContainer();

			oRm.write("<div");
			oRm.addClass("sapMQuickViewCard");
			oRm.writeControlData(oQuickViewCard);
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oContent);
			oRm.write("</div>");
		};

		return QuickViewCardRenderer;

	}, /* bExport= */ true);
