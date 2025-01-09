function error(msg) {
  document.getElementById("errors").innerHTML = msg;
}

function check(fix) {
  let msg = [];

  let hostUrl = document.getElementById("hostUrl").value;
  if (
    hostUrl &&
    !(hostUrl.startsWith("http://") || hostUrl.startsWith("https://"))
  ) {
    msg.push('Addy URL must start with "http://" or "https://".');
  }
  if (fix) {
    let newUrl = hostUrl.replace(/\/+$/, "");
    if (newUrl != hostUrl) {
      document.getElementById("hostUrl").value = newUrl;
    }
  }

  if (!document.getElementById("apiKey").value) {
    msg.push("API key must be specified.");
  }
  error(msg.join("<br/>"));
  return msg.length == 0;
}

async function changeListener(event) {
  let { options } = await messenger.storage.local.get({ options: {} });
  let hostUrl = document.getElementById("hostUrl").value || null;
  let apiKey = document.getElementById("apiKey").value || null;
  let resetDisabled =
    (options.hostUrl || null) == hostUrl && (options.apiKey || null) == apiKey;
  document.getElementById("saveButton").disabled = !check() || resetDisabled;
  document.getElementById("resetButton").disabled = resetDisabled;
}

async function saveButtonListener(event) {
  if (!check(true)) {
    return;
  }
  let hostUrl = document.getElementById("hostUrl").value;
  let apiKey = document.getElementById("apiKey").value;
  if (hostUrl) {
    let granted;
    try {
      granted = await messenger.permissions.request({
        origins: [`${hostUrl}/`],
      });
    } catch {
      granted = false;
    }
    if (!granted) {
      error(`Failed to obtain permission to access ${hostUrl}.`);
      return;
    }
  }
  await messenger.storage.local.set({ options: { hostUrl, apiKey } });
  reload();
  await changeListener();
}

async function resetButtonListener(event) {
  await reload();
  await changeListener();
}

async function reload() {
  let { options } = await messenger.storage.local.get({ options: {} });
  document.getElementById("hostUrl").value = options.hostUrl || "";
  document.getElementById("apiKey").value = options.apiKey || "";
  check();
}

async function load() {
  document.getElementById("hostUrl").addEventListener("input", changeListener);
  document.getElementById("apiKey").addEventListener("input", changeListener);
  document
    .getElementById("saveButton")
    .addEventListener("click", saveButtonListener);
  document
    .getElementById("resetButton")
    .addEventListener("click", resetButtonListener);
  await reload();
}

window.addEventListener("load", load, false);
