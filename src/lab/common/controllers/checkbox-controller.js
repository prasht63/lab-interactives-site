/*global define $ model */

define(function () {

  var metadata  = require('common/controllers/interactive-metadata'),
      validator = require('common/validator');

  return function CheckboxController(component, scriptingAPI) {
    var propertyName,
        onClickScript,
        initialValue,
        $checkbox,
        $label,
        $element,
        controller,

        // Updates checkbox using model property. Used in modelLoadedCallback.
        // Make sure that this function is only called when:
        // a) model is loaded,
        // b) checkbox is bound to some property.
        updateCheckbox = function () {
          var value = model.get(propertyName);
          if (value) {
            $checkbox.attr('checked', true);
          } else {
            $checkbox.attr('checked', false);
          }
        };

    // Validate component definition, use validated copy of the properties.
    component = validator.validateCompleteness(metadata.checkbox, component);
    propertyName  = component.property;
    onClickScript = component.onClick;
    initialValue  = component.initialValue;

    $label = $('<label>').append(component.text);
    $checkbox = $('<input type="checkbox">').attr('id', component.id);

    // default is to have label on left of checkbox
    if (component.textOn === "right") {
      $element = $('<div>').append($checkbox).append($label);
    } else {
      $element = $('<div>').append($label).append($checkbox);
    }

    // Append class to the most outer container.
    $element.addClass("interactive-checkbox");
    // Each interactive component has to have class "component".
    $element.addClass("component");

    // Custom dimensions.
    $element.css({
      width: component.width,
      height: component.height
    });

    // Process onClick script if it is defined.
    if (onClickScript) {
      // Create a function which assumes we pass it a parameter called 'value'.
      onClickScript = scriptingAPI.makeFunctionInScriptContext('value', onClickScript);
    }

    // Register handler for click event.
    $checkbox.click(function () {
      var value = false,
          propObj;
      // $(this) will contain a reference to the checkbox.
      if ($(this).is(':checked')) {
        value = true;
      }
      // Change property value if checkbox is connected
      // with model's property.
      if (propertyName !== undefined) {
        propObj = {};
        propObj[propertyName] = value;
        model.set(propObj);
      }
      // Finally, if checkbox has onClick script attached,
      // call it in script context with checkbox status passed.
      if (onClickScript !== undefined) {
        onClickScript(value);
      }
    });

    // Public API.
    controller = {
      // This callback should be trigger when model is loaded.
      modelLoadedCallback: function () {
        // Connect checkbox with model's property if its name is defined.
        if (propertyName !== undefined) {
          // Register listener for 'propertyName'.
          model.addPropertiesListener([propertyName], updateCheckbox);
          // Perform initial checkbox setup.
          updateCheckbox();
        }
        else if (initialValue !== undefined) {
          $checkbox.attr('checked', initialValue);
        }
      },

      // Returns view container. Label tag, as it contains checkbox anyway.
      getViewContainer: function () {
        return $element;
      },

      // Returns serialized component definition.
      serialize: function () {
        var result = $.extend(true, {}, component);

        if (propertyName === undefined) {
          // No property binding. Just action script.
          // Update "initialValue" to represent current
          // value of the slider.
          result.initialValue = $checkbox.is(':checked') ? true : false;
        }

        return result;
      }
    };
    // Return Public API object.
    return controller;
  };
});
