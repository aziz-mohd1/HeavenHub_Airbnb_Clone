const form = document.getElementById("form");
const fields = {
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  image: document.getElementById("image"),
  price: document.getElementById("price"),
  country: document.getElementById("country"),
  location: document.getElementById("location"),
  // rating: document.getElementById("rating"), // Added for review form
  comment: document.getElementById("comment"), // Added for review form

  username: document.getElementById("username"), // Added for signUp form
  email: document.getElementById("email"), // Added for signUp form
  password: document.getElementById("password"), // Added for signUp form
};

// Attach blur event listener to each field
Object.values(fields).forEach((field) => {
  if (field) {
    field.addEventListener("blur", () => validateElement(field)); // Validate on blur
  }
});

/*
Object.values(<objectName>) is a method that returns an array of the values of an object’s properties.

When you call Object.values(fields), it will return an array containing the DOM elements (i.e., the elements obtained by document.getElementById()), like this:

[
  <input id="title">,
  <textarea id="description">,
  <input id="price">,
  <input id="country">,
  <input id="location">,
  <input id="rating">,
  <textarea id="comment">
]
So, Object.values(fields) converts the object into an array containing only the values (in this case, the DOM elements) without their corresponding keys. This is useful when you want to iterate over the values of an object, like running a validation on each form field.

*/

// Handle form submit
if(form != null){
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (checkInputs()) {
      // If all fields are valid, submit the form
      form.submit();
    }
  });
}

// Capitalize first letter of field name for error messages
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Validate individual field
function validateElement(element) {
  let value = element.value.trim();

  // Sanitize the description field -> this problem i got working with edit.ejs form where it was showing correct every where in UI but in Database(mongo) it was adding unwanted new lines, spaces etc...
  /*
        /\s+/g is a regular expression (regex) used to match one or more whitespace characters in a string, and ' ' is the replacement for those matched characters. Here's a breakdown:

        /.../: Delimits the regular expression.
        \s: A shorthand for matching any whitespace character, including spaces, tabs, and newlines.
        +: Means "one or more of the preceding character." So, \s+ matches one or more consecutive whitespace characters.
        g: Stands for "global," meaning the expression will match and replace all occurrences in the string, not just the first one.
        ' ' (single space): This is what the matched whitespaces will be replaced with — a single space character.
        Example:
        let str = "This   is  a  test   string.";
        let cleanedStr = str.replace(/\s+/g, ' ');

        console.log(cleanedStr);  // Output: "This is a test string."
        In this example:

        Original string: "This is a test string." has multiple spaces between the words.
        The regex \s+ finds sequences of multiple spaces and replaces them with a single space.
        Resulting string: "This is a test string."
    */
  if (element.id === "description" || element.id === "comment") {
    value = value.replace(/\s+/g, " ").trim(); // Remove extra spaces and newlines
    element.value = value; // Set the sanitized value back to the textarea
  }
  // Check if the field is the 'price' field and validate its value
  if (element.id === "price") {
    if (value === "") {
      setStatus(element, "Price cannot be blank", false);
      return false; // Validation failed
    } else if (isNaN(value) || value <= 0) {
      setStatus(element, "Enter a valid price", false); // Custom message for invalid price
      return false; // Validation failed
    } else {
      setStatus(element, "", true);
      return true; // Validation succeeded
    }
  }

  // Validate rating field (for review form)
  // if (element.id === "rating") {
  //   if (value < 1 || value > 5) {
  //     setStatus(element, "Rating must be between 1 and 5", false);
  //     return false; // Validation failed
  //   } else {
  //     setStatus(element, "", true);
  //     return true; // Validation succeeded
  //   }
  // }

  // General validation for other fields
  if (value === "") {
    setStatus(
      element,
      `${capitalizeFirstLetter(element.id)} cannot be blank`,
      false
    );
    return false; // Validation failed
  } else {
    setStatus(element, "", true);
    return true; // Validation succeeded
  }
}

// Check all inputs in the form
function checkInputs() {
  let isValid = true; // Assume form is valid initially
  Object.values(fields).forEach((field) => {
    if (field) {
      const valid = validateElement(field);
      if (!valid) isValid = false; // If any field is invalid, set isValid to false
    }
  });
  return isValid; // Return the overall validity
}

// Set error or success status for a field
function setStatus(element, message, isValid) {
  const formControl = element.parentElement;
  const errorIcon = formControl.querySelector(".error");
  const successIcon = formControl.querySelector(".success");
  const errorMsg = formControl.querySelector(".errorMsg");

  element.style.borderColor = isValid ? "green" : "red";
  successIcon.classList.toggle("hidden", !isValid);
  errorIcon.classList.toggle("hidden", isValid);
  errorMsg.classList.toggle("hidden", isValid);
  if (!isValid) errorMsg.innerText = message;
}
