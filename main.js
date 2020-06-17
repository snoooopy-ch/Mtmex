const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const fs = require('fs');
const encoding = require('encoding-japanese');

let win;
let num = 0;
let ids = [];
let resList = [];
let sreTitle = '';
let settingPath = 'Setting.ini';
let stateComments = ['#datパス','#指定したdatパス','#チェックボックス','#文字色','#注意レス', '#非表示レス', '#名前欄の置換',
  '#投稿日・IDの置換','#注目レスの閾値', '#ボタンの色'];
let curComment='';
let yesNoKeys = ['shuturyoku','sentaku_idou1','sentaku_idou2','res_menu'];
const onOffKeys = ['AutoSave'];
let settings;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1223,
    height: 948,
    minWidth: 1223,
    title: 'スレ編集',
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,
    webPreferences: {
      nodeIntegration: true
    }
  });


  win.loadURL(`file://${__dirname}/dist/Mtmex/index.html`);

  //// uncomment below to open the DevTools.
  win.webContents.openDevTools();

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  });

  let handleRedirect = (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    }
  };

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)
  win.setMenu(null)
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
});

/**
 * Load res list from a file
 * @param url: a file path
 * @param isResSort
 * @param isMultiAnchor
 * @param isReplaceRes
 */
function getResList(url, isResSort, isMultiAnchor, isReplaceRes) {
  if (url === '') {
    dialog.showErrorBox('読み込み', 'ファイルパスを入力してください。');
    return;
  }

  fs.open(url, 'r', (err, fd) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(url + ' does not exist');
        dialog.showErrorBox('読み込み', 'ファイルが存在しません。');
        return;
      }
      dialog.showErrorBox('読み込み', 'ファイルを読めません。');
      return;
    }
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });

  let input = fs.createReadStream(url,);
  let remaining = '';

  ids = [];
  resList = [];
  num = 0;
  input.on('data', function (data) {
    let encoded_data = encoding.convert(data, {
      from: 'SJIS',
      to: 'UNICODE',
      type: 'string',
    });
    remaining += encoded_data;
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      let line = remaining.substring(last, index);
      last = index + 1;
      if(line.length > 1)
        resList.push(readLines(line));
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function () {
    if (remaining.length > 0) {
      resList.push(readLines(remaining));
    }
    adjustResList(isResSort, isMultiAnchor, isReplaceRes);
    win.webContents.send("getResResponse", {resList: resList, sreTitle: sreTitle});
  });
}

ipcMain.on("loadRes", (event, url, isResSort, isMultiAnchor, isReplaceRes) => {
  getResList(url, isResSort, isMultiAnchor, isReplaceRes);
});


/**
 * Adjust the res list by user selection
 * @param isResSort
 * @param isMultiAnchor
 * @param isReplaceRes
 */
