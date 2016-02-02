/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
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
		 * @version 1.36.1
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
					 * Defines whether an <code>Add New Tab</code> button is displayed in the TabStrip.
					 */
					showAddNewButton : {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations : {

					/**
					 * The items displayed in the <code>TabContainer</code>.
					 */
					items : {type : "sap.m.TabContainerItem", multiple : true},

					/**
					 * The <code>Add New Tab</code> button displayed in the <code>TabStrip</code>.
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
					 * Fired when an item is closed.
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
					 * Fired when <code>Add New Tab</code> button is pressed.
					 */
					addNewButtonPress: { }
				}
			},
			constructor : function (vId, mSettings) {
				var aStashedItems = [];

				// normalize the expected arguments
				if (!mSettings && typeof vId === 'object') {
					mSettings = vId;
				}

				/* Store the items for later and remove them for the initialization of the control to avoid racing
				 * condition with the initialization of the tab strip. This is only required when the items aggregation
				 * is initialized directly with an array of TabContainer items without data binding and a template. */
				if (Array.isArray(mSettings['items'])) {
					aStashedItems = mSettings['items'];
					delete mSettings['items'];
				}

				sap.ui.base.ManagedObject.prototype.constructor.apply(this, arguments);
				var oControl = new sap.m.TabStrip(this.getId() + "--tabstrip", {
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

						// prevent the tabstrip from closing the item by default
						oEvent.preventDefault();
						if (this.fireItemClose({item: oRemovedItem})) {
							this.removeItem(oRemovedItem); // the tabstrip item will also get removed
						}

					}.bind(this)
				});

				this.setAggregation("_tabStrip", oControl, true);

				if (mSettings && mSettings['showAddNewButton']) {
					this.setShowAddNewButton(true);
				}

				// re-introduce any existing items from the constructor settings
				aStashedItems.forEach(function (oItem) {
					this.addItem(oItem);
				}, this);
			}
		});

		/**
		 * Lazy loads the control attached to the private <code>Add New Button</code> aggregation
		 * @returns {null | sap.m.Button} The <code>Add New Tab</code> button if present or null
		 * @private
		 */
		TabContainer.prototype._getAddNewTabButton = function() {
			var oControl = this.getAggregation("_addNewButton");
			var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			if (!oControl) {
				oControl = new sap.m.Button({
					type: sap.m.ButtonType.Transparent,
					tooltip: oRb.getText("TABCONTAINER_ADD_NEW_TAB"),
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
		 * Gets a reference to the instance of the TabStrip aggregation.
		 */
		TabContainer.prototype._getTabStrip = function () {
			return this.getAggregation("_tabStrip");
		};

		/**
		 * Finds a <code>TabContainerItem</code> corresponding to a given <code>TabStripItem</code>.
		 *
		 * @param oItem {sap.m.TabStripItem} <code>TabStripItem</code> instance, the corresponding <code>TabContainerItem</code> to be searched for
		 * @returns {sap.m.TabStripItem | null} The <code>TabContainerItem</code> found (if any)
		 * @private
		 */
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
		 * Finds the <code>sap.m.TabStripItem</code> corresponding to a given <code>sap.m.TabContainerItem</code>.
		 *
		 * @param {sap.m.TabContainerItem | string} vItem object or ID of the <code>TabContainerItem</code>
		 * @returns {sap.m.TabStripItem | null} <code>TabStripItem</code> corresponding to a given <code>sap.m.TabContainerItem</code> (if any)
		 * @protected
		 */
		TabContainer.prototype._toTabStripItem = function(vItem) {
			var i = 0,
				sKey = vItem,
				oTabStripItems,
				oTabStripItemsCount,
				oTabStrip = this._getTabStrip();

			if (!oTabStrip) {
				// resolves error /getItems() of null/ in case only the _tabStrip aggregation was for some reason removed/destroyed from the container
				return null;
			}
			oTabStripItems = oTabStrip.getItems();
		    oTabStripItemsCount = oTabStripItems.length;

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

		/**
		 * Gets the <code>TabContainerItem</code> content if present.
		 * @returns { null | array <sap.ui.core.Control> }
		 * @private
		 */
		TabContainer.prototype._getSelectedItemContent = function() {
			var oTabStrip     = this._getTabStrip(),
				sSelectedItem = this.getSelectedItem(),
				oSelectedItem = sap.ui.getCore().byId(sSelectedItem),
				oTabStripItem = this._toTabStripItem(oSelectedItem);

			// ToDo: Maybe the selected item of the TabStrip should not be handled here?
			if (oTabStrip) {
				// resolves error /getItems() of null/ in case only the _tabStrip aggregation was for some reason removed/destroyed from the container
				oTabStrip.setSelectedItem(oTabStripItem);
			}

			return oSelectedItem ? oSelectedItem.getContent() : null;
		};

		/**
		 * Calculates the next item to be focused and selected and applies the focus and selection when an item is removed.
		 *
		 * @param bSetAsSelected {boolean} Whether the next item to be selected
		 * @private
		 */
		TabContainer.prototype._moveToNextItem = function (bSetAsSelected) {
			var iItemsCount = this.getItems().length,
					iCurrentFocusedIndex = this._getTabStrip()._oItemNavigation.getFocusedIndex(),
					iNextIndex = iItemsCount === iCurrentFocusedIndex ? --iCurrentFocusedIndex : iCurrentFocusedIndex,
					oNextItem = this.getItems()[iNextIndex],
					fnFocusCallback = function () {
						this._getTabStrip()._oItemNavigation.focusItem(iNextIndex);
					};

			// Selection (causes invalidation)
			if (bSetAsSelected) {
				this.setSelectedItem(oNextItem);
				// Notify the subscriber
				this.fireItemSelect({item: oNextItem});
			}
			// Focus (force to wait until invalidated)
			jQuery.sap.delayedCall(0, this, fnFocusCallback);
		};

		/**
		 * Removes an item from the aggregation named <code>items</code>.
		 *
		 * @param vItem {int | string | sap.m.TabContainerItem} The item to remove or its index or ID
		 * @returns {sap.m.TabContainerItem} The removed item or null
		 * @public
		 */
		TabContainer.prototype.removeItem = function(vItem) {
			var bIsSelected;

			if (!vItem) {
				return null;
			}

			// The selection flag of the removed item
			bIsSelected = vItem.getId() === this.getSelectedItem();
			//Remove the corresponding TabContainerItem
			vItem = this.removeAggregation("items", vItem);
			this._getTabStrip().removeItem(this._toTabStripItem(vItem));
			// Perform selection switch
			this._moveToNextItem(bIsSelected);


			return vItem;
		};

		/**
		 * Overrides the method in order to handle propagation of item property changes to the <code>_tabStrip</code> instance copies.
		 *
		 * @param sAggregationName {string} Name of the added aggregation
		 * @param oObject {object} Instance that is going to be added
		 * @param bSuppressInvalidate {boolean} Flag indicating whether invalidation should be suppressed
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

		/**
		 * Adds a new <code>TabContainerItem</code> to the <code>items</code> aggregation of the <code>TabContainer</code>.
		 *
		 * @param oItem {sap.m.TabContainerItem} The new <code>TabContainerItem</code> to be added
		 * @returns {sap.m.TabContainerItem} The newly added <code>TabContainerItem</code>
		 * @override
		 */
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

		/**
		 * Destroys all <code>TabContainerItem</code> entities from the <code>items</code> aggregation of the <code>TabContainer</code>.
		 *
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
		TabContainer.prototype.destroyItems = function() {
			this._getTabStrip().destroyItems();

			return this.destroyAggregation("items");
		};

		/**
		 * Inserts a new <code>TabContainerItem</code> to the <code>items</code> aggregation of the <code>TabContainer</code> at a specified index.
		 *
		 * @param oItem {sap.m.TabContainerItem} The new <code>TabContainerItem</code> to be inserted
		 * @param iIndex {int} The index where the passed <code>TabContainerItem</code> to be inserted
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
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

		/**
		 * Removes all <code>TabContainerItem</code> entities from the <code>items</code> aggregation of the <code>TabContainer</code>.
		 *
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
		TabContainer.prototype.removeAllItems = function() {
			this._getTabStrip().removeAllItems();

			this.setSelectedItem(null);

			return this.removeAllAggregation("items");
		};

		/**
		 * Overrides the <code>addButton</code> property setter to proxy to the <code>TabStrip</code>.
		 *
		 * @param oButton {sap.ui.core.Control} The new control to be set as <code>TabStrip</code> <code>addButton</code> aggregation
		 * @returns {sap.m.TabContainer} This instance for chaining
		 * @override
		 */
		TabContainer.prototype.setAddButton = function (oButton) {
			return this._getTabStrip().setAddButton(oButton);
		};

		/**
		 * Overrides the addButton property getter to proxy to the <code>TabStrip</code>.
		 *
		 * @returns {sap.ui.core.Control} The control assigned as a <code>TabStrip</code> addButton aggregation
		 * @override
		 */
		TabContainer.prototype.getAddButton = function () {
			return this._getTabStrip().getAddButton();
		};

		/**
		 * Override <code>showAddNewButton</code> property setter to proxy to the <code>TabStrip</code>.
		 *
		 * @param bShowButton {boolean} Whether to show the <code>addNewButton</code>
		 */
		TabContainer.prototype.setShowAddNewButton = function (bShowButton) {
			var oTabStrip = this._getTabStrip();
			if (oTabStrip) {
				oTabStrip.setAddButton(bShowButton ? this._getAddNewTabButton() : null);
			}
		};

		return TabContainer;

	}, /* bExport= */ true);
