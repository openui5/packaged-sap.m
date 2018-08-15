/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['./InputRenderer', 'sap/ui/core/Renderer'],
	function(InputRenderer, Renderer) {
	"use strict";


	/**
	 * MultiInput renderer.
	 * @namespace
	 */
	var MultiInputRenderer = Renderer.extend(InputRenderer);

	MultiInputRenderer.prependInnerContent = function (oRm, oControl) {
		oRm.renderControl(oControl._tokenizer);
	};

	MultiInputRenderer.addOuterClasses = function(oRm, oControl) {
		oRm.addClass("sapMMultiInput");

		if (oControl.getTokens().length > 0) {
			oRm.addClass("sapMMultiInputHasTokens");
		}
	};

	return MultiInputRenderer;

}, /* bExport= */ true);
