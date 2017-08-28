(function () {
    "use strict";
    var DOM_RENDER_LOCATION = "qunit-fixture";

    QUnit.module("HTML", {
        setup: function () {
            this.rangeSlider = new sap.m.RangeSlider();

            this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function () {
            this.rangeSlider.destroy();
            this.rangeSlider = null;
        }
    });

    QUnit.test("RangeSlider container", function(assert) {
        // assert
        assert.ok(this.rangeSlider, "RangeSlider should be rendered");
        assert.ok(jQuery(".sapMSliderProgress"), "The range slider's progress is rendered");
    });

    QUnit.test("Handles", function(assert) {
        assert.strictEqual(jQuery(".sapMSliderHandle").length, 2, "There should be two handles.");
        assert.strictEqual(jQuery("[id*='-handle']").length, 2, "There should be four elements in the handles section rendered.");
        assert.strictEqual(jQuery("[id$='-handle1']").length, 1, "There should be only one handle rendered with id \"-handle1\".");
        assert.strictEqual(jQuery("[id$='-handle2']").length, 1, "There should be only one handle rendered with id \"-handle2\".");
        assert.strictEqual(this.rangeSlider.getDomRef("handle1").style.left, "0%", "Left handle should be 0% left positioned");
        assert.strictEqual(this.rangeSlider.getDomRef("handle2").style.left, "100%", "Right handle should be 0% right positioned.");

        assert.ok(jQuery("[id$='-handle1']").attr("aria-orientation"), "Aria attribute \"aria-orientation\" should be rendered for handle1.");
        assert.ok(jQuery("[id$='-handle1']").attr("aria-valuemin"), "Aria attribute \"aria-valuemin\" should be rendered for handle1.");
        assert.ok(jQuery("[id$='-handle1']").attr("aria-valuemax"), "Aria attribute \"aria-valuemax\" should be rendered for handle1.");
        assert.ok(jQuery("[id$='-handle1']").attr("aria-valuenow"), "Aria attribute \"aria-valuenow\" should be rendered for handle1.");

        assert.ok(jQuery("[id$='-handle2']").attr("aria-orientation"), "Aria attribute \"aria-orientation\" should be rendered for handle2.");
        assert.ok(jQuery("[id$='-handle2']").attr("aria-valuemin"), "Aria attribute \"aria-valuemin\" should be rendered for handle2.");
        assert.ok(jQuery("[id$='-handle2']").attr("aria-valuemax"), "Aria attribute \"aria-valuemax\" should be rendered for handle2.");
        assert.ok(jQuery("[id$='-handle2']").attr("aria-valuenow"), "Aria attribute \"aria-valuenow\" should be rendered for handle2.");
    });

    QUnit.test("Handles' Tooltips", function(assert) {
        assert.strictEqual(jQuery(".sapMSliderHandleTooltip").length, 2, "There should be two tooltips.");

        assert.strictEqual(jQuery("[id$='-LeftTooltip']").length, 1, "There should be only one handle tooltip rendered for handle1.");
        assert.strictEqual(jQuery("[id$='-RightTooltip']").length, 1, "There should be only one handle tooltip rendered for handle2.");
    });

    QUnit.test("Handles' Tooltips' width percent ", function(assert) {
        var oldPercent = this.rangeSlider._fTooltipHalfWidthPercent;

        this.rangeSlider.setMin(-1000);
        this.rangeSlider.setMax(0);
        sap.ui.getCore().applyChanges();

        assert.ok(oldPercent < this.rangeSlider._fTooltipHalfWidthPercent, "The new calculated percent should be bigger than the old one");
    });

    QUnit.test("RangeSlider's Labels", function(assert) {
        assert.ok(jQuery(".sapMSliderLabels"), "The labels container is rendered.");
        assert.strictEqual(jQuery(".sapMSliderLabel").length, 2, "There are two labels rendered.");
        assert.strictEqual(jQuery(".sapMSliderLabel").length, 2, "There are two labels rendered.");
        assert.equal(this.rangeSlider.$().find(".sapMSliderLabel:eq(0)").html(), this.rangeSlider.getMin(), "The start label shows the min value");
        assert.equal(this.rangeSlider.$().find(".sapMSliderLabel:eq(1)").html(), this.rangeSlider.getMax(), "The end label shows the max value");
    });

    QUnit.test("Overlapping handles", function(assert) {
        this.rangeSlider.setRange([50,50]);
        sap.ui.getCore().applyChanges();

        assert.ok(this.rangeSlider.$().find(".sapMSliderHandle"), "The handles should be added an Overlap class");
        assert.strictEqual(this.rangeSlider.$().find(".sapMSliderHandle").length, 2, "Both handles should be affected");
    });

    QUnit.module("API", {
        setup: function () {
            this.rangeSlider = new sap.m.RangeSlider();

            this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function () {
            this.rangeSlider.destroy();
            this.rangeSlider = null;
        }
    });

	QUnit.test("it should not throw an error when the .destroy() method is called twice", function(assert) {
		this.rangeSlider.destroy();
		assert.ok(true);
	});

    QUnit.test("Default Values", function(assert) {
        // assert
        var aRange = this.rangeSlider.getRange();
        assert.strictEqual(this.rangeSlider.getEnabled(), true, "By default the RangeSlider is enabled");
        assert.strictEqual(this.rangeSlider.getVisible(), true, "By default the RangeSlider is visible");
        assert.strictEqual(this.rangeSlider.getName(), "", "By default the RangeSlider's name is ''");
        assert.strictEqual(this.rangeSlider.getWidth(), "100%", "The initial width is set to \"100%\"");
        assert.strictEqual(this.rangeSlider.getMin(), 0, "The default value for min is 0.");
        assert.strictEqual(this.rangeSlider.getMax(), 100, "The default value for max is 100.");
        assert.strictEqual(this.rangeSlider.getStep(), 1, "By default the RangeSlider's step is 1");
        assert.ok(Array.isArray(aRange), "The range of the RangeSlider should be an array.");
        assert.strictEqual(aRange.length, 2, "The range of the RangeSlider should be an array with two values in it.");
        assert.strictEqual(aRange[0], 0, "The default low value of the range should be 0.");
        assert.strictEqual(aRange[1], 100, "The default high value of the range should be 100.");
    });

    QUnit.test("getRange()", function(assert) {
        var aRange = this.rangeSlider.getRange();

        assert.strictEqual(aRange[0], 0, "The getRange()[0] function should return the default min value of 0");
        assert.strictEqual(aRange[1], 100, "The getRange()[1] function should return the default max value of 100");
    });

    QUnit.test("setRange()", function(assert) {
        var newRange = [25,75],
            aRange;

        this.rangeSlider.setRange(newRange);
        this.rangeSlider.setWidth("100px");
        sap.ui.getCore().applyChanges();

        aRange = this.rangeSlider.getRange();

        assert.strictEqual(aRange[0], newRange[0], "The first value of the range should be set to " + newRange[0]);
        assert.strictEqual(aRange[1], newRange[1], "The second value of the range should be set to " + newRange[1]);

        assert.strictEqual(parseInt(this.rangeSlider.$("LeftTooltip").text()), newRange[0], "The tooltip1's value should be changed to the left handle's value of " + newRange[0]);
        assert.strictEqual(parseInt(this.rangeSlider.$("RightTooltip").text()), newRange[1], "The tooltip2's value should be changed to the right handle's value of " + newRange[1])
    });

    QUnit.test("Invalid range starting value of -20 (where min is 0)", function (assert) {
        this.rangeSlider.setRange([-20, 50]);
        sap.ui.getCore().applyChanges();

        var aRange = this.rangeSlider.getRange();

        assert.strictEqual(aRange[0], this.rangeSlider.getMin(), "The starting value of the range should be set to 0");
        assert.strictEqual(aRange[1], 50, "The end value of the range should be set to 50");
    });

    QUnit.test("Invalid range ending value of 150 (where max is 100)", function(assert) {
        this.rangeSlider.setRange([20,150]);
        sap.ui.getCore().applyChanges();

        var aRange = this.rangeSlider.getRange();

        assert.strictEqual(aRange[0], 20, "The starting value of the range should be set to 20");
        assert.strictEqual(aRange[1], this.rangeSlider.getMax(), "The end value of the range should be set to 100");
    });

    QUnit.test("getClosestHandleDomRef() with coordinates for left handle", function(assert) {
        this.rangeSlider.setWidth("1000px");
        this.rangeSlider._fSliderOffsetLeft = 0;

        var oMockEventData = {"clientX": 0};
        var oHandleDomRef = this.rangeSlider.getClosestHandleDomRef(oMockEventData);

        assert.strictEqual(oHandleDomRef, this.rangeSlider.getDomRef("handle1"), "The function should return the first handle");
    });

    QUnit.test("getClosestHandleDomRef() with coordinates for right handle", function(assert) {
        this.rangeSlider.setWidth("1000px");
        this.rangeSlider._fSliderOffsetLeft = 0;

        var oMockEventData = {clientX: 1000, pageX: 1000};
        var oHandleDomRef = this.rangeSlider.getClosestHandleDomRef(oMockEventData);

        assert.strictEqual(oHandleDomRef, this.rangeSlider.getDomRef("handle2"), "The function should return the second handle");
    });

    QUnit.test("setValue()", function(){
        var that = this.rangeSlider.setValue();
        assert.ok(that === this.rangeSlider, "The function should not do anything and return this for chaining");
    });

    QUnit.test("XML value", function (assert) {
        var oRangeSlider,
            sXMLText = '<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc"><RangeSlider id="range" range="5,20" /></mvc:View>',
            oView = sap.ui.xmlview({viewContent: sXMLText});

        oView.placeAt(DOM_RENDER_LOCATION);
        sap.ui.getCore().applyChanges();

        oRangeSlider = oView.byId("range");

        assert.ok(oRangeSlider, "Slider should have been initialized");
        assert.deepEqual(oRangeSlider.getRange(), [5, 20], "Range's string array should have been parsed properly");

        oRangeSlider.destroy();
        oRangeSlider = null;
        oView.destroy();
    });

    QUnit.test("invalid XML value", function (assert) {
        var oRangeSlider,
            oErrorLogSpy = this.stub(jQuery.sap.log, "error"),
            sXMLText = '<mvc:View xmlns="sap.m" xmlns:mvc="sap.ui.core.mvc"><RangeSlider id="range" range="5,xx" /></mvc:View>',
            oView = sap.ui.xmlview({viewContent: sXMLText});

        oView.placeAt(DOM_RENDER_LOCATION);
        sap.ui.getCore().applyChanges();

        oRangeSlider = oView.byId("range");

        assert.ok(oErrorLogSpy.calledOnce, "An error was logged");

        oRangeSlider.destroy();
        oRangeSlider = null;
        oView.destroy();
    });

    QUnit.test("_calculateHandlePosition()", function(){
        this.rangeSlider._fSliderWidth = 100;
        this.rangeSlider._fSliderOffsetLeft = 0;
        this.rangeSlider._fSliderPaddingLeft = 0;

        var value1 = 0,
            value2 = 100,
            value3 = 73,
            value4 = -1,
            value5 = 105;

        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 100, "The function should return 100");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 73, "The function should return 73");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value4), 0, "The function should return 0");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value5), 100, "The function should return 100");
    });

    QUnit.test("_calculateHandlePosition() with even step", function(){
        this.rangeSlider._fSliderWidth = 100;
        this.rangeSlider._fSliderOffsetLeft = 0;
        this.rangeSlider._fSliderPaddingLeft = 0;
        this.rangeSlider.setStep(2);

        var value1 = 0,
            value2 = 100,
            value3 = 73;

        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 100, "The function should return 100");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 74, "The function should return 74");
    });

    QUnit.test("_calculateHandlePosition() with odd step", function(){
        this.rangeSlider._fSliderWidth = 100;
        this.rangeSlider._fSliderOffsetLeft = 0;
        this.rangeSlider._fSliderPaddingLeft = 0;
        this.rangeSlider.setStep(3);

        var value1 = 0,
            value2 = 9,
            value3 = 102,
            value4 = 73;

        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 9, "The function should return 9");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 100, "The function should return 100");
        assert.strictEqual(this.rangeSlider._calculateHandlePosition(value4), 72, "The function should return 72");
    });

    QUnit.test("Calculate movement offset", function (assert) {
        var aRange = [4, 27],
            iStep = 5,
            oSlider = new sap.m.RangeSlider("RangeSlider6", {
                step: iStep,
                min: 4,
                max: 27,
                range: aRange
            }).placeAt(DOM_RENDER_LOCATION);
        sap.ui.getCore().applyChanges();

        //Act
        oSlider._updateSliderValues(iStep, oSlider._mHandleTooltip.start.handle);
        sap.ui.getCore().applyChanges();

        //Test
        aRange = oSlider.getRange();
        assert.strictEqual(aRange[0], 9, "First value of the range to be updated");
        // clock.tick(1000);

        //Act
        aRange = [10, 27];
        oSlider.setRange(aRange);
        sap.ui.getCore().applyChanges();
        // clock.tick(1000);

        assert.strictEqual(aRange[0], 10, "Range[0] to be set properly");
        assert.strictEqual(aRange[1], 27, "Range[1] to be set properly");

        //Act
        oSlider._updateSliderValues(-1 * iStep, oSlider._mHandleTooltip.start.handle);
        sap.ui.getCore().applyChanges();

        //Test
        aRange = oSlider.getRange();
        assert.strictEqual(aRange[0], 4, "First value of the range to be set at the lowest possible value");

        oSlider.destroy();
        oSlider = null;
    });

    QUnit.module("Events", {
        setup: function () {
            this.rangeSlider = new sap.m.RangeSlider();

            this.rangeSlider.placeAt(DOM_RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function () {
            this.rangeSlider.destroy();
            this.rangeSlider = null;
        }
    });

	QUnit.test("KH: Global ALT + Arrow", function (assert) {
		var oMockEvent = {
				target: {type: ""},
				altKey: true,
				preventDefault: function () {},
				setMarked: function () {}
			},
			oRangeSlider = new sap.m.RangeSlider().placeAt(DOM_RENDER_LOCATION),
			oEventSpyPreventDefault = this.spy(oMockEvent, "preventDefault"),
			oEventSpySetMarked = this.spy(oMockEvent, "setMarked");

		// Act
		oRangeSlider.onsapincreasemodifiers(oMockEvent);

		// Assert
		assert.ok(oEventSpyPreventDefault.callCount === 0, "The method is skipped and the event went to the global KH");
		assert.ok(oEventSpySetMarked.callCount === 0, "The method is skipped and the event went to the global KH");

		// Act
		oRangeSlider.onsapdecreasemodifiers(oMockEvent);

		// Assert
		assert.ok(oEventSpyPreventDefault.callCount === 0, "The method is skipped and the event went to the global KH");
		assert.ok(oEventSpySetMarked.callCount === 0, "The method is skipped and the event went to the global KH");
	});

	QUnit.module("Events");

	QUnit.test("liveChange trigger should be fired only when the range is actually changed.", function (assert) {
		//Setup
		var aRange = [12, 38],
			fnLiveChange = this.spy(function (oEvent) {
				var aRangeParam = oEvent.getParameter("range");
				assert.deepEqual(aRangeParam, aRange, "Range should be properly set");
			}),
			oRangeSlider = new sap.m.RangeSlider({range: aRange, min: 0, max: 100, liveChange: fnLiveChange}).placeAt(DOM_RENDER_LOCATION);

		assert.expect(5);

		//Act
		oRangeSlider._triggerLiveChange();
		//Assert
		assert.ok(fnLiveChange.calledOnce, "liveChange listener should be called once.");

		//Act
		oRangeSlider._triggerLiveChange();
		//Assert
		assert.ok(fnLiveChange.calledOnce, "liveChange listener should still be called once.");

		//Act
		aRange = [20, 30];
		oRangeSlider.setRange(aRange);
		oRangeSlider._triggerLiveChange();
		//Assert
		assert.ok(fnLiveChange.calledTwice, "liveChange listener should be called once again when the range is changed.");
    });

    QUnit.test("Handle input event:", function (assert) {
        var oRangeSlider = new sap.m.RangeSlider({
                range: [37.2,58.45],
                min: 0,
                max: 100,
                inputsAsTooltips: true,
                step: 0.01
            });

        oRangeSlider.placeAt(DOM_RENDER_LOCATION);
        sap.ui.getCore().applyChanges();

		// Act
        oRangeSlider._mHandleTooltip.start.tooltip.fireChange({value: 15.12});
        sap.ui.getCore().applyChanges();

		// Assert
        assert.strictEqual(oRangeSlider.getRange()[0], 15.12, "The RangeSlider handleInputChange method didn't truncate the value");

        oRangeSlider.destroy();
	});

}());

