const gate = document.querySelector("[data-version-gate]");
const documentMain = document.querySelector("[data-doc-main]");
const versionButtons = document.querySelectorAll("[data-doc-version]");
const versionPanels = document.querySelectorAll("[data-versions]");
const versionLabels = document.querySelectorAll("[data-current-version]");
const changeButtons = document.querySelectorAll("[data-change-version]");

const showGate = () => {
  gate.hidden = false;
  documentMain.inert = true;
  document.body.classList.add("is-locked");
  gate.querySelector("button")?.focus();
};

const selectVersion = (button) => {
  const version = button.dataset.docVersion;
  const label = button.dataset.versionLabel;
  versionPanels.forEach((panel) => {
    const versions = panel.dataset.versions.split(" ");
    panel.hidden = !versions.includes(version);
  });
  versionLabels.forEach((node) => {
    node.textContent = label;
  });
  gate.hidden = true;
  documentMain.inert = false;
  document.body.classList.remove("is-locked");
  document.querySelector("h1")?.focus({ preventScroll: true });
};

versionButtons.forEach((button) => {
  button.addEventListener("click", () => selectVersion(button));
});

changeButtons.forEach((button) => {
  button.addEventListener("click", showGate);
});

const requestedVersion = new URLSearchParams(window.location.search).get("version");
const requestedButton = [...versionButtons].find((button) => button.dataset.docVersion === requestedVersion);

if (requestedButton) {
  selectVersion(requestedButton);
} else {
  showGate();
}
