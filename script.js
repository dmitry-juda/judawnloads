function init() {
    chrome.runtime.sendMessage({type: 'init'}, function (ret) {
        if (!ret) {
            console.log("Error send message " + chrome.runtime.lastError);
            return;
        }
        if (ret.ok == 'ok') {
            store = ret.info[0];
            let table = document.getElementById("tableRules");
            table.innerHTML = "        <tr class=\"rulesHeader\">\n" +
                "            <td width=\"20%\">Файлы с расширением</td>\n" +
                "            <td width=\"40%\">с сайта</td>\n" +
                "            <td width=\"40%\">сохранять</td>\n" +
                "        </tr>";
            table.innerHTML += store;

            createListeners(ret.info[1]);


        }
    });
}

function createListeners(elements) {

    console.log(elements);

    for (let num in elements) {
        let element = elements[num];
        let del = document.getElementById(element);
        console.log('element', element);
        // onClick's logic below:
        del.addEventListener('click', function () {
            chrome.runtime.sendMessage({type: 'delRule', info: element}, function (ret) {
                if (!ret) {
                    console.log("Error send message " + chrome.runtime.lastError);
                    return;
                }
                if (ret.ok == 'ok') {
                    init();
                }

                return true;
            });
        });
    }

}

function addRule() {
    let fileExt = document.getElementById("newRuleExt").value;
    let newRuleUrl = document.getElementById("newRuleUrl").value;
    let newRuleFolder = document.getElementById("newRuleFolder").value;

    if (fileExt === '' || newRuleUrl === '' || newRuleFolder === '') {
        return false;
    }

    let form = {
        ext: fileExt,
        url: newRuleUrl,
        folder: newRuleFolder
    }

    chrome.runtime.sendMessage({type: 'addRule', info: form}, function (ret) {
        if (!ret) {
            console.log("Error send message " + chrome.runtime.lastError);
            return;
        }
        if (ret.ok == 'ok') {
            init();
        }

        return true;

    });
}

document.addEventListener('DOMContentLoaded', function () {
    init();
    let link = document.getElementById('subButton');
    // onClick's logic below:
    link.addEventListener('click', function () {
        addRule();
    });

});

