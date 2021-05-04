document.addEventListener('DOMContentLoaded', function() {

    var firebaseConfig = {
        apiKey: "AIzaSyA59QN0vK-KyfbG6VkhIAXz_mURkUNq3hs",
        authDomain: "postgiven.firebaseapp.com",
        projectId: "postgiven",
        storageBucket: "postgiven.appspot.com",
        messagingSenderId: "191837822359",
        appId: "1:191837822359:web:6bdc553b948f00cef038d2"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

    chrome.storage.local.get('userCode', function(item){
        let userCode = null;
        if (item.userCode != '' && item.userCode) {
            userCode = item.userCode
        }

        document.getElementById("userCode").value = userCode;
    
        chrome.storage.local.get('userrules', function(item){
            let rules = []
            console.log(item)
            console.log(1, item["userrules"])
            if (item.userrules != '' &&  item["userrules"]) {
                const manifest = JSON.parse(item.userrules);
                console.log(typeof manifest)
                console.log(Object.values(manifest))
                rules = manifest["rules"];
                console.log(rules)
            }

            const rulesContainer = document.getElementById("rulesContainer");
            populateRules();

            function populateRules() {
                rulesContainer.innerHTML = '';
                rules.forEach((rule, index) => {

                    rulesContainer.innerHTML += `
                    <form class="form">
                        <input id="ruleDomain${index}" class="no-exp" type="text" value="${rule.domain}">
                        <input id="ruleRedirect${index}" class="no-exp" type="text" style="margin-left: 12px;" value="${rule.redirectUrl}">
                        <div id="ruleCancel${index}" class="cancel">x</div>
                    </form>
                    `
                    
                });

                rules.forEach((rule, index) => {
                    document.getElementById(`ruleCancel${index}`).addEventListener("click", function(e) {
                        e.preventDefault();
                        removeRule(index)
                    })
                })
            }

            document.getElementById("switcher").addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById("page1").classList.add('wrapper-gone');
                document.getElementById("page2").classList.remove('wrapper-gone');
            });

            document.getElementById("switcherback").addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById("page2").classList.add('wrapper-gone');
                document.getElementById("page1").classList.remove('wrapper-gone');
            });

            document.getElementById("addRule").addEventListener('click', function(e) {
                e.preventDefault();
                rules.push({
                    domain: 'rule url',
                    redirect: 'redirect url'
                });
                rulesContainer.innerHTML += `
                    <form class="form">
                        <input id="ruleDomain${rules.length-1}" class="no-exp" type="text" value='rule url'>
                        <input id="ruleRedirect${rules.length-1}" class="no-exp" type="text" style="margin-left: 12px;" value='redirect url'>
                        <div id="ruleCancel${rules.length-1}" class="cancel">x</div>
                    </form>
                `

                // document.getElementById(`ruleCancel${rules.length-1}`).addEventListener("click", removeRule(rules.length-1))
                document.getElementById(`ruleCancel${rules.length-1}`).addEventListener("click", function(e) {
                    e.preventDefault();
                    removeRule(rules.length-1)
                })
            })

            document.getElementById("saveRule").addEventListener("click", function(e) {
                e.preventDefault();
                const newRules = [];
                rules.forEach((rule, index) => {
                    const domain = document.getElementById(`ruleDomain${index}`).value
                    const redirectUrl = document.getElementById(`ruleRedirect${index}`).value
                    newRules.push({
                        domain, 
                        redirectUrl
                    })
                })


                db.collection("rules")
                .doc(userCode)
                .update({rules: JSON.stringify({rules: newRules})})
                .then(() => {
                    chrome.storage.local.set({ 
                        "userrules": JSON.stringify({
                            rules: newRules
                        })
                    },  function(){
                            alert("Rules Updated")
                        }
                    );
                })
                .catch(e => alert("Error updating rules"))
            })

            document.getElementById('generateCode').addEventListener('click', function(e) {
                e.preventDefault();
                db.collection("rules").add({
                    rules: "{'rules': []}",
                })
                .then((docRef) => {    
                    chrome.storage.local.set({ 
                        "userCode": docRef.id                    
                    },  function(){
                            alert("New Code Generated", docRef.id);
                            userCode = docRef.id
                        }
                    );
                });
            });

            document.getElementById('submitCode').addEventListener('click', function(e) {
                e.preventDefault();
                const enterCode = document.getElementById('enterCode').value;
                if (!enterCode || enterCode == '') {
                    alert('Code Required');
                    return;
                }
                db.collection('rules').doc(enterCode).get()
                .then((docRef) => {
                    const data = docRef.data()
                    chrome.storage.local.set({ 
                        "rules": JSON.stringify({
                            rules: data.rules
                        })
                    },  function(){
                            alert("Rules have been updated, restart your browser");
                        }
                    );
                })
                .catch((err) => alert('Error retriving rules'))
            })

            function removeRule(index) {
                rules.splice(index, 1)
                populateRules();
                
            }


        });
    });

    
});
