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

	QUnit.test("it should not throw an error when the .destroy() method is called twice", function (assert) {
		this.rangeSlider.destroy();
		assert.ok(true);
	});

	QUnit.test("Default Values", function (assert) {
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
        assert.ok(that === this.rangeSlider, "The function should not do anything and return this for chaning");
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

	QUnit.test("_calculateHandlePosition() with decimal step", function () {
		this.rangeSlider._fSliderWidth = 100;
		this.rangeSlider._fSliderOffsetLeft = 0;
		this.rangeSlider._fSliderPaddingLeft = 0;
		this.rangeSlider.setStep(0.5);

		var value1 = 0.0,
			value2 = 5.5,
			value3 = 25.2,
			value4 = 30.8;

		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value1), 0, "The function should return 0");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value2), 5.5, "The function should return 5.5");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value3), 25, "The function should return 25");
		assert.strictEqual(this.rangeSlider._calculateHandlePosition(value4), 31, "The function should return 31");
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

	QUnit.module("Overwritten methods");

	QUnit.test("getRange", function (assert) {
		var aRange = [12, 38],
			oRangeSlider = new sap.m.RangeSlider({range: aRange, min: 0, max: 100}).placeAt(DOM_RENDER_LOCATION);

		sap.ui.getCore().applyChanges();

		assert.deepEqual(oRangeSlider.getRange(), aRange, "Range should equal to the initial set value: " + aRange);
		assert.deepEqual(oRangeSlider.getRange(), oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oRangeSlider.getRange() !== oRangeSlider.getRange(), "Ranges should not be the same instance");

		oRangeSlider.destroy();
	});

	QUnit.module("Integrations:");

	QUnit.test("Model change from the outside", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		oRangeSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(oData.min, oRangeSlider.getMin(), "Min threshold to be set properly");
		assert.strictEqual(oData.max, oRangeSlider.getMax(), "Max threshold to be set properly");
		assert.deepEqual(oData.range, oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oData.range !== oRangeSlider.getRange(), "Range array should not be the same instances");

		//Act
		oModel.setProperty("/range", [120, 150]);
		oModel.setProperty("/min", 100);
		oModel.setProperty("/max", 200);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(100, oRangeSlider.getMin(), "Min threshold to be set properly");
		assert.strictEqual(200, oRangeSlider.getMax(), "Max threshold to be set properly");
		assert.strictEqual(120, oRangeSlider.getValue(), "Max threshold to be set properly");
		assert.strictEqual(150, oRangeSlider.getValue2(), "Max threshold to be set properly");
		assert.deepEqual([120, 150], oRangeSlider.getRange(), "Ranges should be equal");

		oRangeSlider.destroy();
	});

	QUnit.test("Model change from the inside", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		oRangeSlider.placeAt(DOM_RENDER_LOCATION);
		sap.ui.getCore().applyChanges();

		//Act
		var oData2 = [50, 80];
		oRangeSlider.setRange(oData2);
		sap.ui.getCore().applyChanges();

		assert.deepEqual([50, 80], oModel.getProperty("/range"), "Ranges should be equal");
		assert.deepEqual([50, 80], oRangeSlider.getRange(), "Ranges should be equal");
		assert.ok(oData2 !== oRangeSlider.getRange(), "Range array should not be the same instances");

		oRangeSlider.destroy();
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

		oView.destroy();
	});

	QUnit.test("value, value2 and range bindings through setters", function (assert) {
		var oRangeSlider = new sap.m.RangeSlider({value: 12, value2: 88, min: 0, max: 90});
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [12, 88], "Range should be equal to [12, 88]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");


		//act
		oRangeSlider.setValue(22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 88], "Range should be equal to [22, 88]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");

		//act
		oRangeSlider.setValue2(35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");

		//act
		oRangeSlider.setRange([5, 15]);

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [5, 15], "Range should be equal to [5, 15]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
	});

	QUnit.test("value, value2 and range setters, bindings + outer Model", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [100, 500], "Range should be equal to [100, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");


		//act
		oRangeSlider.setValue(22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 500], "Range should be equal to [22, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], 22, "Range 0 and value should be updated properly to 22");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setValue2(35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setRange([5, 15]);

		//assert
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");
	});

	QUnit.test("value, value2 and range setters, bindings + outer Model V2", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", value: "{/range/0}", value2: "{/range/1}", range: "{/range}"});

		oRangeSlider.setModel(oModel);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [100, 500], "Range should be equal to [100, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");


		//act
		oRangeSlider.setValue(22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 500], "Range should be equal to [22, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], 22, "Range 0 and value should be updated properly to 22");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setValue2(35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oRangeSlider.setRange([5, 15]);

		//assert
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");
	});

	QUnit.test("value, value2 and range setters, bindings + outer Model change", function (assert) {
		var oData = {min: 0, max: 5000, range: [100, 500]},
			oModel = new sap.ui.model.json.JSONModel(oData),
			oRangeSlider = new sap.m.RangeSlider({min: "{/min}", max: "{/max}", range: "{/range}", value: "{/range/0}", value2: "{/range/1}"});

		oRangeSlider.setModel(oModel);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [100, 500], "Range should be equal to [100, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");


		//act
		oModel.setProperty("/range/0", 22);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 500], "Range should be equal to [22, 500]");
		assert.strictEqual(oRangeSlider.getRange()[0], 22, "Range 0 and value should be updated properly to 22");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oModel.setProperty("/range/1", 35);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [22, 35], "Range should be equal to [22, 35]");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be updated properly");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");

		//act
		oModel.setProperty("/range", [5, 15]);
		oModel.setProperty("/range/1", 99);
		sap.ui.getCore().applyChanges();

		//assert
		assert.deepEqual(oRangeSlider.getRange(), [5, 99], "Range should be equal to [5, 99]");
		assert.strictEqual(oRangeSlider.getRange()[0], oRangeSlider.getValue(), "Range 0 and value should be equal");
		assert.strictEqual(oRangeSlider.getRange()[1], oRangeSlider.getValue2(), "Range 1 and value2 should be equal");
		assert.deepEqual(oRangeSlider.getRange(), oModel.getProperty("/range"), "Model should equal the range");
	});
}());

