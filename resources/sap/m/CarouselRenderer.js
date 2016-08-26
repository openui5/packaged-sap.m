/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * Carousel renderer.
	 * @namespace
	 */
	var CarouselRenderer = {
	};

	/**
	 * Renders the Carousel's HTML, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	CarouselRenderer.render = function(rm, oCarousel){
		var aPages = oCarousel.getPages(),
			iPageCount = aPages.length,
			sPageIndicatorPlacement = oCarousel.getPageIndicatorPlacement(),
			sArrowsPlacement = oCarousel.getArrowsPlacement();

		this._renderOpeningDiv(rm, oCarousel);

		//visual indicator
		if (sPageIndicatorPlacement === sap.m.PlacementType.Top) {
			this._renderPageIndicatorAndArrows({
				rm: rm,
				iPageCount: iPageCount,
				sArrowsPlacement : sArrowsPlacement,
				bBottom: false,
				bShowPageIndicator: oCarousel.getShowPageIndicator()
			}, oCarousel);
		}

		this._renderInnerDiv(rm, oCarousel, aPages, sPageIndicatorPlacement);

		if (sap.ui.Device.system.desktop && iPageCount > 1 && sArrowsPlacement === sap.m.CarouselArrowsPlacement.Content) {
			this._renderHudArrows(rm, oCarousel);
		}

		//visual indicator
		if (sPageIndicatorPlacement === sap.m.PlacementType.Bottom) {
			this._renderPageIndicatorAndArrows({
				rm: rm,
				iPageCount: iPageCount,
				sArrowsPlacement : sArrowsPlacement,
				bBottom: true,
				bShowPageIndicator: oCarousel.getShowPageIndicator()
			}, oCarousel);
		}

		this._renderClosingDiv(rm);
		//page-wrap ends
	};

	CarouselRenderer._renderOpeningDiv = function(rm, oCarousel) {
		var sTooltip = oCarousel.getTooltip_AsString();

		//Outer carousel div
		rm.write("<div");
		rm.writeControlData(oCarousel);
		// custom F6 handling
		rm.writeAttribute("data-sap-ui-customfastnavgroup", "true");

		rm.addStyle("width", oCarousel.getWidth());
		rm.addStyle("height", oCarousel.getHeight());
		rm.writeStyles();

		rm.addClass("sapMCrsl");
		//'sapMCrslFluid' is originally from mobify-carousel
		rm.addClass("sapMCrslFluid");

		// add all classes (also custom classes) to carousel tag
		rm.writeClasses();

		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		rm.writeAttributeEscaped("tabindex","0");

		// ARIA
		rm.writeAccessibilityState(oCarousel, {
			role: "list"
		});

		rm.write(">");
	};

	CarouselRenderer._renderInnerDiv = function (rm, oCarousel, aPages, sPageIndicatorPlacement) {
		rm.write("<div class='sapMCrslInner'>");
		//do housekeeping
		oCarousel._cleanUpScrollContainer();

		var fnRenderPage = function(oPage, iIndex, aArray) {
			//item div
			rm.write("<div class='sapMCrslItem");
			if (aArray.length > 1 && oCarousel.getShowPageIndicator()) {
				if (sPageIndicatorPlacement === sap.m.PlacementType.Bottom) {
					rm.write(" sapMCrslBottomOffset");
				} else {
					rm.write(" sapMCrslTopOffset");
				}
			}

			if (aArray.length > 1 && sap.ui.Device.system.desktop &&
				oCarousel.getArrowsPlacement() === sap.m.CarouselArrowsPlacement.PageIndicator) {
				if (sPageIndicatorPlacement === sap.m.PlacementType.Bottom) {
					rm.write(" sapMCrslBottomArrowsOffset");
				} else {
					rm.write(" sapMCrslTopArrowsOffset");
				}
			}

			rm.write("' id='" + oCarousel.sId + "-" + oPage.sId + "-slide'");

			// ARIA
			rm.writeAccessibilityState(oPage, {
				role: "listitem",
				posinset: iIndex + 1,
				setsize: aArray.length
			});

			rm.write(">");
			rm.renderControl(oCarousel._createScrollContainer(oPage, iIndex));
			rm.write("</div>");
		};

		//Render Pages
		aPages.forEach(fnRenderPage);

		rm.write("</div>");
	};

	CarouselRenderer._renderClosingDiv = function(rm) {
		rm.write('</div>');
	};

	/**
	 * Renders the page indicator, using the provided {@link sap.ui.core.RenderManager}.
	 * Page indicator is only rendered if there is more than one carousel page
	 *
	 * @param {Object} settings.rm - oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {Array} settings.iPages
	 * @param {boolean} settings.bBottom
	 * @param {boolean} settings.bShowPageIndicator
	 * @private
	 */
	CarouselRenderer._renderPageIndicatorAndArrows = function(settings, oCarousel){
		var rm = settings.rm,
			iPageCount = settings.iPageCount,
			bShowIndicatorArrows = sap.ui.Device.system.desktop && settings.sArrowsPlacement === sap.m.CarouselArrowsPlacement.PageIndicator,
			bBottom = settings.bBottom,
			bShowPageIndicator = settings.bShowPageIndicator,
			oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m'),
			sOffsetCSSClass = "",
			sArrowsClass = "";

		// If there is only one page - do not render the indicator
		if (iPageCount <= 1) {
			return;
		}

		if (bShowPageIndicator || bShowIndicatorArrows) {
			if (bBottom) {
				sOffsetCSSClass += " sapMCrslControlsBottom";
			} else {
				sOffsetCSSClass += " sapMCrslControlsTop";
			}
		}

		rm.write('<div class="sapMCrslControls' + sOffsetCSSClass + '">');

		// left arrow
		if (bShowIndicatorArrows) {
			this._renderPrevArrow(rm, oCarousel);
		}

		// bullets
		if (!bShowIndicatorArrows) {
			sArrowsClass = "sapMCrslBulletedNoArrows";
		}

		if (bShowPageIndicator) {
			rm.write('<div class="sapMCrslBulleted ' + sArrowsClass + '">');
		} else {
			rm.write('<div class="sapMCrslBulleted ' + sArrowsClass + '" style="opacity: 0;">');
		}

		for (var i = 1; i <= iPageCount; i++) {
			rm.write("<span role='img' data-slide=" + i + " aria-label='" + oResourceBundle.getText('CAROUSEL_POSITION', [i, iPageCount]) + "'>" + i + "</span>");
		}

		rm.write('</div>');
		// end bullets

		// right arrow
		if (bShowIndicatorArrows) {
			this._renderNextArrow(rm, oCarousel);
		}

		rm.write('</div>');
	};

	CarouselRenderer._renderHudArrows = function(rm, oCarousel) {
		//heads up controls for desktop browsers
		rm.write('<div class="sapMCrslHud">');

		this._renderPrevArrow(rm, oCarousel);

		this._renderNextArrow(rm, oCarousel);

		rm.write("</div>");
	};

	CarouselRenderer._renderPrevArrow = function(rm, oCarousel) {
		rm.write("<a class='sapMCrslPrev' href='#' data-slide='prev' tabindex='-1'><div class='sapMCrslArrowInner'>");
		rm.renderControl(oCarousel._getNavigationArrow('left'));
		rm.write("</div></a>");
	};

	CarouselRenderer._renderNextArrow = function(rm, oCarousel) {
		rm.write("<a class='sapMCrslNext' href='#' data-slide='next' tabindex='-1'><div class='sapMCrslArrowInner'>");
		rm.renderControl(oCarousel._getNavigationArrow('right'));
		rm.write("</div></a>");
	};
	return CarouselRenderer;

}, /* bExport= */ true);
