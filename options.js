function saveOptions() {
    chrome.storage.sync.set({
        difficulty: $("#difficulty_select").value
    });
}

$('save').addEventListener('click',
    saveOptions);