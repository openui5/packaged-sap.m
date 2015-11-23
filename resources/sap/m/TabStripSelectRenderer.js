/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/m/SelectRenderer', 'sap/ui/core/ValueStateSupport', 'sap/m/TabStripSelect'],
	function(jQuery, Renderer, SelectRenderer, ValueStateSupport, TabStripSelect) {
		"use strict";

		var TabStripSelectRenderer = Renderer.extend(SelectRenderer);

		TabStripSelectRenderer.render = function(oRm, oSelect) {
			var	sTooltip = ValueStateSupport.enrichTooltip(oSelect, oSelect.getTooltip_AsString()),
			       bAutoAdjustWidth = oSelect.getAutoAdjustWidth(),
			       bEnabled = oSelect.getEnabled(),
			       CSS_CLASS = SelectRenderer.CSS_CLASS;

			oRm.write("<button");
			if (bEnabled && sap.ui.Device.system.desktop) {
				oRm.addClass(CSS_CLASS + "Hoverable");
			}
			if (!oSelect.getVisible()) {
				oRm.addStyleClass(TabStripSelect.CSS_CLASS_INVISIBLE);
			}
			this.addStyleClass(oRm, oSelect);
			oRm.addClass(CSS_CLASS);
			oRm.addClass('sapMTabSelect');
			oRm.addClass(CSS_CLASS + oSelect.getType());

			if (!bEnabled) {
				oRm.addClass(CSS_CLASS + "Disabled");
			}

			if (bAutoAdjustWidth) {
				oRm.addClass(CSS_CLASS + "AutoAdjustedWidth");
			} else {
				oRm.addStyle("width", oSelect.getWidth());
			}

			oRm.addClass(CSS_CLASS + "WithArrow");
			oRm.addStyle("max-width", oSelect.getMaxWidth());
			oRm.writeControlData(oSelect);
			oRm.writeStyles();
			oRm.writeClasses();
			this.writeAccessibilityState(oRm, oSelect);

			if (sTooltip) {
				oRm.writeAttributeEscaped("title", sTooltip);
			}

			// by specification we do not this to to be tabbable at all
			oRm.writeAttribute("tabindex", "-1");

			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapMSltInner");
			oRm.writeClasses();
			oRm.write(">");


			this.renderIcon(oRm, oSelect);


			if (oSelect._isRequiredSelectElement()) {
				this.renderSelectElement(oRm, oSelect);
			}

			oRm.write("</div>");
			oRm.write("</button>");
		};

		return TabStripSelectRenderer;

	}, /* bExport= */ true);
