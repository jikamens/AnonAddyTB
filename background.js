import { addyApiRequest } from "./api.js";

async function fetchDomanOptions() {
  let domainOptions = await addyApiRequest("GET", "domain-options");
  await messenger.storage.local.set({ domainOptions });
}

async function fetchDomainOptionsAlarm(alarm) {
  if (alarm.name != "domainOptions") return;
  await fetchDomanOptions();
}

messenger.alarms.onAlarm.addListener(fetchDomainOptionsAlarm);
messenger.alarms.create("domainOptions", {
  when: 1,
  periodInMinutes: 60,
});

async function checkForApiKey() {
  let { options } = await messenger.storage.local.get({ options: {} });
  if (!options.apiKey) await messenger.runtime.openOptionsPage();
}

checkForApiKey();

async function storageChangedListener(changes, areaName) {
  if (changes.options) await fetchDomainOptions();
}

messenger.storage.onChanged.addListener(storageChangedListener);
