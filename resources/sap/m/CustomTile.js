/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.CustomTile.
sap.ui.define(['./Tile', './library', './CustomTileRenderer'],
	function(Tile, library, CustomTileRenderer) {
	"use strict";



	/**
	 * Constructor for a new CustomTile.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Use the CustomTile control to display application specific content in the Tile control.
	 * The tile width is 8.5em and height is 10em.
	 * @extends sap.m.Tile
	 * @version 1.58.2
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @deprecated As of version 1.50, use {@link sap.m.GenericTile} instead
	 * @alias sap.m.CustomTile
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CustomTile = Tile.extend("sap.m.CustomTile", /** @lends sap.m.CustomTile.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/CustomTile.designtime",
		defaultAggregation : "content",
		aggregations : {

			/**
			 * Defines the content of the CustomTile.
			 */
			content : {type : "sap.ui.core.Control", multiple : false}
		}
	}});




	return CustomTile;

});
