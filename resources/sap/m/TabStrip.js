/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/IconPool', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/base/ManagedObject', 'sap/ui/core/InvisibleText', './AccButton', './TabStripItem', './TabStripSelect'],
	function(jQuery, Control, IconPool, ItemNavigation, ManagedObject, InvisibleText, AccButton, TabStripItem, TabStripSelect) {
		"use strict";

		/**
		 * Constructor for a new <code>TabStrip</code>.
		 *
		 * @param {string} [sID] Id for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * This control displays a number of tabs. If the available horizontal
		 * space is exceeded, a horizontal scrolling appears.
		 *
		 * @extends sap.ui.core.Control
		 * @version 1.34.0
		 *
		 * @constructor
		 * @private
		 * @since 1.34
		 * @alias sap.m.TabStrip
		 */
		var TabStrip = Control.extend("sap.m.TabStrip", /** @lends sap.m.TabStrip.prototype */ {
			metadata : {
				library : "sap.m",
				properties : {
					/**
					 * The item selected
					 */
					selectedItem: {type : 'sap.m.TabStripItem', group : "Misc"},

					/**
					 * Defines whether button for showing all the tabs in a dropdown menu is present
					 */
					hasSelect : {type : "boolean", group : "Misc", defaultValue : false}
				},
				aggregations : {
					/**
					 * The tabs displayed in the TabStrip.
					 */
					items : {type : "sap.m.TabStripItem", multiple : true, singularName : "item"},
					/**
					 * The down arrow button displayed in the TabStrip.
					 */
					downArrowButton : {type : "sap.m.Button", multiple : false, singularName : "downArrowButton"},
					/**
					 * The add button displayed in the TabStrip.
					 */
					addButton : {type : "sap.m.Button", multiple : false, singularName : "addButton"},

					/**
					 * Holds the instance of the select when 'hasSelect' is set to true
					 */
					_select : {type: 'sap.m.TabStripSelect', multiple : false, visibility : "hidden"}

				},
				events : {
					/**
					 * Fired when item has been selected
					 */
					selectionChange: {
						parameters: {
							/**
							 * The id of the tab to be selected
							 */
							item: {type: "sap.m.TabStripItem"}
						}
					},
					/**
					 * Fired when an item wants to be closed
					 */
					itemCloseRequest: {
						allowPreventDefault: true,
						parameters: {
							/**
							 * Tab id of the tab to be closed
							 */
							item: {type: "sap.m.TabStripItem"}
						}
					},
					/**
					 * Fired when an item is pressed.
					 */
					itemPress: {
						parameters: {

							/**
							 * The pressed item.
							 */
							item: { type: "sap.m.TabStripItem" }
						}
					}
				}
			}
		});


		TabStrip.prototype._handleSelectedItem = function () {
			var aItems = this.getItems();
			// default select item is set if none is given
			if (!this.getSelectedItem() && aItems.length > 0) {
				this.setSelectedItem(aItems[0]);
			}
		};

		var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		/**
		 * Icon buttons used in TabStrip
		 *
		 * @enum
		 * @type {{LeftArrowButton: string, RightArrowButton: string, DownArrowButton: string, AddButton: string}}
		 * @private
		 */
		TabStrip._ICONBUTTONS = {
			LeftArrowButton     : "slim-arrow-left",
			RightArrowButton    : "slim-arrow-right",
			DownArrowButton     : "slim-arrow-down",
			AddButton           : "add",
			DeclineButton       : "decline"
		};


		TabStrip.SELECT_ITEMS_ID_PREFIX = 'SelectItem-';

		/**
		 * ScrollLeft constant
		 *
		 * @type {number}
		 * @private
		 */
		TabStrip._SCROLLSIZE = 320;

		/**
		 * Initializes the control.
		 *
		 * @public
		 */
		TabStrip.prototype.init = function () {
			this._bDoScroll             = !sap.ui.Device.system.phone;
			this._bRtl                  = sap.ui.getCore().getConfiguration().getRTL();
			this._iCurrentScrollLeft    = null;
			this._iMaxOffsetLeft        = null;
			this._scrollable            = null;
			this._oSelectedTab          = null;
			this._oLeftArrowButton      = null;
			this._oRightArrowButton     = null;
		};

		/**
		 * Called from parent if the control is destroyed.
		 *
		 * @public
		 */
		TabStrip.prototype.exit = function () {
			this._bDoScroll             = null;
			this._bRtl                  = null;
			this._iCurrentScrollLeft    = null;
			this._iMaxOffsetLeft        = null;
			this._scrollable            = null;
			if (this._oSelectedTab) {
				this._oSelectedTab.destroy();
				this._oSelectedTab = null;
			}
			if (this._oLeftArrowButton) {
				this._oLeftArrowButton.destroy();
				this._oLeftArrowButton = null;
			}
			if (this._oRightArrowButton) {
				this._oRightArrowButton.destroy();
				this._oRightArrowButton = null;
			}
			this._removeItemNavigation();
		};

		/**
		 * Function is called before the rendering of the control is started
		 */
		TabStrip.prototype.onBeforeRendering = function () {
			var aItems = this.getItems(),
				// ToDo: Rename 'tab' to 'item' everywhere
				// ToDo: remove all logic depending on index of aggregation instead of item instance
				iSelectedTab = this.indexOfAggregation(this.getSelectedItem()),
				oDownArrowButton = this.getDownArrowButton(),
				oAddButton = this.getAddButton();

			//Create overflow buttons
			this._oLeftArrowButton = this._generateButton(TabStrip._ICONBUTTONS.LeftArrowButton);
			this._oRightArrowButton = this._generateButton(TabStrip._ICONBUTTONS.RightArrowButton);
			//Override icons of down & add buttons if needed
			if (oDownArrowButton && oDownArrowButton.getIcon() != TabStrip._ICONBUTTONS.DownArrowButton) {
				oDownArrowButton.setIcon(IconPool.getIconURI(TabStrip._ICONBUTTONS.DownArrowButton));
			}
			if (oAddButton && oAddButton.getIcon() != TabStrip._ICONBUTTONS.AddButton) {
				oAddButton.setIcon(IconPool.getIconURI(TabStrip._ICONBUTTONS.AddButton));
			}

			//Store selected tab
			if (aItems.length) {
				if (iSelectedTab > -1 && iSelectedTab < aItems.length) {
					this._oSelectedTab = aItems[iSelectedTab];
				}
			}

			this._handleSelectedItem();
		};

		/**
		 * Function is called when the rendering of the control is completed
		 */
		TabStrip.prototype.onAfterRendering = function () {
			//use ItemNavigation for keyboardHandling
			var aItems = this.getItems(),
				aTabDomRefs = [],
				iSelectedDomIndex = -1,
				that = this;

			aItems.forEach(function(oTab) {
				var oItemDomRef = oTab.getDomRef();
				jQuery(oItemDomRef).attr("tabindex", "-1");
				aTabDomRefs.push(oItemDomRef);
				if (oTab === that._oSelectedTab) {
					iSelectedDomIndex = aTabDomRefs.indexOf(oTab);
				}
			});

			this._addItemNavigation(this.getDomRef("tabContainer"), aTabDomRefs, iSelectedDomIndex);

			this._iMaxOffsetLeft = Math.abs(this.$("tabContainer").width() - this.$("tabs").width());
			//Mark the tab as selected
			if (this._oSelectedTab) {
//				this._scrollIntoView(this._oSelectedTab, 0);
			}
		};

		/**
		 *
		 * @param oFocusTab
		 * @returns {*}
		 * @override
		 */
		TabStrip.prototype.getFocusDomRef = function (oFocusTab) {
			var oTab = oFocusTab || this._oSelectedTab;
			if (!oTab) {
				return null;
			}

			return oTab.getDomRef();
		};

		/**
		 *
		 * @param oFocusInfo
		 * @override
		 */
		TabStrip.prototype.applyFocusInfo = function (oFocusInfo) {
			if (oFocusInfo.focusDomRef) {
				jQuery(oFocusInfo.focusDomRef).focus();
			}
		};

		/**
		 * Adds item navigation functionality
		 *
		 * @param oHeadDomRef
		 * @param aTabDomRefs
		 * @param iSelectedDomIndex
		 * @private
		 */
		TabStrip.prototype._addItemNavigation = function (oHeadDomRef, aTabDomRefs, iSelectedDomIndex) {
			//Initialize the ItemNavigation
			if (!this._oItemNavigation) {
				this._oItemNavigation = new ItemNavigation();
			}
			//Setup the ItemNavigation
			this._oItemNavigation.setRootDomRef(oHeadDomRef);
			this._oItemNavigation.setItemDomRefs(aTabDomRefs);
			this._oItemNavigation.setSelectedIndex(iSelectedDomIndex);
			this._oItemNavigation.setCycling(false);
			this._oItemNavigation.setPageSize(5);

			//Attach ItemNavigation to the control delegate queue
			this.addDelegate(this._oItemNavigation);
		};

		/**
		 * Checks if scrolling is needed.
		 *
		 * @returns {boolean} Whether scrolling is needed
		 * @private
		 */
		TabStrip.prototype._checkScrolling = function() {
			var bScrolling = false,
				$This,
				oTabContainer,
				oTabs;

			if (this._bDoScroll) {
				$This = this.$();
				oTabContainer = this.getDomRef("tabContainer");
				oTabs = this.getDomRef("tabs");
				if (oTabContainer && oTabs) {
					if (oTabContainer.offsetWidth < oTabs.offsetWidth) {
						bScrolling = true;
					}
				}
			}

			if (this._scrollable !== bScrolling) {
				//Mark the control as scrollable or not
				$This.toggleClass("sapMTSScrollable", bScrolling);
				$This.toggleClass("sapMTSNotScrollable", !bScrolling);
				this._scrollable = bScrolling;
			}

			return bScrolling;
		};

		/**
		 * Generates an IconOnly transparent button
		 * @param oButtonType { TabStrip._ICONBUTTONS }
		 * @returns { sap.m.Button } The generated button
		 * @private
		 */
		TabStrip.prototype._generateButton = function (oButtonType) {
			var that = this,
				oButton;

			switch (oButtonType) {
				case TabStrip._ICONBUTTONS.LeftArrowButton:
					oButton = new AccButton({
						type: sap.m.ButtonType.Transparent,
						icon: IconPool.getIconURI(oButtonType),
						tooltip: oRb.getText("TABSTRIP_SCROLL_BACK"),
						tabIndex: "-1",
						ariaHidden: "true",
						press: function (oEvent) {
							that._scroll(-TabStrip._SCROLLSIZE, 500);
						}
					});
					break;
				case TabStrip._ICONBUTTONS.RightArrowButton:
					oButton = new AccButton({
						type: sap.m.ButtonType.Transparent,
						icon: IconPool.getIconURI(oButtonType),
						tooltip: oRb.getText("TABSTRIP_SCROLL_FORWARD"),
						tabIndex: "-1",
						ariaHidden: "true",
						press: function (oEvent) {
							that._scroll(TabStrip._SCROLLSIZE, 500);
						}
					});
					break;
				case TabStrip._ICONBUTTONS.DownArrowButton:
					oButton = new AccButton({
						type: sap.m.ButtonType.Transparent,
						icon: IconPool.getIconURI(oButtonType)
					});
					break;
				case TabStrip._ICONBUTTONS.AddButton:
					oButton = new sap.m.Button({
						type: sap.m.ButtonType.Transparent,
						icon: IconPool.getIconURI(oButtonType)
					});
					break;
				case TabStrip._ICONBUTTONS.DeclineButton:
					oButton = new sap.m.Button({
						type: sap.m.ButtonType.Transparent,
						icon: oButtonType
					});
					break;
				default:
					break;
			}
			return oButton;
		};

		/**
		 * Before scroll callback
		 * @private
		 */
		TabStrip.prototype._fnBeforeScrollCallback = function() {
			this.$().toggleClass("sapMTSScrolling", true);
		};

		/**
		 * After scroll callback
		 * @private
		 */
		TabStrip.prototype._fnAfterScrollCallback = function() {
			this.$().toggleClass("sapMTSScrolling", false);
		};

		/**
		 * Removes the item navigation delegate
		 */
		TabStrip.prototype._removeItemNavigation = function () {
			if (this._oItemNavigation) {
				this.removeDelegate(this._oItemNavigation);
				this._oItemNavigation.destroy();
				delete this._oItemNavigation;
			}
		};

		/**
		 * Performs horizontal scroll
		 * @param iDelta {int} The target scrollLeft value
		 * @param iDuration {int} Scroll animation duration
		 * @private
		 */
		TabStrip.prototype._scroll = function(iDelta, iDuration) {
			var oDomRef = this.getDomRef("tabContainer"),
				iScrollLeft = oDomRef.scrollLeft,
				iScrollTarget = iScrollLeft + iDelta;

			this._fnBeforeScrollCallback();

			//Perform needed checks for ScrollLeft value
			if (iScrollTarget < 0) {
				iScrollTarget = 0;
			}
			if (iScrollTarget > this._iMaxOffsetLeft) {
				iScrollTarget = this._iMaxOffsetLeft;
			}
			jQuery(oDomRef).animate({scrollLeft: iScrollTarget}, iDuration);
			this._iCurrentScrollLeft = iScrollTarget;

			this._fnAfterScrollCallback();
		};

		/**
		 * Scrolls to a particular tab
		 *
		 * @param oTab {sap.ui.core.Control}
		 * @param iDuration {int} Duration of the scrolling animation
		 * @private
		 */
		TabStrip.prototype._scrollIntoView = function (oTab, iDuration) {
			this._scroll(oTab.scrollLeft, iDuration);
		};


		/**
		 * Create the instance of the tab select list.
		 * @param {array} aTabStripItems Array with the tab items
		 * @returns {object }{sap.m.TabStripSelect}
		 * @private
		 */
		TabStrip.prototype._createSelect = function (aTabStripItems) {
			var oSelect,
				oSelectedSelectItem,
				oSelectedTabStripItem,
				oConstructorSettings = {
					type: sap.m.SelectType.IconOnly,
					autoAdjustWidth : true,
					icon: sap.ui.core.IconPool.getIconURI("slim-arrow-down"),
					change: function (oEvent) {
						oSelectedSelectItem = oEvent.getParameters()['selectedItem'];
						oSelectedTabStripItem = oAggregationsHelper.findTabStripItemFromSelectItem.call(this,oSelectedSelectItem);
						this._activateItem(oSelectedTabStripItem);
					}.bind(this)
				};

			oSelect = new TabStripSelect(oConstructorSettings);

			oAggregationsHelper.addItemsToSelect.call(this, oSelect, aTabStripItems);

			return oSelect;
		};

		/**
		 * Handles the <code>tap</code> event on the tab strip.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		TabStrip.prototype.ontap = function(oEvent) {
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
			this._activateItem(oEvent.srcControl);
		};


		/**
		 * Handles when the space or enter key is pressed.
		 *
		 * @param {jQuery.Event} oEvent The event object.
		 */
		TabStrip.prototype.onsapselect = function(oEvent) {
			// mark the event for components that needs to know if the event was handled
			oEvent.setMarked();
			// note: prevent document scrolling when space keys is pressed
			oEvent.preventDefault();
			this._activateItem(oEvent.srcControl);
		};

		/**
		 * Handles the delete keyboard event.
		 * @param oEvent
		 */
		TabStrip.prototype.onsapdelete = function(oEvent) {
			var oItem = jQuery("#" + oEvent.target.id).control(0),
				iItemsCount,
				iCurrentFocusedIndex,
				iNextIndex,
				fnCallback;

			if (oItem instanceof sap.m.TabStripItem) {
				iItemsCount = this.getItems().length;
				iCurrentFocusedIndex = this._oItemNavigation.getFocusedIndex();
				iNextIndex = (iItemsCount - 1) === iCurrentFocusedIndex ? --iCurrentFocusedIndex : ++iCurrentFocusedIndex;

				fnCallback = function() {
					this._oItemNavigation.focusItem(iNextIndex);
				}.bind(this);

				this._removeItem(oItem, fnCallback);
			}
		};

		/**
		 * Activates an item on the tab strip.
		 *
		 * @param {sap.m.TabStripItem} oItem The item to be activated.
		 * @private
		 */
		TabStrip.prototype._activateItem = function(oItem) {
			if (oItem && oItem instanceof sap.m.TabStripItem) {
				this.fireItemPress({
					item: oItem
				});
				if (!this.getSelectedItem() || this.getSelectedItem().getId() !== oItem.getId()) {
					this.setSelectedItem(oItem);
					this.fireSelectionChange({
						item: oItem
					});
				}
			}
		};


		TabStrip.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				oAggregationsHelper.handleItemsAggregation.call(this, ['addAggregation', oObject, bSuppressInvalidate], true);
			}
			return Control.prototype.addAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		TabStrip.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				oAggregationsHelper.handleItemsAggregation.call(this, ['insertAggregation', oObject, iIndex, bSuppressInvalidate], true);
			}
			return Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, bSuppressInvalidate);
		};

		TabStrip.prototype.removeAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				oAggregationsHelper.handleItemsAggregation.call(this, ['removeAggregation', oObject, bSuppressInvalidate]);
			}
			return Control.prototype.removeAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
		};

		TabStrip.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				oAggregationsHelper.handleItemsAggregation.call(this, ['removeAllAggregation', null, bSuppressInvalidate]);
			}
			return Control.prototype.removeAllAggregation.call(this, sAggregationName, bSuppressInvalidate);
		};

		TabStrip.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
			if (sAggregationName === 'items') {
				oAggregationsHelper.handleItemsAggregation.call(this, ['destroyAggregation', bSuppressInvalidate]);
			}
			return Control.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
		};

		/**
		 * Sets an item as current.
		 * @param {sap.m.TabStripItem} oSelectedItem the item that should be set as current.
		 * @returns {sap.m.TabStrip} <code>this</code> pointer for chaining.
		 */
		TabStrip.prototype.setSelectedItem = function(oSelectedItem) {
			if (!oSelectedItem) {
				return;
			}
			updateAriaSelectedAttributes(this.getItems(), oSelectedItem);
			updateSelectedItemClasses.call(this, oSelectedItem.getId());
			return TabStrip.prototype.setProperty.call(this, "selectedItem", oSelectedItem, true); //render manually;
		};

		/**
		 * Overrite the default method to make sure a TabStripSelect instance is created when needed.
		 * @param sPropertyName
		 * @param vValue
		 * @param bSuppressInvalidate
		 */
		TabStrip.prototype.setProperty = function(sPropertyName, vValue, bSuppressInvalidate) {
			Control.prototype.setProperty.call(this, sPropertyName, vValue, bSuppressInvalidate);

			// handle the _select aggregation instance
			if (sPropertyName === 'hasSelect') {
				if (vValue && !this.getAggregation('_select')) {
					return this.setAggregation('_select', this._createSelect(this.getItems()));
				} else {
					return this.destroyAggregation('_select');
				}
			}

			// propagate the selection change to the select aggregation
			if (sPropertyName === 'selectedItem') {
				if (this.getHasSelect()) {
					var oSelectItem = oAggregationsHelper.findSelectItemFromTabStripItem.call(this, vValue);
					this.getAggregation('_select').setSelectedItem(oSelectItem).rerender();
				}
			}
		};

		var oEventsHelper = {
			/**
			 * Attach any previously added event handlers.
			 * @param {object} oObject The TabStripItem instance on which events will be detached/attached
			 * @private
			 */
			attachItemEventListeners: function (oObject) {
				// make sure we always have one listener at a time only
				oObject.detachItemClosePressed(oEventsHelper.handleItemClosePressed.bind(this));
				oObject.detachItemPropertyChanged(oEventsHelper.handleTabStripItemPropertyChanged.bind(this));

				oObject.attachItemPropertyChanged(oEventsHelper.handleTabStripItemPropertyChanged.bind(this));
				oObject.attachItemClosePressed(oEventsHelper.handleItemClosePressed.bind(this));
			},
			/**
			 * Detach any previously added event handlers.
			 * @param {object} oObject The TabStripItem instance on which events will be detached/attached
			 * @private
			 */
			detachItemEventListeners: function (oObject) {
				// !oObject check is needed because "null" is an object
				if (!oObject || typeof oObject !== 'object' || !oObject.getMetadata || oObject.getMetadata().getName() !== 'sap.m.TabStripItem') {
					// in case of no concrete item object, remove the listeners from all items
					// ToDo: confirm that the listeners removal is needed ..?
					var aItems = this.getItems();
					aItems.forEach(function (oItem) {
						if (typeof oItem !== 'object' || !oItem.getMetadata || oItem.getMetadata().getName() !== 'sap.m.TabStripItem') {
							// because of recursion, make sure it never goes into endless loop
							return;
						}
						return oEventsHelper.detachItemEventListeners.call(this, oItem);
					}.bind(this));
				}
			},
			/**
			 * Propagate the property change from a tabstrip item isntance to the tabstrip select item copy instance
			 * @param oEvent
			 * @private
			 */
			handleTabStripItemPropertyChanged: function (oEvent) {
				var oSelectItem = oAggregationsHelper.findSelectItemFromTabStripItem.call(this, oEvent.getSource());
				oSelectItem.setProperty(oEvent['mParameters'].propertyKey, oEvent['mParameters'].propertyValue);
			},
			/**
			 * Fire an item close request event based on an item close button press
			 * @param oEvent
			 * @private
			 */
			handleItemClosePressed: function (oEvent) {
				this._removeItem(oEvent.getSource());
			}
		};


		/**
		 * Request close of the given item and removes it from the items aggregation if permitted.
		 * @param {sap.m.TabStripItem} oItem the item which will disappear
		 * @param {function} fnCallback A callback function to be called after the item is removed
		 * @private
		 */
		TabStrip.prototype._removeItem = function(oItem, fnCallback) {
			/* this method is handling the close pressed event on all item instances (TabStrip and the
			 * TabStripSelect copy), so when it's handling the press on the TabStripSelect item, it needs to determine the TabStrip item out of the event and vice-versa */
			if (oItem.getMetadata().getName() !== 'sap.m.TabStripItem') {
				jQuery.sap.log.error('Expecting instance of a TabStripSelectItem, given: ', oItem);
			}
			if (oItem.getId().indexOf(TabStrip.SELECT_ITEMS_ID_PREFIX) !== -1) {
				var oTabStripItem = oAggregationsHelper.findTabStripItemFromSelectItem.call(this, oItem);
			} else {
				oTabStripItem = oItem;
			}

			if (this.fireItemCloseRequest({item: oTabStripItem})) {
				this.removeAggregation('items', oTabStripItem); // the select item will also get removed

				if (fnCallback) {
					fnCallback.call(this);
				}
			}
		};


		var oAggregationsHelper = {

			handleItemsAggregation: function (aArgs, bIsAdding) {
				var sAggregationName    = 'items', // name of the aggregation in TabStripSelect
					sFunctionName       = aArgs[0],
					oObject             = aArgs[1],
					aNewArgs            = [sAggregationName];

				/* remove the function name from the args array */
				aArgs.forEach(function (iItem, iIndex) {
					if (iIndex > 0) {
						aNewArgs.push(iItem);
					}
				});

				if (bIsAdding) {
					// attach and detach (or only detach if not adding) event listeners for the item
					oEventsHelper.attachItemEventListeners.call(this, oObject);
				} else {
					oEventsHelper.detachItemEventListeners.call(this, oObject);
				}

				// no need to handle anything else for other aggregations than 'items'
				if (sAggregationName !== "items") {
					return this;
				}

				if (this.getHasSelect()) {
					oAggregationsHelper.handleSelectItemsAggregation.call(this, aNewArgs,  bIsAdding, sFunctionName, oObject);
				}
				return this;
			},

			handleSelectItemsAggregation: function (aArgs, bIsAdding, sFunctionName, oObject) {
				var oSelect             = this.getAggregation('_select'),
					oDerivedObject;     // a new instance, holding a copy of the TabStripItem which is given to the TabStripSelect instance

				if (sFunctionName === 'destroyAggregation' && !oSelect) {
					/* ToDo : For some reason aggregation _select may be already deleted (e.g. TabStrip.destroy will destroy all children including _select */
					return;
				}
				// ToDo: test this functionality
				// destroyAggregation and removeAllAggregation no not need oObject, action can be directly taken
				if (oObject === null || typeof oObject !== 'object') {
					return oSelect[sFunctionName]['apply'](oSelect, aArgs);
				}


				if (bIsAdding) {
					oDerivedObject = oAggregationsHelper.createSelectItemFromTabStripItem.call(this, oObject);
				} else {
					oDerivedObject = oAggregationsHelper.findSelectItemFromTabStripItem.call(this, oObject);
				}

				// substitute the TabStrip item instance with the TabStripSelectItem instance
				aArgs.forEach(function (iItem, iIndex) {
					if (typeof iItem === 'object') {
						aArgs[iIndex] = oDerivedObject;
					}
				});

				return oSelect[sFunctionName]['apply'](oSelect, aArgs);
			},



			addItemsToSelect: function (oSelect, aItems) {
				aItems.forEach(function (oItem) {
					var oSelectItem = oAggregationsHelper.createSelectItemFromTabStripItem.call(this, oItem);
					oSelect.addAggregation('items', oSelectItem);

					// make sure to set the correct select item
					if (oItem.getId() === this.getSelectedItem().getId()) {
						oSelect.setSelectedItem(oSelectItem);
					}
				}, this);
			},

			createSelectItemFromTabStripItem: function (oTabStripItem) {
				if (!oTabStripItem) {
					return; // ToDo: sap log error ?
				}
				var sType = oTabStripItem.getMetadata().getName();

				// ToDo: change this to 'sap.m.TabContainerItem' when the new type gets created
				if (sType !== 'sap.m.TabStripItem' /*'sap.m.TabContainerItem'*/) {
					jQuery.sap.log.error('Expecting instance of "sap.m.TabContainerItem": ' + sType + ' given.');
					return;
				}

				var oSelectItem = new sap.m.TabStripItem({
					// ToDo: must be suffix
					id             : TabStrip.SELECT_ITEMS_ID_PREFIX + oTabStripItem.getId(),
					text           : oTabStripItem.getText(),
					modified       : oTabStripItem.getModified(),
					itemClosePressed: function (oEvent) {
						oEventsHelper.handleItemClosePressed.call(this, oEvent);
					}.bind(this)
				});

				return oSelectItem;
			},

			findTabStripItemFromSelectItem: function (oTabStripSelectItem) {
				var i,
					sTabStripItemId = oTabStripSelectItem.getId().replace(TabStrip.SELECT_ITEMS_ID_PREFIX , ''),
					aTabStripItems = this.getItems();
				for (i = 0; i < aTabStripItems.length; i++) {
					if (aTabStripItems[i].getId() === sTabStripItemId) {
						return aTabStripItems[i];
					}
				}
			},

			findSelectItemFromTabStripItem: function (oTabStripItem) {
				var i,
					aSelectItems,
					sSelectItemId = TabStrip.SELECT_ITEMS_ID_PREFIX + oTabStripItem.getId();

				if (this.getHasSelect()) {
					aSelectItems = this.getAggregation('_select').getItems();

					for (i = 0; i < aSelectItems.length; i++) {
						if (aSelectItems[i].getId() === sSelectItemId) {
							return aSelectItems[i];
						}
					}
				}
			}
		};

		// ToDo: move these declarations on top
		TabStrip._ariaStaticTexts = {
			/**
			 * Holds the static text for "Closable" item that should be read by screen reader
			 */
			closable: new InvisibleText({text: oRb.getText("TABSTRIP_ITEM_CLOSABLE")}).toStatic(),
			/**
			 * Holds the static text for "Unsaved" item that should be read by screen reader
			 */
			modified: new InvisibleText({text: oRb.getText("TABSTRIP_ITEM_MODIFIED")}).toStatic(),
			/**
			 * Holds the static text for "Saved" item that should be read by screen reader
			 */
			notModified:  new InvisibleText({text: oRb.getText("TABSTRIP_ITEM_NOT_MODIFIED")}).toStatic()
		};

		/**
		 * Handle aria-selected attributes depending on currently selected item.
		 * @param {Array.<sap.m.TabStripItem>} aItems the whole set of items
		 * @param {sap.m.TabStripItem} oSelectedItem currently selected item
		 * @private
		 */
		function updateAriaSelectedAttributes(aItems, oSelectedItem) {
			var sAriaSelected = "false";
			aItems.forEach(function (oItem) {
				if (oItem.$()) {
					sAriaSelected = "false";
					if (oSelectedItem && oSelectedItem.getId() === oItem.getId()) {
						sAriaSelected = "true";
					}
					oItem.$().attr("aria-selected", sAriaSelected);
				}
			});
		}
		function updateSelectedItemClasses(sSelectedItemId) {
			if (this.$("tabs")) {
				this.$("tabs").children(".selected").removeClass("selected");
				jQuery("#" + sSelectedItemId).addClass("selected");
			}
		}

		/**
		 * ToDo: This method doesn't work because the rendering works with ::after pseudo element - better to alter the
		 * renderer, so this logic would work the same way for the select item and tabstrip item. */

		/**
		 * Change the visibility of the item "state" symbol
		 * @param {mixed} vItemId
		 * @param {boolean} bShowState
		 */
		TabStrip.prototype.changeItemState = function(vItemId, bShowState) {
			// ToDo: remove this hack !? - for some reason otherwise these are 'undefined' - can it be the lazy loading?
			TabStripItem.CSS_CLASS_STATE            = "sapMTabSelectListItemModified";
			TabStripItem.CSS_CLASS_STATEINVISIBLE   = "sapMTabSelectListItemModifiedInvisible";
			TabStripItem._CSS_CLASS_LABEL           = "sapMTabContainerItemLabel";
			// ToDo: fix mess and remove hilarious constant
			TabStripItem.YET_ANOTHER_CSS_CLASS_FOR_THE_SAME_THING_THAT_LOST_ME_20_MINUTES_IN_CONFUSION = "sapMTabContainerItemModified";


			var $oItemState;

			// optimisation to not invalidate and rerender the whole parent DOM, but only manipulate the CSS class
			// for invisibility on the concrete DOM element that needs to change
			var aItems = this.getItems();
			aItems.forEach(function (oItem) {
				if (vItemId === oItem.getId()) {
					$oItemState = jQuery(oItem.$());
					if (bShowState === true && !$oItemState.hasClass(TabStripItem.YET_ANOTHER_CSS_CLASS_FOR_THE_SAME_THING_THAT_LOST_ME_20_MINUTES_IN_CONFUSION)) {
						$oItemState.addClass(TabStripItem.YET_ANOTHER_CSS_CLASS_FOR_THE_SAME_THING_THAT_LOST_ME_20_MINUTES_IN_CONFUSION);
					} else {
						$oItemState.removeClass(TabStripItem.YET_ANOTHER_CSS_CLASS_FOR_THE_SAME_THING_THAT_LOST_ME_20_MINUTES_IN_CONFUSION);
					}
				}
			});
		};

		return TabStrip;

	}, /* bExport= */ false);
