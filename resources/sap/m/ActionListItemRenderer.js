/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2020 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * ActionListItem renderer.
	 * @namespace
	 */
	var ActionListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRenderManager the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *          oControl an object representation of the control that should be
	 *          rendered
	 */
	ActionListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMALI");
	};

	ActionListItemRenderer.renderLIContent = function(rm, oLI) {

		var isText = oLI.getText();

		// List item label
		if (isText) {
			rm.write("<div class='sapMALIText'>");
			rm.writeEscaped(isText);
			rm.write("</div>");
		}
	};

	return ActionListItemRenderer;

}, /* bExport= */ true);
