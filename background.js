async function add_currentTab_Url() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const myTaburl = tab.url.match(/^(https?:\/\/[^/]+)/)[1] + "/";
  chrome.storage.local.get("URLsetKey", function (result) {
    const URLset = new Set(result.URLsetKey || []);
    if (URLset.has(myTaburl)) {
      console.log("URL already saved");
    } else {
      URLset.add(myTaburl);
      chrome.storage.local.set({ URLsetKey: Array.from(URLset) });
    }
  });
}

async function remove_currentTab_Url() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  const myTaburl = tab.url.match(/^(https?:\/\/[^/]+)/)[1] + "/";
  chrome.storage.local.get("URLsetKey", function (result) {
    const URLset = new Set(result.URLsetKey || []);
    if (URLset.has(myTaburl)) {
      URLset.delete(myTaburl);
    } else {
      console.log("URL not in List");
    }
    chrome.storage.local.set({ URLsetKey: Array.from(URLset) });
  });
}

async function add_textfield_Url(url) {
  chrome.storage.local.get("URLsetKey", function (result) {
    const URLset = new Set(result.URLsetKey || []);
    if (URLset.has(url)) {
      console.log("URL already saved");
    } else {
      URLset.add(url);
      chrome.storage.local.set({ URLsetKey: Array.from(URLset) });
    }
  });
}

async function remove_textfield_Url(url) {
  chrome.storage.local.get("URLsetKey", function (result) {
    const URLset = new Set(result.URLsetKey || []);
    if (URLset.has(url)) {
      URLset.delete(url);
    } else {
      console.log("URL not in List");
    }
    chrome.storage.local.set({ URLsetKey: Array.from(URLset) });
  });
}


async function delSet() {
  chrome.storage.local.get("URLsetKey", function (result) {
    const URLset = new Set([]);
    chrome.storage.local.set({ URLsetKey: Array.from(URLset) }, function () {
      console.log("Set has been reset.");
    });
  });
  chrome.storage.local.get("URL_Original", function (result) {
    const URLset = new Map();
    chrome.storage.local.set({ URL_Original: Array.from(URLset) }, function () {
      console.log("Set has been reset.");
    });
  });

}

async function remove_update() {
  chrome.storage.local.get("URLsetKey", function (result) {
    const URLset = new Set(result.URLsetKey || []);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      const url = activeTab.url.match(/^(https?:\/\/[^/]+)/)[1] + "/";
      const id = activeTab.id;
      const full_url = activeTab.url;
      if (URLset.has(url)) {
        if (!URLset.has(full_url)) {
          console.log("save original url");
          chrome.storage.local.get("URL_Original", function (result) {
            const URL_Org = new Map(result.URL_Original || []);
            URL_Org.set(id, full_url);
            console.log("org url saved");
            console.log(URL_Org);
            chrome.storage.local.set({ URL_Original: Array.from(URL_Org) });
            console.log("would remove");
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              func: () => {
                document.title = 'jumpy';
                history.replaceState({}, document.title, '/');
              }
            });
          });
        }
      }
    });
  });
}

chrome.tabs.onUpdated.addListener(function () {
  remove_update();
});

chrome.tabs.onActivated.addListener(function () {
  remove_update();
});





chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "store-currentTab-Url") {
    add_currentTab_Url();
    sendResponse("URL from Current tab saved");
  }
  if (request.action === "remove-currentTab-Url") {
    remove_currentTab_Url();
    sendResponse("URL from Current tab removed");
  }
  if (request.action === "store-textfield-Url") {
    add_textfield_Url(request.url.match(/^(https?:\/\/[^/]+)/)[1] + "/");
    sendResponse("URL from text input added");
  }
  if (request.action === "remove-textfield-Url") {
    remove_textfield_Url(request.url.match(/^(https?:\/\/[^/]+)/)[1] + "/");
    sendResponse("URL from text input removed");
  }
  if (request.action === "cpbutton") {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const activeTab = tabs[0];
      const id = activeTab.id;
      chrome.storage.local.get("URL_Original", function (result) {
        const URL_Org = new Map(result.URL_Original || []);
        response = URL_Org.get(id);
        //console.log(response);
        sendResponse(response);
      });
    });
    return true;
  }
  return true;
});


