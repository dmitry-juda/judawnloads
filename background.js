//Пользовательские настройки
if (localStorage.userStore == null) {
    var userStore = {
        rules: [

        ]
    }
    localStorage.userStore = JSON.stringify(userStore);
}


function initFromBackground() {
    ls = JSON.parse(localStorage.userStore);
    let tableStruct = '';
    let dbuttons = [];

    if(ls == null) {
        return tableStruct;
    }

    for (let item in ls.rules) {
        let nowItem = ls.rules[item];
        tableStruct = tableStruct + '<tr><td><button id="deleteItem_' + nowItem.id + '" data=' + nowItem.id + '>-</button>' + nowItem.extension + '</td><td>' + nowItem.url + '</td><td>' + nowItem.folder + '</td></tr>'
        dbuttons.push('deleteItem_' + nowItem.id);
    }

    let ret = [tableStruct,dbuttons];

    return ret;

}

function addRule(ext, url, folder) {
    let newStore = JSON.parse(localStorage.userStore);
    if(newStore == null) {
        newStore = {
            rules: [
            ]
        }
    }
    console.log(newStore);

    if (ext === '' || url === '') {
        return false;
    }

    let newRule = {
        extension: ext,
        url: url,
        folder: folder,
        id: String(Math.random())
    };

    newStore.rules.push(newRule);

    localStorage.userStore = JSON.stringify(newStore)

}


function removeRule(ruleId) {

    console.log(ruleId);

    let newStore = JSON.parse(localStorage.userStore);
    if(newStore == null) {
        return false;
    }

    let rId = String(ruleId).split('_');
    console.log(rId);

    let idInObj = null;

    for(let num in newStore.rules) {
        let rule = newStore.rules[num];
        if(String(rule.id) === rId[1]) {
            idInObj = num;
            break;
        }
    }

    if( idInObj >= 0) {
        newStore.rules.splice(idInObj,1);
    }


    localStorage.userStore = JSON.stringify(newStore)

}


function selectFolderByUser(ext, url, folder) {

    userStore = JSON.parse(localStorage.userStore);

    let newFolder = folder;

    for (let rule in userStore.rules) {
        let thisRule = userStore.rules[rule];
        let urlMatch = url.indexOf(thisRule.url);
        if (!urlMatch > -1 && url === '*') {
            return newFolder;
        }
        if (urlMatch > -1) {
            //есть матч по урл
            let extMatch = thisRule.extension.split(',').includes(ext);
            if (extMatch) {
                newFolder = thisRule.folder + '/';
                return newFolder;
            }
            break;
        } else {
            continue;
        }
    }
    return newFolder;

}

//массивы расширений файлов
const documentExtensions = [
    'txt', 'xls', 'xlsx', 'doc', 'docx', 'docm', 'dot', 'dotx', 'pdf', 'xps', 'rtf', 'xml', 'odt', 'xlsb', 'xlam'
]
const imageExtensions = [
    'png', 'jpg', 'jpeg', 'bmp', 'gif', 'ico', 'tif', 'tiff', 'dib', 'psd'
]

const audioExtensions = [
    'mp3', 'wav', 'ogg', 'aiff', 'ape', 'flac', 'aa', 'aac', 'ac3', 'adx', 'asf', 'au', 'aud', 'dmf', 'dts', 'dxd', 'mmf', 'tta', 'voc', 'vox', 'vqf'
]
const videoExtensions = [
    'avi', 'wmv', 'mov', 'mkv', '3gp', 'flv', 'sfw', 'rm', 'ra', 'ram', 'vob', 'ifo', 'm2v', 'm2p', 'mp4'
]

const applicationExtensions = [
    'exe', 'bat', 'msi'
]

//смотрим майм тип, параллельно сравнивая с расширением, потому что майм тип такое себе
function selectFolderByMime(type, ext) {
    let folder = "";

    if (imageExtensions.includes(ext)) {
        folder = 'images/'
    }
    if (audioExtensions.includes(ext)) {
        folder = 'music/'
    }
    if (documentExtensions.includes(ext)) {
        folder = 'documents/'
    }
    if (videoExtensions.includes(ext)) {
        folder = 'movies/'
    }
    if (applicationExtensions.includes(ext)) {
        folder = 'apps/'
    }

    return folder;
}

chrome.downloads.onDeterminingFilename.addListener(function (item, suggest) {

    let folder = "";
    let fileExt = item.filename.split('.').pop();
    folder = selectFolderByMime(item.mime, fileExt);
    let folderUser = selectFolderByUser(fileExt, item.url, folder);
    folder = folderUser;
    let newFilename = folder + item.filename;
    suggest({filename: newFilename});
    return true;
});


//Обработчики событий script.js

chrome.runtime.onMessage.addListener(
    function (req, sender, response) {
        if (req.type === 'init') {
            let store = initFromBackground();
            response({ok: "ok", info: store});
        }

        if (req.type === 'addRule') {
            addRule(req.info.ext,req.info.url,req.info.folder);
            response({ok: "ok"});
        }

        if (req.type === 'delRule') {
            removeRule(req.info);
            response({ok: "ok"});
        }
    }
);