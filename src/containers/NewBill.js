import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

let fileTypeIsGood;

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    if (e instanceof Event) {
      e.preventDefault();
    }
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];
    const fileName = file.name;
    // const filePath = e.target.value.split(/\\/g);
    // const fileName = filePath[filePath.length - 1];
    // const fileExtension = fileName.split(".").pop().toLowerCase();

    const fileTypes = ["image/jpeg", "image/jpg", "image/png"];
    const fileType = file.type;

    const errorVerification = document.getElementById("span-error-element");

    if (!fileTypes.includes(fileType)) {
      fileInput.classList.remove("blue-border");
      fileInput.classList.add("red-border");
      fileTypeIsGood = false;
      if (!errorVerification) {
        const spanErrorElement = document.createElement("span");
        spanErrorElement.setAttribute("id", "span-error-element");
        spanErrorElement.setAttribute("data-testid", "span-error-element");
        fileInput.parentNode.appendChild(spanErrorElement);
        spanErrorElement.textContent =
          "Le fichier sélectionné doit être au format jpeg, jpg ou png";
        spanErrorElement.style.fontSize = "11px";
        spanErrorElement.style.paddingLeft = "6px";
      }
      return false;
    } else {
      fileInput.classList.remove("red-border");
      fileInput.classList.add("blue-border");
      fileTypeIsGood = true;
      if (errorVerification) {
        errorVerification.remove();
      }
    }

    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
      })
      .catch((error) => console.error(error));
    return true;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (!fileTypeIsGood) {
      return;
    }
    // console.log(
    //   'e.target.querySelector(`input[data-testid="datepicker"]`).value',
    //   e.target.querySelector(`input[data-testid="datepicker"]`).value
    // );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
