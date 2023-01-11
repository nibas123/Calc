const calculator = document.querySelector(".calculator");
const keys = calculator.querySelector(".calculator__keys");
const display = calculator.querySelector(".calculator__display");
const smallDisplay = calculator.querySelector(".calculator__smallDisplay")
  .childNodes[0];
const smallOperatorDisplay = calculator.querySelector(
  ".calculator__smallOperatorDisplay"
);

//quick fix...
smallDisplay.textContent = String.fromCharCode(160);

keys.addEventListener("click", (event) => {
  if (!event.target.closest("button"))
    return; /* do nothing if the click is in between the buttons - on the 2px grid-gap, which would otherwise return the whole keys buttons */

  const key = event.target;
  const keyValue = key.textContent;
  const displayValue = display.textContent;
  const displaySmallValue = smallDisplay.textContent;
  const displaySmallOperatorValue = smallOperatorDisplay.textContent;
  const { type } = key.dataset; // for verbose simplicity
  // ^ same as const type = key.dataset.type
  const { previousKeyType } = calculator.dataset;

  // if number key :
  if (type === "number") {
    if (keyValue === ".") {
      if (!display.textContent.includes(".")) {
        if (previousKeyType == "operator") {
          display.textContent = "0.";
        } else {
          if (display.textContent.length < 15) {
            display.textContent = displayValue + keyValue;
          }
        }
      }
    } else {
      if (displayValue === "0") {
        display.textContent = keyValue;
      } else if (
        previousKeyType === "operator" ||
        calculator.dataset.operator === "%"
      ) {
        display.textContent = keyValue;
      } else if (previousKeyType === "equal") {
        display.textContent = keyValue;
        smallDisplay.textContent = "\xA0";
        smallOperatorDisplay.textContent = "\xA0";
      } else {
        if (display.textContent.length < 15) {
          display.textContent = displayValue + keyValue;
        }
      }
    }
  }

  //if operator key:
  if (type === "operator") {
    /*
     * when selecting multiple operators, we want the last one to be the one considered
     */
    // ---------
    // ---------Method 1---------------------------------
    const operatorKeys = keys.querySelectorAll('[data-state="operator"]');
    operatorKeys.forEach((el) => {
      el.dataset.state = "";
    });
    key.dataset.state = "selected";

    // ---------Method 2---------------------------------
    const currentActiveOperator = calculator.querySelector(
      '[data-state="selected"]'
    );
    if (currentActiveOperator) {
      currentActiveOperator.dataset.state = "";
    }
    key.dataset.state = "selected";

    if (smallDisplay.textContent !== String.fromCharCode(160)) {
    }
    calculator.dataset.firstNumber = displayValue;
    calculator.dataset.operator = keyValue;

    updateSmallDisplay(displayValue, keyValue);
  }

  if (type === "expression") {
    const operatorKeys = keys.querySelectorAll('[data-state="expression"]');
    operatorKeys.forEach((el) => {
      el.dataset.state = "";
    });
    key.dataset.state = "selected";

    if (keyValue === "𝑥²") {
      display.textContent = truncateValue(Math.pow(displayValue, 2));

      if (
        smallDisplay.textContent !== String.fromCharCode(160) &&
        previousKeyType !== "equal"
      ) {
        smallDisplay.textContent =
          calculator.dataset.firstNumber +
          " " +
          smallOperatorDisplay.textContent +
          " " +
          "(" +
          displayValue +
          ")" +
          "²";
        smallOperatorDisplay.textContent = " ";
      } else {
        smallDisplay.textContent = "(" + displayValue + ")" + "²";
        smallOperatorDisplay.textContent = "\xA0";
      }
    } else if (keyValue === "√") {
      display.textContent = truncateValue(Math.sqrt(displayValue));

      if (
        smallDisplay.textContent !== String.fromCharCode(160) &&
        previousKeyType !== "equal"
      ) {
        smallDisplay.textContent =
          calculator.dataset.firstNumber +
          " " +
          smallOperatorDisplay.textContent +
          " " +
          "√(" +
          displayValue +
          ")";
        smallOperatorDisplay.textContent = " ";
      } else {
        smallDisplay.textContent = "√(" + displayValue + ")";
        smallOperatorDisplay.textContent = "\xA0";
      }
    } else if (keyValue === "±") {
    } else {
      calculator.dataset.firstNumber = displayValue;
      calculator.dataset.operator = keyValue;

      updateSmallDisplay(displayValue, keyValue);
    }
  }

  if (
    type === "equal" &&
    calculator.dataset.firstNumber &&
    calculator.dataset.operator
  ) {
    //perform calculation
    let firstNumber, operator, secondNumber;
    if (previousKeyType === "equal") {
      firstNumber = displayValue;
      secondNumber = calculator.dataset.secondNumber;
    } else {
      firstNumber = calculator.dataset.firstNumber;
      secondNumber = displayValue;
      calculator.dataset.secondNumber = secondNumber;
    }

    operator = calculator.dataset.operator;

    display.textContent = truncateValue(
      calculate(firstNumber, operator, secondNumber)
    );

    smallDisplay.textContent =
      firstNumber + " " + operator + " " + secondNumber;
    smallOperatorDisplay.textContent = "=";
  }

  if (type === "decimal") {
  }

  if (type === "clear") {
    display.textContent = "0";
  }

  if (type === "clearAll") {
    display.textContent = "0";
    smallDisplay.textContent = "\xA0";
    smallOperatorDisplay.textContent = "\xA0";
    delete calculator.dataset.firstNumber;
    delete calculator.dataset.operator;
  }

  if (type === "back") {
    let val = displayValue;
    if (val.length > 1) {
      display.textContent = displayValue.substring(0, displayValue.length - 1);
    } else {
      display.textContent = "0";
    }
  }

  calculator.dataset.previousKeyType = type;
});

function calculate(firstNumber, operator, secondNumber) {
  firstNumber = parseFloat(firstNumber);
  secondNumber = parseFloat(secondNumber);

  if (operator === "+") return firstNumber + secondNumber;
  if (operator === "-") return firstNumber - secondNumber;
  if (operator === "×") return firstNumber * secondNumber;
  if (operator === "÷") return firstNumber / secondNumber;
  if (operator === "%") return firstNumber % secondNumber;
}

function updateSmallDisplay(firstNumber, operator) {
  smallDisplay.textContent = firstNumber;
  smallOperatorDisplay.textContent = operator;
}

function formatDecimal(value) {
  var valueNum = value;
  valueNum = Math.abs(valueNum);
  var decimal = valueNum - Math.floor(valueNum);
  var length = decimal.toString().length;

  if (length > 2) {
    return valueNum.toFixed(2);
  }
  return value;
}

function truncateValue(value) {
  result = String(value);
  if (result.length < 16) {
    return result;
  } else {
    //truncate the result to fit the display
    return result.substring(0, 15);
  }
}

/* document.querySelector(selector) returns the first Element that matches the specified selector. If none are found the 'null' is returned */

/* event.target returns the target of the click. In this case <button class = "number x">x</button> */
