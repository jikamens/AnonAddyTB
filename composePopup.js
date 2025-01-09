import { addyApiRequest } from "./api.js";

function escapeHTML(str) {
  return new Option(str).innerHTML;
}

function deployContent(content) {
  let body = document.getElementById("main");
  body.innerHTML = content;
}

function closeButtonContent(label) {
  if (!label) {
    label = "Close";
  }
  return `<button id='closeButton'>${label}</button>`;
}

function closeButtonAddListener() {
  document.getElementById("closeButton").addEventListener("click", () => {
    window.close();
  });
}

async function fixRecipients(recipients, mappings) {
  let newRecipients = [];
  for (let recipient of recipients) {
    let parsed = await parseRecipient(recipient);
    let addyAddress = mappings[parsed.address];
    if (!addyAddress) {
      newRecipients.push(recipient);
      continue;
    }
    let match = addyAddress.match(/(.*)(@.*)/);
    let addy1 = match[1];
    let addy2 = match[2];
    let forwardingAddress = `${addy1}+${parsed.localPart}=${parsed.domain}${addy2}`;
    if (parsed.name) {
      newRecipients.push(`${parsed.name} <${forwardingAddress}>`);
    } else {
      newRecipients.push(forwardingAddress);
    }
  }
  return newRecipients;
}

async function executeButtonListener() {
  let mappings = {};
  for (let box of document.querySelectorAll("input:checked")) {
    mappings[box.name] = box.value;
  }
  if (Object.keys(mappings).length == 0) {
    window.close();
    return;
  }
  let tab = await messenger.tabs.getCurrent();
  let details = await messenger.compose.getComposeDetails(tab.id);
  let newDetails = {};
  newDetails.to = await fixRecipients(details.to, mappings);
  newDetails.cc = await fixRecipients(details.cc, mappings);
  newDetails.bcc = await fixRecipients(details.bcc, mappings);
  messenger.compose.setComposeDetails(tab.id, newDetails);
  window.close();
}

async function createButtonListener(event) {
  let button = event.target;
  let address = button.value;
  let defaults = (
    await messenger.storage.local.get({ domainOptions: { data: [] } })
  ).domainOptions;
  let domain = defaults.defaultAliasDomain;
  let body = {
    domain: domain,
    description: `Created by AnonAddyTB for sending to ${address}`,
  };
  await addyApiRequest("POST", "aliases", null, body);
  await load();
}

function noRecipientsMessage() {
  deployContent(
    `<p>There are no recipients to modify.</p><p>${closeButtonContent()}</p>`,
  );
  closeButtonAddListener();
}

// Input: recipient object from compose details
// Returns: null if unparseable, else {address, localPart, domain, name}
async function parseRecipient(recipient) {
  let parsed = (
    await messenger.messengerUtilities.parseMailboxString(recipient)
  )[0];
  let match = parsed.email.match(/(.*)@(.*)/);
  if (!match) {
    return null;
  }
  let localPart = match[1];
  let domain = match[2].toLowerCase();
  let address = `${localPart}@${domain}`;
  // We use email addresses as part of element identifiers in HTML code, so
  // we don't want to deal with them having quotation marks in them.
  if (address.includes('"')) {
    console.log(
      `AnonAddyTB: Ignoring address ${address} containing quotation mark`,
    );
    return null;
  }
  let name = parsed.name;
  return { address, localPart, domain, name };
}

// Takes a recipient email address and a list of zero or more address objects
// (with address and description keys) and determines what options should be
// presented to the user.
//
// Input: address string, array objects
// Output: {checked, options}
//   checked -- the first listed option should be checked by default
//   options -- array of zero or more address objects
//
// The list of other addresses is truncated to 10.
function addressOptions(recipientAddress, domainAddresses) {
  // Don't modify the original
  domainAddresses = [...domainAddresses];
  if (domainAddresses.length == 0) {
    return { checked: false, options: [] };
  }
  if (domainAddresses.length == 1) {
    return { checked: true, options: domainAddresses };
  }
  let defaultAddress = null;
  let checked = false;
  let nextMatchTo = 0;
  for (let i of domainAddresses.keys()) {
    if (domainAddresses[i].address.toLowerCase().includes(recipientAddress)) {
      domainAddresses.splice(nextMatchTo++, 0, domainAddresses.splice(i, 1)[0]);
      checked = true;
    }
  }
  domainAddresses.splice(10);
  return { checked, options: domainAddresses };
}

