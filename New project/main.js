const serviceSelectButtons = document.querySelectorAll(".service-select");
const copyButtons = document.querySelectorAll(".copy-button");
const orderForm = document.querySelector("#order-form");
const copyOrderButton = document.querySelector("#copy-order");

const serviceField = document.querySelector("#service");
const packageField = document.querySelector("#package");
const coinField = document.querySelector("#coin");
const contactField = document.querySelector("#contact");
const detailsField = document.querySelector("#details");

const estimateElement = document.querySelector("#estimate");
const paymentNoteElement = document.querySelector("#payment-note");
const summaryOutputElement = document.querySelector("#summary-output");

updateEstimate();

serviceSelectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    serviceField.value = button.dataset.service;
    syncBasePrice(button.dataset.price);
    updateEstimate();
    document.querySelector("#order").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) {
      return;
    }

    const originalLabel = button.textContent;

    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      button.textContent = "Copied";
      button.classList.add("copied");
    } catch (_error) {
      button.textContent = "Copy failed";
    }

    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.classList.remove("copied");
    }, 1400);
  });
});

[serviceField, packageField, coinField].forEach((field) => {
  field.addEventListener("change", () => {
    syncBasePrice();
    updateEstimate();
  });
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  summaryOutputElement.textContent = buildSummary();
});

copyOrderButton.addEventListener("click", async () => {
  const summary = buildSummary();
  summaryOutputElement.textContent = summary;

  try {
    await navigator.clipboard.writeText(summary);
    copyOrderButton.textContent = "Copied";
    copyOrderButton.classList.add("copied");
  } catch (_error) {
    copyOrderButton.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    copyOrderButton.textContent = "Copy Summary";
    copyOrderButton.classList.remove("copied");
  }, 1400);
});

function syncBasePrice(forcedPrice) {
  const matchingCardButton = [...serviceSelectButtons].find((button) => button.dataset.service === serviceField.value);
  const basePrice = forcedPrice || matchingCardButton?.dataset.price || "10";

  [...serviceField.options].forEach((option) => {
    if (option.value === serviceField.value) {
      option.dataset.price = basePrice;
    }
  });
}

function updateEstimate() {
  const price = calculateEstimate();
  const coin = coinField.value;
  estimateElement.textContent = `$${price}`;
  paymentNoteElement.textContent = `Buyer selected ${coin}. Crypto amount can be quoted manually at checkout.`;
}

function calculateEstimate() {
  const selectedServiceOption = serviceField.options[serviceField.selectedIndex];
  const selectedPackageOption = packageField.options[packageField.selectedIndex];
  const basePrice = Number(selectedServiceOption.dataset.price || 10);
  const multiplier = Number(selectedPackageOption.dataset.multiplier || 1);
  return basePrice * multiplier;
}

function buildSummary() {
  const estimate = calculateEstimate();
  const service = serviceField.value;
  const packageName = packageField.value;
  const coin = coinField.value;
  const contact = contactField.value.trim() || "Not provided";
  const details = detailsField.value.trim() || "No extra details provided.";

  return [
    "BloxTrade Order Request",
    `Service: ${service}`,
    `Package: ${packageName}`,
    `Estimated Price: $${estimate}`,
    `Payment Coin: ${coin}`,
    `Contact: ${contact}`,
    `Details: ${details}`,
    "Next Step: Send payment, then message me with your transaction hash.",
  ].join("\n");
}