function adjustResList(isResSort, isMultiAnchor, isReplaceRes) {
  for (let idItem of ids) {
    let idNum = 0;
    for (let i = 0; i < resList.length; i++) {
      if (idItem.id === resList[i].id) {
        idNum++;
        resList[i].idTotal = idItem.totalCount;
        resList[i].idNum = idNum;
      }
    }
  }
  for (let resItem of resList) {
    for (let anchor of resItem.anchors) {
      for (let i = 0; i < resList.length; i++) {
        if (resList[i].num === anchor) {
          resList[i].anchorCount++;
        }
      }
    }
  }

  let tmpResList = [];
  if (isResSort || isReplaceRes) {
    for (let i = 0; i < resList.length; i++) {
      if (resList[i].anchors.length > 0) {
        if (!isReplaceRes && resList[i].anchors.indexOf(1) !== -1) {
          continue;
        }
        tmpResList.push(resList[i]);
        resList.splice(i, 1);
        i--;
      }
    }

    // tmpResList.reverse();
    for (let resItem of tmpResList) {
      for (let anchor of resItem.anchors) {
        for (let i = 0; i < resList.length; i++) {
          if (resList[i].num === anchor) {
            if (isReplaceRes) {
              if (isMultiAnchor) {
                addAnchorRes(i + 1, resItem, anchor, isMultiAnchor);
                resItem.isAdded = true;
              } else {
                if (!resItem.isAdded) {
                  addAnchorRes(i + 1, resItem, anchor, isMultiAnchor);
                  // resList.splice(i + 1, 0, resItem);
                  resItem.isAdded = true;
                }
              }
            } else {
              if (resList[i].num !== 1) {
                if (isMultiAnchor) {
                  addAnchorRes(i + 1, resItem, anchor, isMultiAnchor);
                  // resList.splice(i + 1, 0, resItem);
                  resItem.isAdded = true;
                } else {
                  if (!resItem.isAdded) {
                    addAnchorRes(i + 1, resItem, anchor, isMultiAnchor);
                    // resList.splice(i + 1, 0, resItem);
                    resItem.isAdded = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Analytic and add res anchor
 * @param index
 * @param item
 * @param anchor
 * @param isMultiAnchor
 */
function addAnchorRes(index, item, anchor, isMultiAnchor) {
  let i = index;
  let parentAnchors = [];
  while (true) {
    if (resList.length - 2 < i)
      break;
    if (resList[i].anchors.indexOf(anchor) !== -1) {
      parentAnchors.push(resList[i].num);
      i++;
      continue;
    }
    let exists = false;
    for (let parentAnchor of parentAnchors) {
      if (resList[i].anchors.indexOf(parentAnchor) !== -1) {
        exists = true;
        break;
      }
    }
    if (exists) {
      parentAnchors.push(resList[i].num);
      i++;
    } else {
      break;
    }
  }
  // 複数アンカーを分割
  if (isMultiAnchor) {
    let newItem = Object.assign({}, item);
    let tmpItems = newItem.content.split('<br>');
    let anchorContent = '';
    let anchorExists = false;
    let spliter = '&gt;&gt;' + anchor;
    for (let tmpItem of tmpItems) {
      if (tmpItem.indexOf(spliter) !== -1) {
        anchorExists = true;
        anchorContent += tmpItem;
        continue;
      }
      if (anchorExists) {
        if (tmpItem.indexOf('&gt;&gt;') !== -1) {
          break;
        }
        anchorContent += '<br>' + tmpItem;
      }
    }
    newItem.content = anchorContent;
    newItem.isAdded = true;
    resList.splice(i, 0, newItem);
  } else {
    resList.splice(i, 0, item);
  }

}

/**
 * Read a line to res item
 * @param line
 * @returns {{date: string,
 *            parent: number,
 *            select: boolean,
 *            resFontSize: string,
 *            candi1: boolean,
 *            num: number,
 *            candi2: boolean,
 *            show: boolean,
 *            hasImage: boolean,
 *            anchors: [],
 *            idBackgroundColor: string,
 *            content: string,
 *            idTotal: number,
 *            name: string,
 *            isAdded: boolean,
 *            resBackgroundColor: string,
 *            id: string,
 *            resSelect: string,
 *            idNum: number,
 *            resColor: string}}
 */
function readLines(line) {
  if(line === undefined) return undefined;
  let words = line.split('<>');
  if (words.length > 4 && resList.length === 0) {
    sreTitle = words[4].replace(/\r|\r|\r\n/gi,'');
    sreTitle = sreTitle.trim();
  }
  let date_and_id = words[2].split(' ID:');
  let resItem = {
    num: -1,
    name: '',
    date: '',
    id: '',
    idTotal: 0,
    idNum: 0,
    anchors: [],
    content: '',
    isAdded: false,
    parent: 0,
    show: true,
    select: false,
    candi1: false,
    candi2: false,
    resColor: '#f00',
    resFontSize: '14px',
    resSelect: 'none',
    resBackgroundColor: '#ffffff',
    idBackgroundColor: 'transparent',
    idColor: '#000',
    hasImage: false,
    isFiltered: false,
    originalIndex: -1,
    anchorCount: 0,
    isEdit: false,
    resMenu: false,
    isMenuOpen: false,
  };

  num++;
  resItem.num = num;
  resItem.name = words[0].replace(/(<([^>]+)>)/ig, '');
  resItem.date = date_and_id[0].replace(/(<([^>]+)>)/ig, '');
  resItem.id = date_and_id[1] === undefined ? '' : date_and_id[1];
  resItem.resMenu = settings['res_menu'];
  resItem.isMenuOpen = false;

  // add id to id array
  let idExists = false;

  for (let i = 0; i < ids.length; i++) {
    if (ids[i].id === resItem.id) {
      ids[i].totalCount++;
      idExists = true;
    }
  }

  if (!idExists) {
    let newId = {
      id: resItem.id,
      totalCount: 1
    };
    ids.push(newId);
  }

  if (words.length > 2) {
    let tmp_str = words[3];
    tmp_str = tmp_str.replace(/<hr>|<br \/>/ig,'<br>');
    let tmp_items = tmp_str.split(/<br>\s|<br>/ig);
    let index = 0;
    for (let tmp_item of tmp_items) {
      if (index > 0)
        resItem.content += '<br>';
      tmp_item = tmp_item.replace(/(<([^>]+)>)/ig, '');
      // if(tmp_item.match(/(&gt;&gt;\d*[0-9]\d*)/)){
      //   tmp_item = tmp_item.trim();
      // }
      // tmp_item = tmp_item.trim();
      if (tmp_item.startsWith("https:") || tmp_item.startsWith("http:")) {
        tmp_item = tmp_item.replace('.JPG', '.jpg');
        tmp_item = tmp_item.replace('.GIF', '.gif');
        tmp_item = tmp_item.replace('.JPEG', '.jpeg');
        tmp_item = tmp_item.replace('.PNG', '.png');
        tmp_item = tmp_item.replace('.BMP', '.bmp');
        if (tmp_item.endsWith("jpg")
          || tmp_item.endsWith("gif")
          || tmp_item.endsWith("jpeg")
          || tmp_item.endsWith("png")
          || tmp_item.endsWith("bmp")
        ) {
          tmp_item = `<img src="${tmp_item}" alt=""><a class="res-img-link" href="${tmp_item}">${tmp_item}</a>`;
          resItem.hasImage = true;
        } else {
          tmp_item = `<a class="res-link" href="${tmp_item}">${tmp_item}</a>`;
        }
      } else {

        if (tmp_item.indexOf("&gt;&gt;") !== -1) {
          let tmpAnchors = tmp_item.split("&gt;&gt;");
          if (tmpAnchors.length > 1) {
            resItem.anchors.push(parseInt(tmpAnchors[1]));
          }
        }
      }
      resItem.content += tmp_item;
      index++;
    }
    // resItem.content = words[3];
  }
  return resItem;
}
ipcMain.on("loadSettings", (event) => {
  getSettings();
});

function getSettings() {

  fs.open(settingPath, 'r', (err, fd) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(url + ' does not exist');
        return;
      }
      throw err;
    }
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });

  let input = fs.createReadStream(settingPath);
  let remaining = '';
  settings = {
    dataPath: '',
    defaultPath: '',
    isResSort: false,
    isMultiAnchor: false,
    isReplaceRes: false,
    characterColors:[],
    cautionRes: [],
    hiddenRes: [],
    colors: [],
  };
  num = 0;
  input.on('data', function (data) {
    remaining += data;
    remaining = remaining.replace(/(\r)/gm,'');
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      let line = remaining.substring(last, index);

      last = index + 1;
      index = remaining.indexOf('\n', last);
      if(line.startsWith('#')){
        // if(stateComments.indexOf(line) !== -1) {
        curComment = line;
        // }
        continue;
      }
      if(line.length === 0){
        continue;
      }
      if(line.match(/pass:/gi)){
        settings['autoSavePath'] = line.replace(/pass:/gi,'').trim();
        continue;
      }
      let lineArgs = line.split(':');

      if(curComment === '#datパス'){
        settings['dataPath'] = line;
      }else if(curComment === '#指定したdatパス'){
        settings['defaultPath'] = line;
      }else if(curComment === '#チェックボックス'){
        if(lineArgs[0] === '1'){
          settings['isResSort'] = lineArgs[1] === 'on';
        }else if(lineArgs[0] === '2'){
          settings['isMultiAnchor'] = lineArgs[1] === 'on';
        }else if(lineArgs[0] === '3'){
          settings['isReplaceRes'] = lineArgs[1] === 'on';
        }
      }else if(curComment === '#文字色'){
        settings['characterColors'].push(lineArgs[1]);
      }else if(curComment === '注意レス'){
        settings['chuui'] = lineArgs[1].split(';');
      }else if(curComment === '#非表示レス'){
        settings['hihyouji'] = lineArgs[1].split(';');
      }else if(curComment === '#注目レスの閾値'){
        settings['noticeCount'] = lineArgs[1].split(';');
      } else{
        if(yesNoKeys.indexOf(lineArgs[0]) !== -1) {
          settings[lineArgs[0]] = lineArgs[1] === 'yes';
        }else if(onOffKeys.indexOf(lineArgs[0]) !== -1){
          settings[lineArgs[0]] = lineArgs[1] === 'on';
        }else {
          if (lineArgs.length > 1) {
            if(curComment === '#ボタンの色'){
              if(lineArgs[0] === 'tree_sentaku') {
                lineArgs[0] = 'tree_sentaku_back';
              } else if(lineArgs[0] === 'tree_kaijo') {
                lineArgs[0] = 'tree_kaijo_back';
              } else if(lineArgs[0] === 'id_kaijo') {
                lineArgs[0] = 'id_kaijo_back';
              }
            }
            settings[lineArgs[0]] = lineArgs[1].replace(';','');
          } else {
            settings[lineArgs[0]] = '';
          }
        }
      }
    }
    remaining = remaining.substring(last);
  });

  input.on('end', function () {
    win.webContents.send("getSettings", settings);
  });
}

ipcMain.on("saveStatus", (event, saveData) => {
  saveStatus(saveData);
});

function saveStatus(saveData) {
  const showMessage = saveData.showMessage;
  const jsonString = JSON.stringify(saveData);
  const filePath = saveData.filePath;
  if(filePath === undefined) return;
  fs.writeFile(filePath, jsonString, err => {
    if (err) {
      if(showMessage) {
        dialog.showErrorBox('保存', '保存に失敗しました。');
      }else{
        console.log('自動保存に失敗しました。');
      }
    } else {
      if(showMessage) {
        dialog.showErrorBox('保存', '保存に成功しました。');
      }else{
        console.log('自動保存に成功しました。');
      }
    }
  });
}
ipcMain.on("loadStatus", (event, filePath, tabIndex) => {
  loadStatus(filePath, tabIndex);
});
function loadStatus(filePath, tabIndex){
  fs.readFile(filePath, 'utf8', (err, jsonString) => {
    if (err) {
      dialog.showErrorBox('復元', '復元。');
      return
    }
    try {
      const loadData = JSON.parse(jsonString)
      win.webContents.send("getStatus", {data: loadData, tabIndex: tabIndex});
    } catch(err) {
      console.log('Error parsing JSON string:', err)
    }
  })
}

