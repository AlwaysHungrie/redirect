chrome.storage.local.get('rules', function(item){
    console.log(item)
    if (item.rules == '' || !item.rules) return
    const manifest = JSON.parse(JSON.parse(item.rules).rules);
    console.log(manifest);
    const rules = manifest["rules"];
    console.log(rules);
    chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
            const rule = rules.find(rule => details.url === rule.domain)
            if (rule) {
                return {
                    redirectUrl: rule.redirectUrl
                };
            } else {
                return {
                    cancel: false
                }
            }
        },
        {urls: ["<all_urls>"]},
        ["blocking"]
    );
});



