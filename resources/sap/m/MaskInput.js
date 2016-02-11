/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.MaskInput.
sap.ui.define(['jquery.sap.global', './InputBase', './MaskInputRule', 'sap/ui/core/Control'], function (jQuery, InputBase, MaskInputRule, Control) {
	"use strict";


	/**
	 * Constructor for a new MaskInput.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.MaskInput</code> control allows users to easily enter data in a certain format and in a fixed-width input
	 * (for example: date, time, phone number, credit card number, currency, IP address, MAC address, and others).
	 *
	 * @author SAP SE
	 * @extends sap.m.InputBase
	 * @version 1.34.6
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.MaskInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MaskInput = InputBase.extend("sap.m.MaskInput", /** @lends sap.m.MaskInput.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Defines a placeholder symbol. Shown at the position where there is no user input yet.
				 */
				placeholderSymbol: {type: "string", group: "Misc", defaultValue: "_"},

				/**
				 * Mask defined by its characters type (respectively, by its length).
				 * You should consider the following important facts:
				 * 1. The mask characters normally correspond to an existing rule (one rule per unique char).
				 * Characters which don't, are considered immutable characters (for example, the mask '2099', where '9' corresponds to a rule
				 * for digits, has the characters '2' and '0' as immutable).
				 * 2. Adding a rule corresponding to the <code>placeholderSymbol</code> is not recommended and would lead to an unpredictable behavior.
				 */
				mask: {type: "string", group: "Misc", defaultValue: null}
			},
			aggregations: {

				/**
				 A list of validation rules (one rule per mask character).
				 */
				rules: {type: "sap.m.MaskInputRule", multiple: true, singularName: "rule"}
			}
		}
	});


	/**
	 * Initializes the control.
	 */
	MaskInput.prototype.init = function () {
		// Stores the caret timeout id for further manipulation (e.g Canceling the timeout)
		this._iCaretTimeoutId = null;
		// Stores the first placeholder replaceable position where the user can enter a value (immutable characters are ignored)
		this._iUserInputStartPosition = null;
		//Stores the length of the mask
		this._iMaskLength = null;
		// The last input(dom) value of the MaskInput (includes input characters , placeholders and immutable characters)
		this._sOldInputValue = null;
		//Rules with regular expression tests corresponding to each character
		this._oRules = null;
		// char array for keeping the input value with the applied mask
		this._oTempValue = null;

		setDefaultRules.call(this);
		setupMaskVariables.call(this);
	};

	/**
	 * Called when the control is destroyed.
	 */
	MaskInput.prototype.exit = function () {
		this._iCaretTimeoutId = null;
		this._iUserInputStartPosition = null;
		this._iMaskLength = null;
		this._sOldInputValue = null;
		this._oRules = null;
		this._oTempValue = null;
	};

	/**
	 * Handles the internal event <code>onBeforeRendering</code>.
	 */
	MaskInput.prototype.onBeforeRendering = function () {
		/*Check if all properties and rules are valid (although current setters validates the input,
		 because not everything is verified - i.e. modifying an existing rule is not verified in the context of all rules*/
		var sValidationErrorMsg = validateDependencies.call(this);

		if (sValidationErrorMsg) {
			jQuery.sap.log.warning("Invalid mask input: " + sValidationErrorMsg);
		}
		InputBase.prototype.onBeforeRendering.apply(this, arguments);
	};

	/**
	 * Handles the internal event <code>onAfterRendering</code>.
	 */
	MaskInput.prototype.onAfterRendering = function () {
		InputBase.prototype.onAfterRendering.apply(this, arguments);
	};

	/**
	 * Handles <code>focusin</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onfocusin = function (oEvent) {
		this._sOldInputValue = this._getInputValue();
		InputBase.prototype.onfocusin.apply(this, arguments);

		// if input does not differ from original (i.e. empty mask) OR differs from original but has invalid characters
		if (!this._oTempValue.differsFromOriginal() || !isValidInput.call(this, this._sOldInputValue)) {
			applyMask.call(this);
		}

		positionCaret.call(this, true);
	};

	/**
	 * Handles <code>focusout</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onfocusout = function (oEvent) {
		//The focusout should not be passed down to the InputBase as it will always generate onChange event.
		//For the sake of MaskInput, change event is decided inside inputCompletedHandler, the reset of the InputBase.onfocusout
		//follows
		this.bFocusoutDueRendering = this.bRenderingPhase;
		this.$().toggleClass("sapMFocus", false);
		// remove touch handler from document for mobile devices
		jQuery(document).off('.sapMIBtouchstart');

		// Since the DOM is replaced during the rendering, an <code>onfocusout</code> event is fired and possibly the
		// focus is set on the document, hence you can ignore this event during the rendering.
		if (this.bRenderingPhase) {
			return;
		}

		//close value state message popup when focus is outside the input
		this.closeValueStateMessage();
		inputCompletedHandler.call(this);
	};

	/**
	 * Handles <code>onInput</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.oninput = function (oEvent) {
		InputBase.prototype.oninput.apply(this, arguments);
		applyMask.call(this);
		positionCaret.call(this, false);
	};

	/**
	 * Handles <code>keyPress</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onkeypress = function (oEvent) {
		keyPressHandler.call(this, oEvent);
	};

	/**
	 * Handles <code>keyDown</code> event.
	 * @param {object} oEvent The jQuery event
	 */
	MaskInput.prototype.onkeydown = function (oEvent) {
		var oKey = parseKeyBoardEvent(oEvent),
			mBrowser = sap.ui.Device.browser;

		/* When user types character, the flow of triggered events is keydown -> keypress -> input. The MaskInput
		 handles user input in keydown (for special keys like Delete and Backspace) or in keypress - for any other user
		 input and suppresses the input events. This is not true for IE9, where the input event is fired, because of
		 the underlying InputBase takes control and fires it (see {@link sap.m.InputBase#onkeydown})
		 */
		var bIE9AndBackspaceDeleteScenario = (oKey.bBackspace || oKey.bDelete) && mBrowser.msie && mBrowser.version < 10;

		if (!bIE9AndBackspaceDeleteScenario) {
			InputBase.prototype.onkeydown.apply(this, arguments);
		}
		keyDownHandler.call(this, oEvent, oKey);
	};

	/**
	 * Handles enter key. Shell subclasses override this method, bare in mind that [Enter] is not really handled here, but in {@link sap.m.MaskInput.prototype#onkeydown}.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	MaskInput.prototype.onsapenter = function(oEvent) {
		//Nothing to do, [Enter] is already handled in onkeydown part.
	};

	/**
	 * Handles the <code>sapfocusleave</code> event of the mask input.
	 * Shell subclasses override this method, bare in mind that <code>sapfocusleave</code> is handled by {@link sap.m.MaskInput.prototype#onfocusout}.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	MaskInput.prototype.onsapfocusleave = function(oEvent) {
	};

	MaskInput.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === "rules") {
			if (!validateRegexAgainstPlaceHolderSymbol.call(this, oObject)) {
				return this;
			}
			// ensure there is no more than a single rule with the same mask format symbol
			removeRuleWithSymbol.call(this, oObject.getMaskFormatSymbol());
			Control.prototype.addAggregation.apply(this, arguments);
			setupMaskVariables.call(this);
			return this;
		} else {
			return Control.prototype.addAggregation.apply(this, arguments);
		}
	};

	MaskInput.prototype.insertAggregation = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (sAggregationName === "rules") {
			if (!validateRegexAgainstPlaceHolderSymbol.call(this, oObject)) {
				return this;
			}
			// ensure there is no more than a single rule with the same mask format symbol
			removeRuleWithSymbol.call(this, oObject.getMaskFormatSymbol());
			Control.prototype.insertAggregation.apply(this, arguments);
			setupMaskVariables.call(this);
			return this;
		} else {
			return Control.prototype.insertAggregation.apply(this, arguments);
		}
	};

	/**
	 * Validates that the rule does not include the currently set placeholder symbol as allowed mask character.
	 * @param {object} oRule List of regular expressions per mask symbol
	 * @returns {boolean} True if the rule is valid, false otherwise
	 * @private
	 */
	function validateRegexAgainstPlaceHolderSymbol(oRule) {
		if (new RegExp(oRule.getRegex()).test(this.getPlaceholderSymbol())) {
			jQuery.sap.log.error("Rejecting input mask rule because it includes the currently set placeholder symbol.");
			return false;
		}
		return true;
	}

	/**
	 * Overrides the method in order to validate the placeholder symbol.
	 * @param {String} sSymbol The placeholder symbol
	 * @override
	 * @returns {sap.ui.base.MaskInput} <code>this</code> pointer for chaining
	 */
	MaskInput.prototype.setPlaceholderSymbol = function (sSymbol) {
		var bSymbolFound = false;
		// make sure the placeholder symbol is always a single regex supported character
		if (!/^.$/i.test(sSymbol)) {
			jQuery.sap.log.error("Invalid placeholder symbol string given");
			return this;
		}

		// make sure the placeholder symbol given is not part of any of the existing rules
		// as regex
		bSymbolFound = this.getRules().some(function(oRule){
			return new RegExp(oRule.getRegex()).test(sSymbol);
		});

		if (bSymbolFound) {
			jQuery.sap.log.error("Rejecting placeholder symbol because it is included as a regex in an existing mask input rule.");
		} else {
			this.setProperty("placeholderSymbol", sSymbol);
			setupMaskVariables.call(this);
		}
		return this;
	};

	/**
	 * Sets the mask for this instance.
	 * The mask is mandatory.
	 * @param {String} sMask The mask
	 * @returns {sap.m.MaskInput} <code>this</code> pointer for chaining
	 * @throws {Error} Throws an error if the input is invalid
	 */
	MaskInput.prototype.setMask = function (sMask) {
		if (!sMask) {
			var sErrorMsg = "Setting an empty mask is pointless. Make sure you set it with a non-empty value.";
			jQuery.sap.log.warning(sErrorMsg);
			return this;
		}
		this.setProperty("mask", sMask, true);
		setupMaskVariables.call(this);
		return this;
	};

	/**
	 * Verifies whether a character at a given position is allowed according to its mask rule.
	 * @param {String} sChar The character
	 * @param {integer} iIndex The position of the character
	 * @protected
	 */
	MaskInput.prototype._isCharAllowed = function (sChar, iIndex) {
		return this._oRules.applyCharAt(sChar, iIndex);
	};

	/**
	 * Gets a replacement string for the character being placed in the input.
	 * Subclasses may override this method in order to get some additional behavior. For instance, switching current input
	 * character with other for time input purposes. As an example, if the user enters "2" (in 12-hour format), the consumer may use
	 * this method to replace the input from "2" to "02".
	 * @param {String} sChar The current character from the input
	 * @param {integer} iPlacePosition The position the character should occupy
	 * @param {string} sCurrentInputValue The value currently inside the input field (may differ from the property value)
	 * @returns {String} A string that replaces the character
	 * @protected
	 */
	MaskInput.prototype._feedReplaceChar = function (sChar, iPlacePosition, sCurrentInputValue) {
		return sChar;
	};

	/********************************************************************************************
	 ****************************** Private methods and classes *********************************
	 ********************************************************************************************/

	/**
	 * Encapsulates the work with a char array.
	 * @param {Array} aContent The char array
	 * @constructor
	 * @private
	 */
	var CharArray = function (aContent) {
		// Initial content
		this._aInitial = aContent.slice(0);
		//The real content
		this._aContent = aContent;
	};

	CharArray.prototype.setCharAt = function (sChar, iPosition) {
		this._aContent[iPosition] = sChar;
	};

	CharArray.prototype.charAt = function (iPosition) {
		return this._aContent[iPosition];
	};

	/**
	 * Converts the char array to a string representation.
	 * @returns {String} The char array converted to a string
	 * @private
	 */
	CharArray.prototype.toString = function () {
		return this._aContent.join('');
	};

	/**
	 * Checks whether the char array content differs from its original content.
	 * @returns {boolean} True if different content, false otherwise
	 * @private
	 */
	CharArray.prototype.differsFromOriginal = function () {
		return this.differsFrom(this._aInitial);
	};

	/**
	 * Checks whether the char array content differs from given string.
	 * @param {string | array} vValue The value to compare the char array with
	 * @returns {boolean} True if different content, false otherwise.
	 * @private
	 */
	CharArray.prototype.differsFrom = function (vValue) {
		var i = 0;
		if (vValue.length !== this._aContent.length) {
			return true;
		}
		for (i = 0; i < vValue.length; i++) {
			if (vValue[i] !== this._aContent[i]) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Gets the size of the char array.
	 * @returns {int} Number of items in the char array
	 * @private
	 */
	CharArray.prototype.getSize = function () {
		return this._aContent.length;
	};

	/**
	 * Encapsulates the work with test rules.
	 * @param aRules The test rules
	 * @constructor
	 * @private
	 */
	var TestRules = function (aRules) {
		this._aRules = aRules;
	};

	/**
	 * Finds the next testable position in the <code>MaskInput</code>.
	 * @param {int} iCurrentPos The position next to which seeking starts (if skipped, "-1" will be assumed)
	 * @returns {int} The found position.
	 * @private
	 */
	TestRules.prototype.nextTo = function (iCurrentPos) {
		var iPosition = iCurrentPos;
		if (typeof iPosition === "undefined") {
			iPosition = -1; //this will make sure the 0 rule is also included in the search
		}
		do {
			iPosition++;
		} while (iPosition < this._aRules.length && !this._aRules[iPosition]);
		return iPosition;
	};

	/**
	 * Finds the previous testable position in the <code>MaskInput</code>.
	 * @param {int} iCurrentPos The position before which seeking starts
	 * @returns {int} The found position
	 * @private
	 */
	TestRules.prototype.previousTo = function (iCurrentPos) {
		var iPosition = iCurrentPos;
		do {
			iPosition--;
		} while (!this._aRules[iPosition] && iPosition > 0);
		return iPosition;
	};

	/**
	 * Checks whether there is a rule at the specified index.
	 * @param {int} iIndex The index of the rule
	 * @returns {boolean} True, if there is a rule at the specified index, false otherwise
	 * @private
	 */
	TestRules.prototype.hasRuleAt = function (iIndex) {
		return !!this._aRules[iIndex];
	};

	/**
	 * Applies a rule to a character.
	 * @param {String} sChar The character to which the rule will be applied
	 * @param {integer} iIndex The index of the rule
	 * @returns {boolean} True if the character passes the validation rule, false otherwise.
	 * @private
	 */
	TestRules.prototype.applyCharAt = function (sChar, iIndex) {
		return this._aRules[iIndex].test(sChar);
	};

	/**
	 * Sets up default mask rules.
	 * @private
	 */
	function setDefaultRules() {
		this.addRule(new sap.m.MaskInputRule({
			maskFormatSymbol: "a",
			regex: "[A-Za-z]"
		}));
		this.addRule(new sap.m.MaskInputRule({
			maskFormatSymbol: "9",
			regex: "[0-9]"
		}));
	}

	/**
	 * Checks if the dependent properties and aggregations are valid.
	 * @returns {string | null} The errors if any, or false value if no errors
	 * @private
	 */
	function validateDependencies() {
		var sPlaceholderSymbol = this.getPlaceholderSymbol(),
			aRules = this.getRules(),
			aMaskFormatSymbols = [],
			aErrMessages = [];

		if (!this.getMask()) {
			aErrMessages.push("Empty mask");
		}
		// Check if rules are valid (not duplicated and different from the placeholderSymbol)
		if (aRules.length) {
			aMaskFormatSymbols = [];
			aRules.every(function (oRule) {
				var sMaskFormatSymbol = oRule.getMaskFormatSymbol(),
					bCurrentDiffersFromPlaceholder = sMaskFormatSymbol !== sPlaceholderSymbol,
					bCurrentDiffersFromOthers;

				bCurrentDiffersFromOthers = !aMaskFormatSymbols.some(function (sSymbol) {
					return sMaskFormatSymbol === sSymbol;
				});
				aMaskFormatSymbols.push(sMaskFormatSymbol);

				if (!bCurrentDiffersFromPlaceholder) {
					aErrMessages.push("Placeholder symbol is the  same as the existing rule's mask format symbol");
				}
				if (!bCurrentDiffersFromOthers) {
					aErrMessages.push("Duplicated rule's maskFormatSymbol [" + sMaskFormatSymbol + "]");
				}

				return bCurrentDiffersFromPlaceholder && bCurrentDiffersFromOthers;
			});
		}

		return aErrMessages.length ? aErrMessages.join(". ") : null;
	}

	/**
	 * Removes any existing rules with a specific mask symbol.
	 * @param {string} sSymbol The symbol of <code>MaskInputRule</code> which will be removed
	 * @private
	 */
	function removeRuleWithSymbol(sSymbol) {
		var oSearchRuleResult = findRuleBySymbol(sSymbol, this.getRules());
		if (oSearchRuleResult) {
			this.removeAggregation('rules', oSearchRuleResult.oRule);
		}
	}

	/**
	 * Searches for a particular <code>MaskInputRule</code> by a given symbol.
	 * @param {string} sMaskRuleSymbol The rule symbol to search for
	 * @param {array} aRules A collection of rules to search within
	 * @returns {null|object} Two key results (for example, { oRule: {MaskInputRule} The found rule, iIndex: {int} the index of it })
	 * @private
	 */
	function findRuleBySymbol(sMaskRuleSymbol, aRules) {
		var oResult = null;

		if (typeof sMaskRuleSymbol !== "string" || sMaskRuleSymbol.length !== 1) {
			jQuery.sap.log.error(sMaskRuleSymbol + " is not a valid mask rule symbol");
			return null;
		}

		jQuery.each(aRules, function (iIndex, oRule) {
			if (oRule.getMaskFormatSymbol() === sMaskRuleSymbol) {
				oResult = {
					oRule: oRule,
					iIndex: iIndex
				};
				return false;
			}
		});

		return oResult;
	}

	/**
	 * Gets the position range of the selected text.
	 * @returns {object} An object that contains the start and end positions of the selected text (zero based)
	 * @private
	 */
	function getTextSelection() {
		var _$Input = jQuery(this.getFocusDomRef());

		if (!_$Input && (_$Input.length === 0 || _$Input.is(":hidden"))) {
			return;
		}

		return {
			iFrom: _$Input[0].selectionStart,
			iTo: _$Input[0].selectionEnd,
			bHasSelection: (_$Input[0].selectionEnd - _$Input[0].selectionStart !== 0)
		};
	}

	/**
	 * Places the cursor on a given position (zero based).
	 * @param {int} iPos The position the cursor to be placed on
	 * @private
	 */
	function setCursorPosition(iPos) {
		var _$Input = jQuery(this.getFocusDomRef());
		return _$Input.cursorPos(iPos);
	}

	/**
	 * Gets the current position of the cursor.
	 * @returns {int} The current cursor position (zero based).
	 * @private
	 */
	function getCursorPosition() {
		var _$Input = jQuery(this.getFocusDomRef());
		return _$Input.cursorPos();
	}

	/**
	 * Sets up the mask.
	 * @private
	 */
	function setupMaskVariables() {
		var aRules = this.getRules(),
			sMask = this.getMask(),
			aMask = sMask.split(""),
			sPlaceholderSymbol = this.getPlaceholderSymbol();

		var aValue = buildInitialArray(aMask, sPlaceholderSymbol, aRules);
		this._oTempValue = new CharArray(aValue);

		var aTests = buildRules(aMask, aRules);
		this._iMaskLength = aTests.length;

		this._oRules = new TestRules(aTests);
		this._iUserInputStartPosition = this._oRules.nextTo();
	}

	/**
	 * Applies the mask functionality to the input.
	 * @private
	 */
	function applyMask() {
		var sMaskInputValue = this._getInputValue();

		if (!this.getEditable()) {
			return;
		}
		applyAndUpdate.call(this, sMaskInputValue);
	}

	/**
	 * Resets the temp value with a given range.
	 * @param {int} iFrom The starting position to start clearing (optional, zero based, default 0)
	 * @param {int} iTo The ending position to finish clearing (optional, zero based, defaults to last char array index)
	 * @private
	 */
	function resetTempValue(iFrom, iTo) {
		var iIndex,
			sPlaceholderSymbol = this.getPlaceholderSymbol();

		if (typeof iFrom === "undefined" || iFrom === null) {
			iFrom = 0;
			iTo = this._oTempValue.getSize() - 1;
		}

		for (iIndex = iFrom; iIndex <= iTo; iIndex++) {
			if (this._oRules.hasRuleAt(iIndex)) {
				this._oTempValue.setCharAt(sPlaceholderSymbol, iIndex);
			}
		}
	}

	/**
	 * Applies rules and updates the DOM input value.
	 * @param {String} sMaskInputValue The input string to which the rules will be applied
	 * @private
	 */
	function applyAndUpdate(sMaskInputValue) {
		applyRules.call(this, sMaskInputValue);
		this.updateDomValue(this._oTempValue.toString());
	}

	/**
	 * Finds the first placeholder symbol position.
	 * @returns {int} The first placeholder symbol position or -1 if none
	 * @private
	 */
	function findFirstPlaceholderPosition() {
		return this._oTempValue.toString().indexOf(this.getPlaceholderSymbol());
	}

	/**
	 * Applies the rules to the given input string and updates char array with the result.
	 * @param {string} sInput The input string to which the rules will be applied
	 * @private
	 */
	function applyRules(sInput) {
		var sCharacter,
			iInputIndex = 0,
			iMaskIndex,
			sPlaceholderSymbol = this.getPlaceholderSymbol(),
			bCharMatched;

		for (iMaskIndex = 0; iMaskIndex < this._iMaskLength; iMaskIndex++) {
			if (this._oRules.hasRuleAt(iMaskIndex)) {
					this._oTempValue.setCharAt(sPlaceholderSymbol, iMaskIndex);
					bCharMatched = false;

					if (sInput.length) {
						do {
							sCharacter = sInput.charAt(iInputIndex);
							iInputIndex++;
							if (this._oRules.applyCharAt(sCharacter, iMaskIndex)) {
								this._oTempValue.setCharAt(sCharacter, iMaskIndex);
								bCharMatched = true;
							}
						} while (!bCharMatched && (iInputIndex < sInput.length));
					}

					// the input string is over ->reset the rest of the char array to the end
					if (!bCharMatched) {
						resetTempValue.call(this, iMaskIndex + 1, this._iMaskLength - 1);
						break;
					}
			} else {
				if (this._oTempValue.charAt(iMaskIndex) === sInput.charAt(iInputIndex)) {
					iInputIndex++;
				}
			}
		}
	}

	/**
	 * Handles <code>onKeyPress</code> event.
	 * @param {jQuery.event} oEvent The jQuery event object
	 * @private
	 */
	function keyPressHandler(oEvent) {
		if (!this.getEditable()) {
			return;
		}

		var oSelection = getTextSelection.call(this),
			iPosition,
			sCharReplacement,
			oKey = parseKeyBoardEvent(oEvent);

		if (oKey.bCtrlKey || oKey.bAltKey || oKey.bMetaKey || oKey.bBeforeSpace) {
			return;
		}

		if (!oKey.bEnter && !oKey.bShiftLeftOrRightArrow && !oKey.bHome && !oKey.bEnd &&
			!(oKey.bShift && oKey.bDelete) &&
			!(oKey.bCtrlKey && oKey.bInsert) &&
			!(oKey.bShift && oKey.bInsert)) {
			if (oSelection.bHasSelection) {
				resetTempValue.call(this, oSelection.iFrom, oSelection.iTo - 1);
				this.updateDomValue(this._oTempValue.toString());
				setCursorPosition.call(this, Math.max(this._iUserInputStartPosition, oSelection.iFrom));
			}
			iPosition = this._oRules.nextTo(oSelection.iFrom - 1);

			if (iPosition < this._iMaskLength) {
				sCharReplacement = this._feedReplaceChar(oKey.sChar, iPosition, this._getInputValue());
				feedNextString.call(this, sCharReplacement, iPosition);
			}
			oEvent.preventDefault();
		}
	}

	/**
	 * Handle cut event.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	MaskInput.prototype.oncut = function(oEvent) {
		var  oSelection = getTextSelection.call(this),
				iBegin = oSelection.iFrom,
				iEnd = oSelection.iTo;

		InputBase.prototype.oncut.call(this, oEvent);

		if (!oSelection.bHasSelection) {
			return;
		}

		iEnd = iEnd - 1;
		resetTempValue.call(this, iBegin, iEnd);

		//oncut happens before the input event fires (before oninput)
		//we want to use the values from this point of time
		//but set them after the input event is handled (after oninput)

		// give a chance the normal browser cut and oninput handler to finish its work with the current selection,
		// before messing up the dom value (updateDomValue) or the selection (by setting a new cursor position)
		jQuery.sap.delayedCall(0, this,
			function updateDomAndCursor(sValue, iPos, aOldTempValueContent) {
				//update the temp value back
				//because oninput breaks it
				this._oTempValue._aContent = aOldTempValueContent;
				this.updateDomValue(sValue);

				//we want that shortly after updateDomValue
				//but positionCaret sets the cursor, also with a delayedCall
				//so we must put our update in the queue
				jQuery.sap.delayedCall(0, this, setCursorPosition, [iPos]);
			},
			[
				this._oTempValue.toString(),
				Math.max(this._iUserInputStartPosition, iBegin),
				this._oTempValue._aContent.slice(0)
			]
		);
	};

	/**
	 * Handles <code>onKeyDown</code> event.
	 * @param {jQuery.event} oEvent The jQuery event object
	 * @private
	 */
	function keyDownHandler(oEvent, oKey) {
		var sDirection,
			oSelection,
			iBegin,
			iEnd,
			iCursorPos,
			iNextCursorPos,
			oKey = oKey || parseKeyBoardEvent(oEvent);

		if (!this.getEditable()) {
			return;
		}

		if (!oKey.bShift && (oKey.bArrowRight || oKey.bArrowLeft)) {
			iCursorPos = getCursorPosition.call(this);
			oSelection = getTextSelection.call(this);


			// Determine the correct direction based on RTL mode, input characters and selection state
			sDirection = determineArrowKeyDirection.call(this, oKey, oSelection);

			if (isRtlMode.call(this) && oSelection.bHasSelection) {
				iNextCursorPos = determineRtlCaretPositionFromSelection.call(this, sDirection);
			} else {
				// Determine the next position based on mask validation rules only
				iNextCursorPos = this._oRules[sDirection](iCursorPos);
			}

			// chrome needs special treatment, because of a browser bug with switched first and last position
			if (isWebkitProblematicCase.call(this)) {
				iNextCursorPos = fixWebkitBorderPositions.call(this, iNextCursorPos, sDirection);
			}

			setCursorPosition.call(this, iNextCursorPos);
			oEvent.preventDefault();

		} else if (oKey.bEscape) {
			applyAndUpdate.call(this, this._sOldInputValue);
			positionCaret.call(this, true);
			oEvent.preventDefault();

		} else if (oKey.bEnter) {
			inputCompletedHandler.call(this, oEvent);

		} else if ((oKey.bCtrlKey && oKey.bInsert) ||
			(oKey.bShift && oKey.bInsert)) {
			InputBase.prototype.onkeydown.apply(this, arguments);
		} else if ((!oKey.bShift && oKey.bDelete) || oKey.bBackspace) {
			oSelection = getTextSelection.call(this);
			iBegin = oSelection.iFrom;
			iEnd = oSelection.iTo;

			if (!oSelection.bHasSelection) {
				if (oKey.bBackspace) {
					iBegin = this._oRules.previousTo(iBegin);
				}
			}

			if (oKey.bBackspace || (oKey.bDelete && oSelection.bHasSelection)) {
				iEnd = iEnd - 1;
			}

			resetTempValue.call(this, iBegin, iEnd);
			this.updateDomValue(this._oTempValue.toString());
			setCursorPosition.call(this, Math.max(this._iUserInputStartPosition, iBegin));

			oEvent.preventDefault();
		}
	}

	function feedNextString(sNextString, iPos) {
		var iNextPos,
			bAtLeastOneSuccessfulCharPlacement = false,
			aNextChars = sNextString.split(""),
			sNextChar;

		while (aNextChars.length) {
			sNextChar = aNextChars.splice(0, 1)[0]; //get and remove the first element
			if (this._oRules.applyCharAt(sNextChar, iPos)) {
				bAtLeastOneSuccessfulCharPlacement = true;

				this._oTempValue.setCharAt(sNextChar, iPos);
				iPos = this._oRules.nextTo(iPos);
			}
		}

		if (bAtLeastOneSuccessfulCharPlacement) {
			iNextPos = iPos; //because the cycle above already found the next pos
			this.updateDomValue(this._oTempValue.toString());
			setCursorPosition.call(this, iNextPos);
		}
	}

	/**
	 * Handles completed user input.
	 * @private
	 */
	function inputCompletedHandler() {
		var sNewMaskInputValue = this._getInputValue(),
			bTempValueDiffersFromOriginal,
			sValue,
			bEmptyPreviousDomValue,
			bEmptyNewDomValue;

		if (this._oTempValue.differsFrom(sNewMaskInputValue)) {
			applyAndUpdate.call(this, sNewMaskInputValue);
		}

		bTempValueDiffersFromOriginal = this._oTempValue.differsFromOriginal();
		sValue = bTempValueDiffersFromOriginal ? this._oTempValue.toString() : "";
		bEmptyPreviousDomValue = !this._sOldInputValue;
		bEmptyNewDomValue = !sNewMaskInputValue;

		if (bEmptyPreviousDomValue && (bEmptyNewDomValue || !bTempValueDiffersFromOriginal)){
			this.updateDomValue("");
			return;
		}

		if (this._sOldInputValue !== this._oTempValue.toString()) {
			this.setValue(sValue);
			if (this.onChange && !this.onChange({value: sValue})) {//if the subclass didn't fire the "change" event by itself
				this.fireChangeEvent(sValue);
			}
		}
	}

	function buildInitialArray(aMask, sPlaceholderSymbol, aRules) {
		return aMask.map(function (sChar, iIndex) {
			return findRuleBySymbol(sChar, aRules) ? sPlaceholderSymbol : sChar;
		});
	}

	/**
	 * Builds the test rules according to the mask input rule's regex string.
	 * @private
	 */
	function buildRules(aMask, aRules) {
		var aTestRules = [];

		jQuery.each(aMask, function (iIndex, sChar) {
			var oSearchResult = findRuleBySymbol(sChar, aRules);
			aTestRules.push(oSearchResult ? new RegExp(oSearchResult.oRule.getRegex()) : null);
		});
		return aTestRules;
	}

	/**
	 * Parses the keyboard events.
	 * @param {object} oEvent
	 * @private
	 * @returns {object} Summary object with information about the pressed keys, for example: {{iCode: (*|oEvent.keyCode), sChar: (string|*), bCtrlKey: boolean, bAltKey: boolean, bMetaKey: boolean,
	 * bShift: boolean, bBackspace: boolean, bDelete: boolean, bEscape: boolean, bEnter: boolean, bIphoneEscape: boolean,
	 * bArrowRight: boolean, bArrowLeft: boolean, bHome: boolean, bEnd: boolean, bShiftLeftOrRightArrow: boolean,
	 * bBeforeSpace: boolean}}
	 */
	function parseKeyBoardEvent(oEvent) {
		var iPressedKey = oEvent.which || oEvent.keyCode,
			mKC = jQuery.sap.KeyCodes,
			bArrowRight = iPressedKey === mKC.ARROW_RIGHT,
			bArrowLeft = iPressedKey === mKC.ARROW_LEFT,
			bShift = oEvent.shiftKey;

		return {
			iCode: iPressedKey,
			sChar: String.fromCharCode(iPressedKey),
			bCtrlKey: oEvent.ctrlKey,
			bAltKey: oEvent.altKey,
			bMetaKey: oEvent.metaKey,
			bShift: bShift,
			bInsert: iPressedKey === jQuery.sap.KeyCodes.INSERT,
			bBackspace: iPressedKey === mKC.BACKSPACE,
			bDelete: iPressedKey === mKC.DELETE,
			bEscape: iPressedKey === mKC.ESCAPE,
			bEnter: iPressedKey === mKC.ENTER,
			bIphoneEscape: (sap.ui.Device.system.phone && sap.ui.Device.os.ios && iPressedKey === 127),
			bArrowRight: bArrowRight,
			bArrowLeft: bArrowLeft,
			bHome: iPressedKey === jQuery.sap.KeyCodes.HOME,
			bEnd:  iPressedKey === jQuery.sap.KeyCodes.END,
			bShiftLeftOrRightArrow: bShift && (bArrowLeft || bArrowRight),
			bBeforeSpace: iPressedKey < mKC.SPACE
		};
	}

	/**
	 * Positions the caret or selects the whole input.
	 * @param {boolean} bSelectAllIfInputIsCompleted If true, selects the whole input if it is fully completed,
	 * or otherwise, always moves the caret to the first placeholder position
	 */
	function positionCaret(bSelectAllIfInputIsCompleted) {
		var sMask = this.getMask(),
			iEndSelectionIndex;

		clearTimeout(this._iCaretTimeoutId);
		iEndSelectionIndex = findFirstPlaceholderPosition.call(this);
		if (iEndSelectionIndex < 0) {
			iEndSelectionIndex = sMask.length;
		}

		this._iCaretTimeoutId = jQuery.sap.delayedCall(0, this, function () {
			if (this.getFocusDomRef() !== document.activeElement) {
				return;
			}
			if (bSelectAllIfInputIsCompleted && (iEndSelectionIndex === (sMask.length))) {
				this.selectText(0, iEndSelectionIndex);
			} else {
				setCursorPosition.call(this, iEndSelectionIndex);
			}
		});
	}



	/**
	 * Determines if a given string contains characters that will not comply to the mask input rules.
	 *
	 * @param {string} sInput the input
	 * @returns {boolean} True if the whole <code>sInput</code> passes the validation, false otherwise.
	 * @private
	 */
	function isValidInput(sInput) {
		var iLimit = sInput.length;
		for (var i = 0; i < iLimit; i++) {
			var sChar = sInput[i];

			/* consider the input invalid if any character except the placeholder symbol does not comply to the mask
			 rules of the corresponding position or if in case there is no rule, if the character is not exactly the same
			 as the current mask character at that position (i.e. immutable characters) */
			if (this._oRules.hasRuleAt(i) && (!this._oRules.applyCharAt(sChar, i) && sChar !== this.getPlaceholderSymbol())) {
				return false;
			}

			if (!this._oRules.hasRuleAt(i) && sChar !== this._oTempValue.charAt(i)) {
				return false;
			}
		}

		return true;
	}


	/**
	 * Checks if a given character belongs to an RTL language
	 * @param sString
	 * @returns {boolean}
	 */
	function isRtlChar(sString) {
		var ltrChars    = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' + '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF',
			rtlChars    = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC',
			rtlDirCheck = new RegExp('^[^' + ltrChars + ']*[' + rtlChars + ']');

		return rtlDirCheck.test(sString);
	}


	/**
	 * Fix an issue with Chrome where first and last positions are switched
	 * @param iCurrentPosition
	 * @param sDirection
	 * @returns {*}
	 */
	function fixWebkitBorderPositions(iCurrentPosition, sDirection) {
		if (!isWebkitProblematicCase.call(this)) {
			return iCurrentPosition;
		}

		var iNewCaretPos = iCurrentPosition;

		if (sDirection === 'nextTo') {
			if (iCurrentPosition === 0) {
				iNewCaretPos = 0;
			}
			if (iCurrentPosition === this._oTempValue.toString().length) {
				iNewCaretPos = 0;
			}
			if (iCurrentPosition === 1) {
				iNewCaretPos = 0;
			}

			if (iCurrentPosition === this._oTempValue.toString().length + 1) {
				iNewCaretPos = 1;
			}
		} else {
			if (iCurrentPosition === this._oTempValue.toString().length) {
				iNewCaretPos = this._oTempValue.toString().length - 1;
			}
			if (iCurrentPosition === 0) {
				iNewCaretPos = this._oTempValue.toString().length;
			}
			if (iCurrentPosition === this._oTempValue.toString().length - 1) {
				iNewCaretPos = this._oTempValue.toString().length;
			}

			if (iCurrentPosition === -1) {
				iNewCaretPos = this._oTempValue.toString().length - 1;
			}
		}

		return iNewCaretPos;
	}


	/**
	 * Check if the current value contains any RTL characters
	 * @returns {boolean}
	 */
	function containsRtlChars() {
		var sTempValue = this._oTempValue.toString(),
			bContainsRtl = false;
		for (var i = 0; i < sTempValue.length; i++) {
			bContainsRtl = isRtlChar(sTempValue[i]);
		}
		return bContainsRtl;
	}


	/**
	 * Check if the current control is in RTL mode.
	 * @returns {boolean}
	 */
	function isRtlMode() {
		return sap.ui.getCore().getConfiguration().getRTL() || (this.getTextDirection() === sap.ui.core.TextDirection.RTL);
	}

	/**
	 * Check if the current environment and interaction lead to a bug in Webkit
	 * @returns {boolean|*}
	 */
	function isWebkitProblematicCase() {
		return (sap.ui.Device.browser.webkit && isRtlMode.call(this) && !containsRtlChars.call(this));
	}

	/**
	 * Determine the correct direction based on RTL mode, current input characters and selection state
	 * @param oKey
	 * @param {object} oSelection
	 * @returns {string} sDirection
	 */
	function determineArrowKeyDirection(oKey, oSelection) {
		var sDirection;
		if (!isRtlMode.call(this) || !containsRtlChars.call(this) || oSelection.bHasSelection) {
			// when there is selection we want the arrows to always behave as on a ltr input
			if (oKey.bArrowRight) {
				sDirection = 'nextTo';
			} else {
				sDirection = 'previousTo';
			}
		} else {
			// rtl mode
			if (oKey.bArrowRight) {
				sDirection = 'previousTo';
			} else {
				sDirection = 'nextTo';
			}
		}
		return sDirection;
	}

	/**
	 * Determine the right caret position based on the current selection state
	 * @param sDirection
	 * @returns {integer} iNewCaretPos
	 */
	function determineRtlCaretPositionFromSelection(sDirection, bWithChromeFix) {
		var iNewCaretPos,
			oSelection = getTextSelection.call(this);

		if (bWithChromeFix) {
			if (sDirection === 'nextTo') {
				if (!containsRtlChars.call(this)) {
					iNewCaretPos = oSelection.iFrom;
				} else {
					iNewCaretPos = oSelection.iTo;
				}
			} else {
				if (!containsRtlChars.call(this)) {
					iNewCaretPos = oSelection.iTo;
				} else {
					iNewCaretPos = oSelection.iFrom;
				}
			}
		} else {
			if (sDirection === 'nextTo') {
				if (!containsRtlChars.call(this)) {
					iNewCaretPos = oSelection.iTo;
				} else {
					iNewCaretPos = oSelection.iFrom;
				}
			} else {
				if (!containsRtlChars.call(this)) {
					iNewCaretPos = oSelection.iFrom;
				} else {
					iNewCaretPos = oSelection.iTo;
				}
			}
		}

		return iNewCaretPos;
	}

	return MaskInput;

}, /* bExport= */ true);