function fixCheckboxes(event) {
  let changedElt = event.target;
  if (!changedElt.checked) {
    return;
  }
  let container = changedElt.parentElement;
  for (let child of container.querySelectorAll("input[type='checkbox']")) {
    if (child.checked && child.id != changedElt.id) {
      child.checked = false;
    }
  }
}

async function load() {
  deployContent("Please wait&#8230;");
  // Get message recipients.
  let tab = await messenger.tabs.getCurrent();
  let details = await messenger.compose.getComposeDetails(tab.id);
  let recipients = details.to.concat(details.cc, details.bcc);
  if (recipients.length == 0) {
    return noRecipientsMessage();
  }
  // Figure out unique email domains of all recipients, filtering out Addy
  // domains.
  let addyDomains = (
    await messenger.storage.local.get({ domainOptions: { data: [] } })
  ).domainOptions.data;
  let domains = {};
  let addresses = {};
  for (let recipient of recipients) {
    let addressObj = await parseRecipient(recipient);
    if (!addressObj.localPart) {
      continue;
    }
    if (addyDomains.indexOf(addressObj.domain) > -1) {
      continue;
    }
    domains[addressObj.domain] = [];
    if (!addresses[addressObj.address] || addressObj.name) {
      addresses[addressObj.address] = addressObj;
    }
  }
  if (Object.keys(domains).length == 0) {
    noRecipientsMessage();
  }
  // Search AnonAddy for the domains.
  for (let domain of Object.keys(domains)) {
    let params = {
      "filter[active]": "true",
      "filter[search]": domain,
    };
    let response = await addyApiRequest("GET", "aliases", params);
    for (let alias of response.data) {
      domains[domain].push({
        address: alias.email,
        description: alias.description,
      });
    }
  }
  // Build dynamic HTML with checkboxes allowing user to select which
  // AnonAddy addresses to use, with submit button.
  let content = "";
  let replaceable = false;
  for (let addressObj of Object.values(addresses)) {
    let address = addressObj.address;
    let name = addressObj.name;
    let options = addressOptions(address, domains[addressObj.domain]);

    content += "<p>Replace <strong>";
    if (name) {
      content += escapeHTML(name + " <");
    }
    content += escapeHTML(address);
    if (name) {
      content += escapeHTML(">");
    }
    content += "</strong> with:</p>";

    content += "<blockquote>";

    if (options.options.length == 0) {
      content += "<em>No available replacements.</em>";
    } else {
      replaceable = true;

      content += `<div id="choices[${address}]">`;
      for (let i of options.options.keys()) {
        let option = options.options[i];
        let checked = options.checked && i == 0 ? " checked" : "";
        let boxId = `choice${i}[${address}]`;
        content += `<input id="${boxId}" name="${address}" type="checkbox"${checked} value="${option.address}"/>`;
        content +=
          `<label for="${boxId}">` +
          escapeHTML(option.address) +
          " (" +
          escapeHTML(option.description) +
          ")</label><br/>";
      }
      content += "</div>";
    }
    content += `<p><button id="create[${address}]" value="${address}">Create new alias</button></p>`;
    content += "</blockquote>";
  }
  if (!replaceable) {
    content += "<p>" + closeButtonContent() + "</p>";
  } else {
    content +=
      "<p>" +
      closeButtonContent("Cancel") +
      "<button id='executeButton'>Do it</button>" +
      "</p>";
  }
  deployContent(content);
  closeButtonAddListener();
  if (replaceable) {
    document
      .getElementById("executeButton")
      .addEventListener("click", executeButtonListener, false);
  }
  for (let elt of document.querySelectorAll("input[type='checkbox']")) {
    elt.addEventListener("change", fixCheckboxes, false);
  }
  for (let elt of document.querySelectorAll("button[id^=create]")) {
    elt.addEventListener("click", createButtonListener, false);
  }
}

window.addEventListener("load", load, false);
