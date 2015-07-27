sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(jQuery, Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	var WizardController = Controller.extend("sap.m.sample.Wizard.C", {
		onInit: function() {
			this._wizard = this.getView().byId("CreateProductWizard");
			this.model = new sap.ui.model.json.JSONModel();
			this.model.setData({
				productNameState:"Error",
				productWeightState:"Error"
			});
			this.getView().setModel(this.model);
		},
		setProductType: function(evt) {
			var productType = evt.getSource().getTitle();
			this.model.setProperty("/productType", productType);
			this.getView().byId("ProductStepChosenType").setText("Chosen product type: " + productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		setProductTypeFromSegmented: function(evt) {
			var productType = evt.mParameters.button.getText();
			this.model.setProperty("/productType", productType);
			this._wizard.validateStep(this.getView().byId("ProductTypeStep"));
		},
		additinalInfoValidation : function() {
			var name = this.getView().byId("ProductName").getValue();
			var weight = parseInt(this.getView().byId("ProductWeight").getValue());

			isNaN(weight) ? this.model.setProperty("/productWeightState", "Error") : this.model.setProperty("/productWeightState", "None");
			name.length<6 ?  this.model.setProperty("/productNameState", "Error") : this.model.setProperty("/productNameState", "None");

			if (name.length < 6 || isNaN(weight))
				this._wizard.invalidateStep(this.getView().byId("ProductInfoStep"));
			else
				this._wizard.validateStep(this.getView().byId("ProductInfoStep"));
		},
		optionalStepActivation: function () {
			MessageToast.show(
				'This event is fired on activate of Step3.'
			);
		},
		optionalStepCompletion: function() {
			MessageToast.show(
				'This event is fired on complete of Step3. You can use it to gather the information, and lock the input data.'
			);
		},
		scrollFrom4to2 : function() {
			this._wizard.goToStep(this.getView().byId("ProductInfoStep"));
		},
		goFrom4to3 : function() {
			if(this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.previousStep();
		},
		goFrom4to5 : function() {
			if(this._wizard.getProgressStep() === this.getView().byId("PricingStep"))
				this._wizard.nextStep();
		},
		wizardCompletedHandler: function() {
			MessageBox.show(
				'This event is fired on complete of the whole process.',
				{
					icon: MessageBox.Icon.INFORMATION,
					title: "Wizard completed event",
					actions: [MessageBox.Action.OK]
				}
			);
		},
		productWeighStateFormatter: function(val) {
			return isNaN(val)?"Error":"None";
		},
		discardProgress: function() {
			this._wizard.discardProgress(this.getView().byId("ProductTypeStep"));
		}
	});

	return WizardController;
});
