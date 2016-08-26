 /*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global'],
	function() {
	"use strict";

	/**
	 * HeaderContainer Renderer.
	 * @namespace
	 */
	var HeaderContainerRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl the control to be rendered
	 */
	HeaderContainerRenderer.render = function(oRm, oControl) {
		var sTooltip = oControl.getTooltip_AsString();
		// write the HTML into the render manager
		oRm.write("<div");
		oRm.writeControlData(oControl);
		if (sTooltip && (typeof sTooltip === "string")) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.addClass("sapMHdrCntr");
		oRm.addClass(oControl.getView());
		if (oControl.getShowDividers()) {
			oRm.addClass("sapMHrdrCntrDvdrs");
		}
		oRm.writeClasses();
		if (oControl.getHeight()) {
			oRm.addStyle("height", oControl.getHeight());
		}
		oRm.addStyle("width", oControl.getWidth());
		oRm.writeStyles();
		var sDesc = "";
		var aItems = oControl.getItems();
		for (var i = 0; aItems && i < aItems.length; i++) {
			sDesc += aItems[i].getId() + " ";
		}
		oRm.writeAttribute("aria-labelledby", sDesc);
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttributeEscaped("id", oControl.getId() + "-scroll-area");
		oRm.addClass("sapMHdrCntrCntr");
		oRm.addClass(oControl.getView());
		oRm.addClass("sapMHdrCntrBG" + oControl.getBackgroundDesign());
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.getAggregation("_scrollContainer"));
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-after");
		oRm.writeAttribute("tabindex", "0");
		oRm.write("/>");
		oRm.write("</div>");

		var oButton = oControl.getAggregation("_prevButton");
		if (oButton) {
			oRm.write("<div");
			oRm.addClass("sapMHdrCntrBtnCntr");
			oRm.addClass("sapMHdrCntrLeft");
			oRm.addClass(oControl.getView());
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oButton);
			oRm.write("</div>");
		}

		oButton = oControl.getAggregation("_nextButton");
		if (oButton) {
			oRm.write("<div");
			oRm.addClass("sapMHdrCntrBtnCntr");
			oRm.addClass("sapMHdrCntrRight");
			oRm.addClass(oControl.getView());
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oButton);
			oRm.write("</div>");
		}
		oRm.write("</div>");
	};

	return HeaderContainerRenderer;

}, /* bExport= */ true);
