function saveOptions() {
    chrome.storage.sync.set({
        difficulty: $("#difficulty_select").val()
    }, function() {
        alert("Your settings have been updated");
        document.location.href = "popup.html";
    });
}

function loadOptions() {
    chrome.storage.sync.get("difficulty", function (settings) {
        // If the difficulty is not yet set, set it to easy
        if (!settings.difficulty) {
            chrome.storage.sync.set({
                difficulty: "difficult"
            });
            settings.difficulty = "difficult";
        }
        $("#difficulty_select").val(settings.difficulty);
    });
}

// Run on eval
loadOptions();
$("#options_save").on('click', saveOptions);