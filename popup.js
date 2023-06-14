document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("url-input");

  const add_currentTab_button = document.getElementById("add-currentTab-button");
  const remove_currentTab_button = document.getElementById("remove-currentTab-button");

  const add_textfield_button = document.getElementById("add-textfield-button");
  const remove_textfield_button = document.getElementById("remove-textfield-button");

  const copyButton = document.getElementById("copy-button");
  const urlList = document.getElementById("url-list");

  const copyTextfield = document.getElementById("url-output");

  renderList();

  function renderList() {
    chrome.storage.local.get("URLsetKey", function (result) {
      const URLset = new Set(result.URLsetKey || []);
      urlList.innerHTML = "";
      URLset.forEach(function (url) {
        const listItem = document.createElement("li");
        listItem.textContent = url;
        urlList.appendChild(listItem);
      });
    });
  }

  function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Text copied to clipboard: ', text);
      })
      .catch((error) => {
        console.error('Error copying text to clipboard: ', error);
      });
  }

  add_currentTab_button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "store-currentTab-Url" });
    renderList();
  });

  remove_currentTab_button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "remove-currentTab-Url" });
    renderList();
  });

  add_textfield_button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "store-textfield-Url", url: urlInput.value });
    renderList();
  });

  remove_textfield_button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "remove-textfield-Url", url: urlInput.value });
    renderList();
  });

  copyButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "cpbutton" }, function (response) {
      copyTextToClipboard(response);

    });
  });


  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if ("URLsetKey" in changes) {
      renderList();
    }
  });
});
