import "@testing-library/jest-dom";
import { screen, waitFor, within } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockedStore);

/**
 * Describe block for the test cases related to Bills page when connected as an employee.
 */
describe("Given I am connected as an employee", () => {
  /**
   * Describe block for the test cases related to Bills page.
   */
  describe("When I am on Bills Page", () => {
    /**
     * Test case to verify that the bill icon in the vertical layout is highlighted.
     */
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Mock the local storage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Set the user type as "Employee" in local storage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Create a root element for the page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialize the router
      router();

      // Navigate to the Bills page
      window.onNavigate(ROUTES_PATH.Bills);

      // Wait for the window icon to be visible
      const windowIcon = screen.getByTestId("icon-window");
      await waitFor(() => windowIcon);

      // Expect the window icon to have the "active-icon" class
      expect(windowIcon).toHaveClass("active-icon");
    });

    /**
     * Test case to verify that bills are ordered from earliest to latest.
     */
    test("Then bills should be ordered from earliest to latest", () => {
      // Set up the HTML structure with the bills data
      document.body.innerHTML = BillsUI({
        data: bills,
      });

      // Extract the dates from the bills table rows
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Sort the dates in descending order
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // Expect the dates to be sorted in descending order
      expect(dates).toEqual(datesSorted);
    });

    /**
     * Describe block for the test cases related to actions on the Bills page.
     */
    describe("When I perform actions on the page", () => {
      /**
       * Test case to verify that clicking the "New Bill" button navigates to the New Bill form.
       */
      test("Then I should be sent to the New Bill form", () => {
        // Define the onNavigate function to simulate navigation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Set the user type as "Employee" in local storage
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        // Create an instance of the Bills container
        const bills = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });

        // Set up the HTML structure with the bills data
        document.body.innerHTML = BillsUI({ data: bills });

        // Click the "New Bill" button
        const buttonNewBill = screen.getByTestId("btn-new-bill");
        expect(buttonNewBill).toBeTruthy();
        const handleClickNewBill = jest.fn(bills.handleClickNewBill);
        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill);

        // Expect the handleClickNewBill function to be called
        expect(handleClickNewBill).toHaveBeenCalled();
      });

      /**
       * Test case to verify that clicking the eye icon opens a modal.
       */
      test("Then a modal should open when clicking the eye icon", async () => {
        // Define the onNavigate function to simulate navigation
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Set the user type as "Employee" in local storage
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        // Create an instance of the Bills container
        const billsPage = new Bills({
          document,
          onNavigate,
          store: mockedStore,
          localStorage: window.localStorage,
        });

        // Set up the HTML structure with the bills data
        document.body.innerHTML = BillsUI({ data: bills });

        // Get all the eye icons and attach the event handler
        const iconEyes = screen.getAllByTestId("icon-eye");
        const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

        // Mock the Bootstrap modal show class
        const modale = document.getElementById("modaleFile");
        $.fn.modal = jest.fn(() => modale.classList.add("show"));

        // Click each eye icon and verify the modal
        iconEyes.forEach((iconEye) => {
          iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
          userEvent.click(iconEye);

          // Expect the handleClickIconEye function to be called
          expect(handleClickIconEye).toHaveBeenCalled();

          // Expect the modal to have the "show" class
          expect(modale).toHaveClass("show");
        });
      });

      /**
       * Test case to verify that the loading page is rendered when loading is true.
       */
      test("Then the loading page should be rendered", () => {
        // Render the loading page
        document.body.innerHTML = BillsUI({ loading: true });

        // Expect the "Loading..." text to be visible
        expect(screen.getByText("Loading...")).toBeVisible();
        document.body.innerHTML = "";
      });

      /**
       * Test case to verify that the error page is rendered when there is an error message.
       */
      test("Then the error page should be rendered", () => {
        // Render the error page with an error message
        document.body.innerHTML = BillsUI({ error: "error message" });

        // Expect the "Erreur" text to be visible
        expect(screen.getByText("Erreur")).toBeVisible();
        document.body.innerHTML = "";
      });
    });

    /**
     * Describe block for the integration tests related to fetching bills from the API.
     */
    describe("When I navigate to the Bills page", () => {
      /**
       * Test case to verify fetching bills from the mock API (GET request).
       */
      test("fetches bills from the mock API", async () => {
        // Spy on the bills method of the mocked store
        jest.spyOn(mockedStore, "bills");

        // Set the user type and email in local storage
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );

        // Create the root element and append it to the document body
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);

        // Trigger the router to navigate to the Bills page
        router();
        window.onNavigate(ROUTES_PATH.Bills);

        // Wait for the bills page to be rendered
        await waitFor(() => screen.getByText("Mes notes de frais"));

        // Verify the presence of the "New Bill" button and the bills table rows
        const newBillBtn = await screen.getByTestId("btn-new-bill");
        const billsTableRows = screen.getByTestId("tbody");

        expect(newBillBtn).toBeTruthy();
        expect(billsTableRows).toBeTruthy();

        // Verify that the bills table has the expected number of rows
        expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
      });

      /**
       * Test case to verify error handling when fetching bills returns a 404 error.
       */
      test("handles 404 error when fetching bills", async () => {
        // Mock the bills method of the mocked store to reject with a 404 error
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        // Trigger the router to navigate to the Bills page
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        // Verify that the error message is displayed
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      /**
       * Test case to verify error handling when fetching bills returns a 500 error.
       */
      test("handles 500 error when fetching bills", async () => {
        // Mock the bills method of the mocked store to reject with a 500 error
        mockedStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // Trigger the router to navigate to the Bills page
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        // Verify that the error message is displayed
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
