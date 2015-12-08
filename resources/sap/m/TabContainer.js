/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.TabContainer.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function(jQuery, library, Control) {
	"use strict";



	/**
	 * Constructor for a new TabContainer.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The TabContainer control represents a collection of tabs with associated content.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.34.1
	 *
	 * @constructor
	 * @public
     * @since 1.34
	 * @alias sap.m.TabContainer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TabContainer = Control.extend("sap.m.TabContainer", /** @lends sap.m.TabContainer.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {

				/**
				 * Defines whether add new button is shown in the tab strip
				 */
				showAddNewButton : {type : "boolean", group : "Misc", defaultValue : false}
			},
			aggregations : {

				/**
				 * The items displayed in the TabContainer.
				 */
				items : {type : "sap.m.TabContainerItem", multiple : true},

				/**
				 * The add button displayed in the TabStrip.
				 */
				_addNewButton : {type : "sap.m.Button", multiple : false, visibility : "hidden"},

				/**
				 * Internal aggregation for managing the tab elements.
				 */
			_tabStrip : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"}
			},
			associations : {

				/**
				 * Sets or retrieves the selected item from the aggregation named items.
				 */
				selectedItem : {type : "sap.m.TabContainerItem", multiple : false}
			},
			events : {

				/**
				 * Fired when an item wants to be closed.
				 */
				itemClose: {
					allowPreventDefault: true,
					parameters: {

						/**
						 * The item to be closed.
						 */
					item: {type: "sap.m.TabContainerItem"}
					}
				},

				/**
				 * Fired when an item is pressed.
				 */
				itemSelect: {
					parameters: {

						/**
						 * The selected item.
						 */
						item: { type: "sap.m.TabContainerItem" }
					}
				},

				/**
				 * Fired when add new button is pressed.
				 */
				addNewButtonPress: { }
			}
		}
	});

	TabContainer.prototype.onBeforeRendering = function() {

		if (this.getSelectedItem()) {
			return;
		}

		// ToDo: remove tab to item everywhere
		this._setDefaultTab();
	};

	TabContainer.prototype._getAddNewTabButton = function() {
		var oControl = this.getAggregation("_addNewButton");

		if (!oControl) {
			oControl = new sap.m.Button({
				type: sap.m.ButtonType.Transparent,
				icon: sap.ui.core.IconPool.getIconURI("add"),
				press: function() {
					this.getParent().getParent().fireAddNewButtonPress();
				}
			});

			this.setAggregation("_addNewButton", oControl, true);
		}

		return oControl;
	};

	/**
	 * Lazy initializes the tab strip aggregation.
	 */
	TabContainer.prototype._getTabStrip = function () {
		var oControl = this.getAggregation("_tabStrip");

		if (!oControl) {
			oControl = new sap.m.TabStrip(this.getId() + "--tabstrip", {
				hasSelect: true,
				itemPress: function(oEvent) {
					var oItem = oEvent.getParameter("item"),
						oSelectedItem = this._fromTabStripItem(oItem);

					this.fireItemSelect({ item: oSelectedItem });

					this.setSelectedItem(oSelectedItem);
				}.bind(this),
				itemCloseRequest: function(oEvent) {
					var oItem = oEvent.getParameter("item"),
						oRemovedItem = this._fromTabStripItem(oItem);

					oEvent.preventDefault();

					this.fireItemClose({
						item: oRemovedItem,
						confirm: function () {
							this.removeItem(oRemovedItem); // the tabstrip item will also get removed
						}.bind(this)
					});
				}.bind(this)
			});

			this.setAggregation("_tabStrip", oControl, true);
		}

		return oControl;
	};

	TabContainer.prototype._fromTabStripItem = function(oItem) {
		var aItems = this.getItems() || [],
			iItemsCount = aItems.length,
			i = 0;

		for (; i < iItemsCount; i++) {
			if (aItems[i].getId() === oItem.getKey()) {
				return aItems[i];
			}
		}

		return null;
	};

	/**
	 * Returns <code>sap.m.TabStripItem</code> corresponding to given <code>sap.m.TabContainerItem</code>.
	 * @param {sap.m.TabContainerItem | string} vItem object or id of the TabContainerItem
	 * @returns {sap.m.TabStripItem} tabstrip item corresponding to given <code>sap.m.TabContainerItem</code>
	 * @protected
	 */
	TabContainer.prototype._toTabStripItem = function(vItem) {
		var oTabStripItems = this._getTabStrip().getItems(),
			oTabStripItemsCount = oTabStripItems.length,
			sKey = vItem,
			i = 0;

		if (typeof vItem === "object") {
			sKey = vItem.getId();
		}

		for (; i < oTabStripItemsCount; i++) {
			if (oTabStripItems[i].getKey() === sKey) {
				return oTabStripItems[i];
			}
		}

		return null;
	};

	TabContainer.prototype._getSelectedItemContent = function() {
		var sSelectedItem = this.getSelectedItem(),
			oSelectedItem = sap.ui.getCore().byId(sSelectedItem),
			oTabStripItem = this._toTabStripItem(oSelectedItem);

		this._getTabStrip().setSelectedItem(oTabStripItem);

		return oSelectedItem ? oSelectedItem.getContent() : null;
	};

	TabContainer.prototype._setDefaultTab = function() {
		var oSelectedItem = this.getItems()[0] || null;

		this.setSelectedItem(oSelectedItem);

		return oSelectedItem;
	};

	/**
	 * Removes an item from the aggregation named <code>items</code>.
	 *
	 * @param {int | string | sap.m.TabContainerItem} vItem The item to remove or its index or id.
	 * @returns {sap.m.TabContainerItem} The removed item or null.
	 * @public
	 */
	TabContainer.prototype.removeItem = function(vItem) {
		var oTabStripItem;

		vItem = this.removeAggregation("items", vItem);

		if (!vItem) {
			return null;
		}

		if (vItem.getId() === this.getSelectedItem()) {
			this._setDefaultTab();
		}

		oTabStripItem = this._toTabStripItem(vItem);
		this._getTabStrip().removeItem(oTabStripItem);

		return vItem;
	};

	/**
	 * Override the method in order to handle propagation of item property changes to the _tabStrip instance copies.
	 * @param {string} sAggregationName Name of the added aggregation
	 * @param {object} oObject Intance that is going to be added
	 * @param {boolean} bSuppressInvalidate Flag indicating whether invalidation should be supressed
	 * @returns {object} This instance for chaining
	 */
	TabContainer.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === 'items') {
			// ToDo: maybe these event listeners have to be also detached?
			oObject.attachItemPropertyChanged(function (oEvent) {
				var oTabStripItem = this._toTabStripItem(oEvent.getSource());
				// ToDo: refactor code to remove inconsistency and avoid this mapping
				var sPropertyKey = oEvent['mParameters'].propertyKey;
				if (sPropertyKey === 'name') {
					sPropertyKey = 'text';
				}

				if (oTabStripItem) {
					oTabStripItem.setProperty(sPropertyKey, oEvent['mParameters'].propertyValue);
				}
			}.bind(this));
		}
		return Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};


	TabContainer.prototype.addItem = function(oItem) {
		this.addAggregation("items", oItem);

		this._getTabStrip().addItem(
			new sap.m.TabStripItem({
				key: oItem.getId(),
				text: oItem.getName(),
				modified: oItem.getModified()
			})
		);

		return oItem;
	};

	TabContainer.prototype.destroyItems = function() {
		this._getTabStrip().destroyItems();

		return this.destroyAggregation("items");
	};

	TabContainer.prototype.insertItem = function(oItem, iIndex) {
		this._getTabStrip().insertItem(
			new sap.m.TabStripItem({
				key: oItem.getId(),
				text: oItem.getName(),
				modified: oItem.getModified()
			}),
			iIndex
		);

		return this.insertAggregation("items", oItem, iIndex);
	};

	TabContainer.prototype.removeAllItems = function() {
		this._getTabStrip().removeAllItems();

		this.setSelectedItem(null);

		return this.removeAllAggregation("items");
	};

	TabContainer.prototype.setAddButton = function (oButton) {
		return this._getTabStrip().setAddButton(oButton);
	};

	TabContainer.prototype.getAddButton = function () {
		return this._getTabStrip().getAddButton();
	};

	TabContainer.prototype.setShowAddNewButton = function (bShowButton) {
		var oTabStrip = this._getTabStrip(),
			oButton = bShowButton ? this._getAddNewTabButton() : null;

		oTabStrip.setAddButton(oButton);

		this.setAggregation("_tabStrip", oTabStrip, true);
	};



	return TabContainer;

}, /* bExport= */ true);
