// Started from https://stackoverflow.com/a/48969580, with some changes.
async function asyncXMLHttpRequest(method, url, headers, type, body) {
  return new Promise(function (resolve, reject) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    if (type) {
      xhr.responseType = type;
    }
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.response);
      } else {
        reject({
          status: this.status,
          statusText: this.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: this.statusText,
      });
    };
    xhr.send(body ? body : "");
  });
}

export async function addyApiRequest(method, endpoint, params, body) {
  let { options } = await messenger.storage.local.get({ options: {} });
  let hostUrl = options.hostUrl || "https://app.addy.io";
  let apiKey = options.apiKey;
  if (!apiKey) {
    throw new Error("No API key configured in AnonAddyTB preferences.");
  }
  let url = new URL(`${hostUrl}/api/v1/${endpoint}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  let headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let response = await asyncXMLHttpRequest(
    method,
    url,
    headers,
    "json",
    JSON.stringify(body),
  );
  return response;
}
