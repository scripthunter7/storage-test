const button = document.querySelector("#increment");
const counter = document.querySelector("#counter");

const counterCallback = (response) => {
    console.log(response);
    const parsedCount = parseInt(response?.count);
    console.log(response);
    if (isNaN(parsedCount)) {
        counter.innerText = "N/A";
        return;
    }
    counter.innerText = parsedCount;
};

button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "incrementCount" }, counterCallback);
});

chrome.runtime.sendMessage({ type: "getCount" }, counterCallback);
