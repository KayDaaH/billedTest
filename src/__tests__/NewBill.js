import "@testing-library/jest-dom";
import { screen, fireEvent, within, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

// Mock the store module
jest.mock("../app/store", () => mockStore);

// Set up a new instance of the NewBill container
const setNewBill = () => {
  return new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });
};

// Selects the expense type in the dropdown
const selectExpenseType = (expenseType) => {
  const dropdown = screen.getByTestId("expense-type");
  const selectedOption = within(dropdown).getByText(expenseType);
  userEvent.selectOptions(dropdown, selectedOption);
  return dropdown;
};

// Returns the expense name element
const getExpenseName = () => screen.getByTestId("expense-name");

// Returns the amount element
const getAmount = () => screen.getByTestId("amount");

// Returns the date element
const getDate = () => screen.getByTestId("datepicker");

// Returns the VAT element
const getVat = () => screen.getByTestId("vat");

// Returns the percentage element
const getPct = () => screen.getByTestId("pct");

// Returns the commentary element
const getCommentary = () => screen.getByTestId("commentary");

// Returns the file element
const getFile = () => screen.getByTestId("file");

// Set up the initial state before all tests
beforeAll(() => {
  // Mock the window.localStorage
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });

  // Set the user information in the local storage
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "a@a",
    })
  );
});

// Set up the test environment before each test
beforeEach(() => {
  // Create a root element for the application
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);

  // Initialize the router
  router();

  // Set the HTML content of the NewBillUI component
  document.body.innerHTML = NewBillUI();

  // Trigger navigation to the NewBill page
  window.onNavigate(ROUTES_PATH.NewBill);
});

// Clean up the test environment after each test
afterEach(() => {
  // Reset all mocks
  jest.resetAllMocks();

  // Clear the HTML content
  document.body.innerHTML = "";
});

// Given I am connected as an employee
describe("Given I am connected as an employee", () => {
  // When I am on the NewBill Page
  describe("When I am on the NewBill Page", () => {
    // Then the newBill icon in vertical layout should be highlighted
    test("Then the newBill icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on the NewBill Page", () => {
    test("Then the newBill icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon).toHaveClass("active-icon");
    });

    describe("When I fill in the fields in the correct format and click on the submit button", () => {
      test("Then the submission process should work properly, and I should be redirected to the Bills Page", async () => {
        // Mock the onNavigate function to update the document body
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Set up a new instance of the NewBill container
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Get the test data for the input fields
        const inputData = bills[0];

        // Get the new bill form element
        const newBillForm = screen.getByTestId("form-new-bill");

        // Mock the handleSubmit function to track its invocation
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

        // Create a mock file for uploading
        const file = new File(["img"], inputData.fileName, {
          type: "image/jpeg",
        });

        // Spy on the handleChangeFile method to track its invocation
        const fileValidation = jest.spyOn(newBill, "handleChangeFile");

        // Fill in the input fields with the test data
        selectExpenseType(inputData.type);
        userEvent.type(getExpenseName(), inputData.name);
        userEvent.type(getAmount(), inputData.amount.toString());
        userEvent.type(getVat(), inputData.vat.toString());
        userEvent.type(getPct(), inputData.pct.toString());
        userEvent.type(getCommentary(), inputData.commentary);
        await userEvent.upload(getFile(), file);

        //---------------------------------------------------------------------------------

        // Ensure that the required input data is valid
        expect(
          selectExpenseType(inputData.type).validity.valueMissing
        ).toBeFalsy();
        expect(getAmount().validity.valueMissing).toBeFalsy();
        expect(getVat().validity.valueMissing).toBeFalsy();
        expect(getVat().validity.valueMissing).toBeFalsy();
        expect(getCommentary().validity.valueMissing).toBeFalsy();
        expect(fileValidation(file)).toBeTruthy();

        // Set the file name in the NewBill instance
        newBill.fileName = file.name;

        // Ensure that the form is submitable
        const submitButton = screen.getByRole("button", {
          innerHTML: "Envoyer",
        });
        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();

        // Submit the form
        newBillForm.addEventListener("submit", handleSubmit);
        expect(submitButton.type).toBe("submit");
        userEvent.click(submitButton);

        expect(handleSubmit).toHaveBeenCalled();

        // Ensure that the user is redirected to the Bills Page
        expect(screen.getByText("Mes notes de frais")).toBeVisible();
      });

      test("Test for broken file", async () => {
        // Mock the onNavigate function to update the document body
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Set up a new instance of the NewBill container
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Get the test data for the input fields
        const inputData = bills[0];

        // Create a mock file with an invalid type
        const file = new File(["img"], inputData.fileName, {
          type: "text/plain",
        });

        // Spy on the handleChangeFile method to track its invocation
        const fileValidation = jest.spyOn(newBill, "handleChangeFile");

        // Upload the invalid file
        await userEvent.upload(getFile(), file);

        // Assert that the file validation fails
        expect(fileValidation(file)).toBeFalsy();

        // Assert that the file input field has the appropriate styling and error message
        const spanErrorElement = screen.getByTestId("span-error-element");
        expect(getFile()).toHaveClass("red-border");
        expect(spanErrorElement).toBeTruthy();
      });

      describe("When an error occurs on the API", () => {
        test("Then a new bill is added to the API but the fetch fails with a '404 page not found' error", async () => {
          const newBill = setNewBill();

          // Mock the create method of the bills store to throw a '404' error
          const mockedBill = jest
            .spyOn(mockStore, "bills")
            .mockImplementationOnce(() => {
              return {
                create: jest.fn().mockRejectedValue(new Error("Erreur 404")),
              };
            });

          // Expect the create method to throw a '404' error
          await expect(mockedBill().create).rejects.toThrow("Erreur 404");

          expect(mockedBill).toHaveBeenCalledTimes(1);

          // Verify that the new bill properties are null
          expect(newBill.billId).toBeNull();
          expect(newBill.fileUrl).toBeNull();
          expect(newBill.fileName).toBeNull();
        });

        test("Then a new bill is added to the API but the fetch fails with a '500 Internal Server Error'", async () => {
          const newBill = setNewBill();

          // Mock the create method of the bills store to throw a '500' error
          const mockedBill = jest
            .spyOn(mockStore, "bills")
            .mockImplementationOnce(() => {
              return {
                create: jest.fn().mockRejectedValue(new Error("Erreur 500")),
              };
            });

          // Expect the create method to throw a '500' error
          await expect(mockedBill().create).rejects.toThrow("Erreur 500");

          expect(mockedBill).toHaveBeenCalledTimes(1);

          // Verify that the new bill properties are null
          expect(newBill.billId).toBeNull();
          expect(newBill.fileUrl).toBeNull();
          expect(newBill.fileName).toBeNull();
        });
      });
    });
  });
});
