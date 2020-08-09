const {app, BrowserWindow, ipcMain, dialog, Menu, MenuItem} = require('electron');
const fs = require('fs');
const encoding = require('encoding-japanese');
const {v4: uuidv4} = require('uuid');

let win;
let num = 0;
let ids = [];
let resList = [];
let sreTitle = '';
let settingPath = 'Setting.ini';
let searchListPath = 'SearchList.txt';

let stateComments = ['#datパス', '#指定したdatパス', '#チェックボックス', '#文字色', '#注意レス', '#非表示レス', '#名前欄の置換',
  '#投稿日・IDの置換', '#注目レスの閾値', '#ボタンの色'];
let curComment = '';
let yesNoKeys = ['shuturyoku', 'sentaku_idou1', 'sentaku_idou2', 'Left_highlight', 'res_mouse_click', 'youtube'
  , 'twitter', 'AutoSave', 'gif_stop', 'all_tab_save'];
let selectKeys = ['res_menu'];
const onOffKeys = ['jogai'];
let settings;
let loadedTitles = [];

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
  // win.webContents.openDevTools();

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
  const isMac = process.platform === 'darwin'

  const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
      label: app.name,
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services'},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    }] : []),
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        isMac ? {role: 'close'} : {role: 'quit'}
      ]
    },
    // { role: 'editMenu' }
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        ...(isMac ? [
          {role: 'pasteAndMatchStyle'},
          {role: 'delete'},
          {role: 'selectAll'},
          {type: 'separator'},
          {
            label: 'Speech',
            submenu: [
              {role: 'startspeaking'},
              {role: 'stopspeaking'}
            ]
          }
        ] : [
          {role: 'delete'},
          {type: 'separator'},
          {role: 'selectAll'}
        ])
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    // { role: 'windowMenu' }
    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const {shell} = require('electron');
            await shell.openExternal('https://electronjs.org');
          }
        }
      ]
    },
    {
      label: 'タブを閉じる',
      submenu: [{
        label: 'タブを閉じる',
        click: function () {
          win.webContents.send("closeMenu");
        }
      }]
    }
  ];

  const temp_menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(temp_menu);

  // const menu = Menu.getApplicationMenu();
  // menu.items[3].submenu.items.splice(2, 1);
  //
  // menu.append(new MenuItem({
  //   label: 'タブを閉じる',
  //   submenu: [{
  //     label: 'タブを閉じる',
  //     click: function () {
  //       win.webContents.send("closeMenu");
  //     }
  //   }]
  // }));

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)
  // win.setMenu(menu);
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
 * @param filePath: the file path to load
 * @param isResSort
 * @param isMultiAnchor
 * @param isReplaceRes
 * @param isContinuousAnchor
 * @param notMoveFutureAnchor
 * @param remarkRes
 * @param hideRes
 */
function getResList(filePath, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor, remarkRes, hideRes) {
  if (filePath === '') {
    dialog.showErrorBox('読み込み', 'ファイルパスを入力してください。');
    return;
  }
  if (!fs.existsSync(filePath)) {
    dialog.showErrorBox('読み込み', 'ファイルを読めません。');
    return;
  }
  let data = fs.readFileSync(filePath);

  let remaining = '';

  ids = [];
  resList = [];
  num = 0;
  let encoded_data = encoding.convert(data, {
    from: 'SJIS',
    to: 'UNICODE',
    type: 'string',
  });
  remaining += encoded_data;
  let index = remaining.indexOf('\n');
  let last = 0;

  while (index > -1) {
    let line = remaining.substring(last, index);
    last = index + 1;
    if (line.length > 1) {
      const res = readLines(line);
      isFirst = false;
      if (remarkRes !== undefined && remarkRes.length > 0) {
        const re = new RegExp(remarkRes, 'gi');
        if (re.test(res.content) || re.test(res.name)) {
          res.isRemark = true;
        }
      }

      if (hideRes.length < 1) {
        resList.push(res);
      } else {
        const re = new RegExp(hideRes, 'gi');
        if (!re.test(res.content) && !re.test(res.name)) {
          resList.push(res);
        }

      }
    }
    index = remaining.indexOf('\n', last);
  }

  remaining = remaining.substring(last);
  if (remaining.length > 0) {
    resList.push(readLines(remaining));
  }
  adjustResList(isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor);
  if (loadedTitles.indexOf(sreTitle) !== -1) {
    let response = dialog.showMessageBoxSync(win, {
      buttons: ["Yes", "No"],
      message: '同じタブがあります、datを読み込みますか'
    });
    if (response === 0) {
      loadedTitles.push(sreTitle);
      let suffix = uuidv4();
      suffix = suffix.replace(/-/g, '').substr(0, 10);
      const originSreTitle = sreTitle;
      sreTitle = `${sreTitle}__${suffix}`;
      win.webContents.send("getResResponse", {resList: resList, sreTitle: sreTitle, originSreTitle: originSreTitle});
    }
  } else {
    loadedTitles.push(sreTitle);
    win.webContents.send("getResResponse", {resList: resList, sreTitle: sreTitle, originSreTitle: sreTitle});
  }
}

ipcMain.on("removeTab", (event, originSreTitle) => {
  removeTitle(originSreTitle);
});

function removeTitle(originSreTitle) {
  if (originSreTitle.length > 0) {
    const index = loadedTitles.indexOf(originSreTitle);
    if (index !== -1) {
      loadedTitles.splice(index, 1);
    }
  }
}

ipcMain.on("loadRes", (event, filePath, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor,
                       notMoveFutureAnchor, remarkRes, hideRes) => {
  getResList(filePath, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor, remarkRes, hideRes);
});

ipcMain.on("loadMultiRes", (event, filePaths, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor,
                            notMoveFutureAnchor, remarkRes, hideRes) => {
  let index = 0;
  for (const filePath of filePaths) {
    setTimeout(getResList, 1000*index, filePath, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor, remarkRes, hideRes);
    index++;
  }

});

/**
 * Adjust the res list by user selection
 * @param isResSort
 * @param isMultiAnchor
 * @param isReplaceRes
 * @param isContinuousAnchor
 * @param notMoveFutureAnchor
 */
function adjustResList(isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor) {
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
    if (settings.jogai && sreTitle !== undefined && sreTitle.length > 0) {
      const re = new RegExp(sreTitle, 'gi');
      resItem.content = resItem.content.replace(re, '');
      resItem.id = resItem.id.replace(re, '');
      resItem.name = resItem.name.replace(re, '');
      resItem.date = resItem.date.replace(re, '');
    }
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
    for (let i = 1; i < resList.length; i++) {
      if (resList[i].anchors.length > 0) {
        if (!isReplaceRes && resList[i].anchors.indexOf(1) !== -1) {
          continue;
        }
        if ((resList[i].anchors.length === 1 && resList[i].anchors.indexOf(resList[i].num) !== -1)
          || (notMoveFutureAnchor && resList[i].futureAnchors.length > 0)) {
          continue;
        }
        tmpResList.push(resList[i]);
        if (resList[i].futureAnchors.length < 1 || !isMultiAnchor) {
          if (resList[i].anchors.indexOf(resList[i].num) === -1) {
            resList.splice(i, 1);
            i--;
          }
        }
      }
    }

    // tmpResList.reverse();
    for (let resItem of tmpResList) {
      for (let anchor of resItem.anchors) {
        if (resItem.num === anchor) {
          continue;
        }
        for (let i = 0; i < resList.length; i++) {
          if (resList[i].num === anchor) {
            if (isReplaceRes) {
              if (isMultiAnchor && resItem.anchors.length < settings.anker) {
                addAnchorRes(i + 1, resItem, anchor, isMultiAnchor && resItem.anchors.length < settings.anker,
                  isContinuousAnchor, resList[i].anchorLevel);
                if (resItem.futureAnchors.length < 1) {
                  resItem.isAdded = true;
                  resItem.anchorLevel = resList[i].anchorLevel + 1;
                }
              } else {
                if (!resItem.isAdded) {
                  addAnchorRes(i + 1, resItem, anchor, isMultiAnchor && resItem.anchors.length < settings.anker,
                    isContinuousAnchor, resList[i].anchorLevel);
                  resItem.isAdded = true;
                  resItem.anchorLevel = resList[i].anchorLevel + 1;
                }
              }
            } else {
              if (resList[i].num !== 1) {
                if (isMultiAnchor && resItem.anchors.length < settings.anker) {
                  addAnchorRes(i + 1, resItem, anchor, isMultiAnchor && resItem.anchors.length < settings.anker,
                    isContinuousAnchor, resList[i].anchorLevel);
                  if (resItem.futureAnchors.length < 1) {
                    resItem.isAdded = true;
                    resItem.anchorLevel = resList[i].anchorLevel + 1;
                  }
                } else {
                  if (!resItem.isAdded) {
                    addAnchorRes(i + 1, resItem, anchor, isMultiAnchor && resItem.anchors.length < settings.anker,
                      isContinuousAnchor,resList[i].anchorLevel);
                    resItem.isAdded = true;
                    resItem.anchorLevel = resList[i].anchorLevel + 1;
                  }
                }
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < resList.length; i++) {
      if (resList[i].anchorCount >= settings.noticeCount) {
        resList[i].isNotice = true;
        if (resList[i].isAdded) {
          let j = i - 1;
          while (resList[j].isAdded && j > -1) {
            resList[j].isNotice = true;
            j--;
          }
          resList[j].isNotice = true;
          j = i + 1;
          while (j < resList.length && resList[j].isAdded) {
            resList[j].isNotice = true;
            j++;
          }
          i = j;
        } else if (i < resList.length - 1 && resList[i + 1]) {
          let j = i + 1;
          while (j < resList.length && resList[j].isAdded) {
            resList[j].isNotice = true;
            j++;
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
 * @param isContinuousAnchor
 * @param anchorLevel
 */
function addAnchorRes(index, item, anchor, isMultiAnchor, isContinuousAnchor, anchorLevel) {
  let i = index;
  let parentAnchors = [];
  while (true) {
    if (resList.length - 2 < i)
      break;
    if (resList[i].anchors.indexOf(anchor) !== -1 && resList[i].num !== item.num) {
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
    if(isContinuousAnchor && item.continuousAnchors.indexOf(anchor) !== -1){
      let newItem = Object.assign({}, item);
      const strAnchor = `&gt;&gt;${anchor}`;
      const re = new RegExp(strAnchor,'gi');
      if(re.test(item.continuousContent) === false){
        newItem.content = `&gt;&gt;${anchor}<br>` + item.continuousContent.replace(/&gt;&gt;\d+/gi,'');
      }else{
        newItem.content = item.continuousContent;
      }
      newItem.isAdded = true;
      item.content = item.content.replace(`&gt;&gt;${anchor}<br>`,'');
      item.content = item.content.replace(`&gt;&gt;${anchor}`,'');
      item.content = item.content.replace(item.continuousContent,'');
      resList.splice(i, 0, newItem);
    }else if(item.continuousAnchors.indexOf(anchor) === -1) {
      let newItem = Object.assign({}, item);
      let tmpItems = newItem.content.split('<br>');
      let anchorContent = '';
      let anchorExists = false;
      let isAdded = false;
      let spliter = '&gt;&gt;' + anchor;
      let row = 0;
      if(newItem.content.length > 0) {
        for (let tmpItem of tmpItems) {
          if (row > 0 && isAdded) {
            anchorContent += '<br>';
          }
          row++;
          if (tmpItem.indexOf(spliter) !== -1) {
            anchorExists = true;
            // anchorContent += tmpItem.substr(0, tmpItem.indexOf(spliter) + spliter.length);
            // tmpItem = tmpItem.substr(tmpItem.indexOf(spliter) + spliter.length);
            anchorContent += tmpItem;
            isAdded = true;
            continue;
          }
          if (anchorExists) {
            if (tmpItem.indexOf('&gt;&gt;') !== -1) {
              anchorContent += tmpItem.substr(0, tmpItem.indexOf('&gt;&gt;'));
              break;
            }
            anchorContent += tmpItem;
            isAdded = true;
          } else {
            if (item.continuousAnchors.length === 0) {
              anchorContent += tmpItem;
              isAdded = true;
            }
          }

        }
      }
      if(isAdded && anchorExists) {
        newItem.content = anchorContent;
        // if(item.featureAnchors > 0){
        item.content = item.content.replace(newItem.content, '');
        // if (item.content.length === 0) {
        //   item.content = newItem.content;
        // }
        // }
        newItem.isAdded = true;
        newItem.anchorLevel = anchorLevel + 1;
        resList.splice(i, 0, newItem);
      }
    }else {
      if(resList.indexOf(item) === -1) {
        resList.splice(i, 0, item);
      }
    }
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
  if (line === undefined) return undefined;
  let words = line.split('<>');
  if (words.length > 4 && num === 0) {
    sreTitle = words[4].replace(/\r|\r|\r\n/gi, '');
    sreTitle = sreTitle.trim();
    if(sreTitle.length === 0){
      sreTitle = '_';
    }
  }
  for (let i = 1; i < 31; i++) {
    let search = settings[`toukoubi_mae${i}`];
    if (search === undefined || search.length < 1) {
      continue;
    }
    search = search.replace(/\(/gi, '\\(');
    search = search.replace(/\)/gi, '\\)');
    const re = new RegExp(search, 'gi');
    let replacement = settings[`toukoubi_ato${i}`];
    words[2] = words[2].replace(re, replacement);
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
    isShow: true,
    resColor: '#000',
    resFontSize: '14px',
    resSelect: 'none',
    resBackgroundColor: settings.Back_color,
    resHovergroundColor: '#ffffff',
    idBackgroundColor: 'transparent',
    idColor: '#000',
    moveMarkColor: '#999',
    hasImage: false,
    isFiltered: false,
    originalIndex: -1,
    anchorCount: 0,
    isEdit: false,
    resMenu: false,
    isMenuOpen: false,
    isRemark: false,
    futureAnchors: [],
    isNotice: false,
    continuousAnchors: [],
    continuousContent:'',
    anchorLevel: 0
  };

  num++;
  resItem.num = num;
  resItem.name = words[0].replace(/(<([^>]+)>)/ig, '');
  for (let i = 1; i < 31; i++) {
    let search = settings[`namae_mae${i}`];
    if (search === undefined || search.length < 1) {
      continue;
    }
    search = search.replace(/\(/gi, '\\(');
    search = search.replace(/\)/gi, '\\)');
    const re = new RegExp(search, 'gi');
    let replacement = settings[`namae_ato${i}`];
    resItem.name = resItem.name.replace(re, replacement);
  }
  resItem.date = date_and_id[0].replace(/(<([^>]+)>)/ig, '');
  resItem.id = date_and_id[1] === undefined ? '' : date_and_id[1];
  resItem.resMenu = settings['res_menu'];
  resItem.moveMarkColor = settings['res_move'];
  resItem.isMenuOpen = false;
  resItem.resFontSize = `${settings['font-size1']}px`;

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
    for (let i = 1; i < 31; i++) {
      let search = settings[`honbun_mae${i}`];
      if (search === undefined || search.length < 1) {
        continue;
      }
      const re = new RegExp(`(?![^<>]*>)${search}`, 'gi');
      let replacement = settings[`honbun_ato${i}`];
      tmp_str = tmp_str.replace(re, replacement);
    }
    tmp_str = tmp_str.replace(/<hr>|<br \/>/ig, '<br>');
    const future_str = settings.mirai_anker.replace(/;/g, '|');
    const reFuture = new RegExp(`(${future_str})[^&]+&gt;&gt;\\d+|&gt;&gt;\\d+[^&]+(${future_str})$`, 'gi');

    let f_anchors = tmp_str.match(reFuture);

    if (f_anchors !== null) {
      for (let f_anchor of f_anchors) {
        f_anchor = f_anchor.replace(/[^&]*&gt;&gt;(\d+)/gi, '$1');
        f_anchor = f_anchor.replace(/&gt;&gt;(\d+)([^&]*)/gi, '$1');
        resItem.futureAnchors.push(parseInt(f_anchor));
      }
    }
    let anchor_str = tmp_str.replace(reFuture, '');
    let anchors = anchor_str.match(/&gt;&gt;\d+/g);
    if (anchors !== null) {
      for (const anchor of anchors) {
　        const anchorNum = parseInt(anchor.replace(/&gt;&gt;/g, ''));
        if(anchorNum > resItem.num){
          resItem.futureAnchors.push(anchorNum);
        }else{
          resItem.anchors.push(anchorNum);
        }
      }
    }
    // if(JSON.stringify(resItem.featureAnchors) === JSON.stringify(resItem.anchors)){
    //   console.log(resItem.num);
    //   resItem.anchors = [];
    //   resItem.featureAnchors = [];
    // }

    let tmp_items = tmp_str.split(/<br>\s|<br>/ig);
    let replaced_lines = [];
    let index = 0;
    const re = new RegExp(sreTitle, 'gi');
    for (let tmp_item of tmp_items) {
      if (index > 0)
        resItem.content += '<br>';
      tmp_item = tmp_item.replace(/(<([^>]+)>)/ig, '');
      tmp_item = tmp_item.replace(/(http|ttp):/ig, 'http:');
      tmp_item = tmp_item.replace(/(http|ttp)s:/ig, 'https:');
      if (settings.jogai && sreTitle !== undefined && sreTitle.length > 0) {
        tmp_item = tmp_item.replace(re, '');
      }
      // if(tmp_item.match(/(&gt;&gt;\d*[0-9]\d*)/)){
      //   tmp_item = tmp_item.trim();
      // }
      // tmp_item = tmp_item.trim();

      var expUrl = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      var expGifUrl = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|].gif)/ig;
      var expImgUrl = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|].(jpg|jpeg|png|bmp))/ig;

      if (new RegExp(expUrl).test(tmp_item)) {
        if (new RegExp(expGifUrl).test(tmp_item)) {
          if (settings.gif_stop) {
            tmp_item = tmp_item.replace(expGifUrl, `<img src="$1" class="res-img-thumb gif-pause" alt="" width="${settings.pict_hyouji}px"><a href="$1" class="res-img-link res-gif-link" class="res-img-link res-gif-link">$1</a>`);
          } else {
            tmp_item = tmp_item.replace(expGifUrl, `<img src="$1" class="res-img-thumb" alt="" width="${settings.pict_hyouji}px"><a href="$1" class="res-img-link res-gif-link">$1</a>`);
          }
          resItem.hasImage = true;
        } else if (new RegExp(expImgUrl).test(tmp_item)) {
          tmp_item = tmp_item.replace(expImgUrl, `<img src="$1" class="res-img-thumb" alt="" width="${settings.pict_hyouji}px"><a href="$1" class="res-img-link">$1</a>`);
          resItem.hasImage = true;
        } else {
          tmp_item = tmp_item.replace(expUrl, `<a class="res-link" href="$1">$1</a>`);
        }
      }
      // else {
      //   if (tmp_item.match(/&gt;&gt;/g) !== null && tmp_item.match(/未来アンカー/g) === null) {
      //     let tmpAnchors = tmp_item.split("&gt;&gt;");
      //     if (tmpAnchors.length > 1) {
      //       resItem.anchors.push(parseInt(tmpAnchors[1]));
      //     }
      //   }
      // }
      resItem.content += tmp_item;
      replaced_lines.push(tmp_item);
      index++;
    }
    const strReContinue = /^&gt;&gt;\d+$/gi;
    let isAddContinue = false;
    for(let i=0; i<replaced_lines.length; i++){
      if(new RegExp(strReContinue).test(replaced_lines[i])){
        const num = parseInt(replaced_lines[i].replace(/&gt;&gt;/g, ''));
        const next = i + 1;
        if (next < replaced_lines.length){
          if(new RegExp(/&gt;&gt;\d+/,'gi').test(replaced_lines[next])){
            resItem.continuousAnchors.push(num);
            isAddContinue = true;
            continue;
          }
        }
        const prev = i -1;
        if (prev >= 0){
          if(new RegExp(strReContinue).test(replaced_lines[prev])){
            resItem.continuousAnchors.push(num);
            isAddContinue = true;
          }
        }
      }else{
        if (i > 0 && new RegExp(strReContinue).test(replaced_lines[i-1]) && isAddContinue){
          let anchor = replaced_lines[i].match(/&gt;&gt;\d+/g);
          if(anchor !== null) {
            num = parseInt(anchor[0].replace(/&gt;&gt;/g, ''));
            resItem.continuousAnchors.push(num);
          }
          let continueContent = replaced_lines[i];
          for (let j=i+1; j < replaced_lines.length; j++){
            if(new RegExp(/&gt;&gt;\d+/g).test(replaced_lines[j])){
              isAddContinue = false;
              break;
            }
            continueContent += '<br>' + replaced_lines[j];
          }
          resItem.continuousContent = continueContent.replace(/&gt;&gt;\d+/gi,'');
        }

      }
    }
    // resItem.content = words[3];
  }
  return resItem;
}

ipcMain.on("loadSettings", (event) => {
  getSettings();
});

function getSettings() {

  if(!fs.existsSync(settingPath)) {
    dialog.showErrorBox('設定', '設定ファイルを読めません。');
    return;
  }

  let input = fs.createReadStream(settingPath);
  let remaining = '';
  settings = {
    dataPath: '',
    defaultPath: [],
    isResSort: false,
    isMultiAnchor: false,
    isReplaceRes: false,
    characterColors: [],
    cautionRes: [],
    hiddenRes: [],
    colors: [],
  };
  num = 0;
  input.on('data', function (data) {
    remaining += data;
    remaining = remaining.replace(/(\r)/gm, '');
    var index = remaining.indexOf('\n');
    var last = 0;
    while (index > -1) {
      let line = remaining.substring(last, index);

      last = index + 1;
      index = remaining.indexOf('\n', last);
      if (line.startsWith('#')) {
        // if(stateComments.indexOf(line) !== -1) {
        curComment = line;
        // }
        continue;
      }
      if (line.length === 0) {
        continue;
      }
      if (line.match(/pass:/gi)) {
        settings['autoSavePath'] = line.replace(/pass:/gi, '').trim();
        continue;
      }
      let chunks = line.split(':');
      let lineArgs = [chunks.shift(), chunks.join(':')];

      if (curComment === '#datパス') {
        settings['dataPath'] = line;
      } else if (curComment === '#指定したdatパス') {
        settings['defaultPath'].push(lineArgs[1]);
      } else if (curComment === '#チェックボックス') {
        if (lineArgs[0] === '1') {
          settings['isResSort'] = lineArgs[1] === 'on';
        } else if (lineArgs[0] === '2') {
          settings['isMultiAnchor'] = lineArgs[1] === 'on';
        } else if (lineArgs[0] === '3') {
          settings['isContinuousAnchor'] = lineArgs[1] === 'on';
        } else if (lineArgs[0] === '4') {
          settings['notMoveFutureAnchor'] = lineArgs[1] === 'on';
        } else if (lineArgs[0] === '5') {
          settings['isReplaceRes'] = lineArgs[1] === 'on';
        }
      } else if (curComment === '#文字色') {
        settings['characterColors'].push(lineArgs[1]);
      } else if (curComment === '#注意レス') {
        settings['chuui'] = lineArgs[1];
      } else if (curComment === '#非表示レス') {
        settings['hihyouji'] = lineArgs[1];
      } else if (curComment === '#注目レスの閾値') {
        settings['noticeCount'] = lineArgs[1].split(';');
      } else if (curComment === '#未来アンカー'){
        settings[lineArgs[0]] = lineArgs[1].replace(/;/g, '|');
      } else {
        if (yesNoKeys.indexOf(lineArgs[0]) !== -1) {
          settings[lineArgs[0]] = (lineArgs[1] === 'yes' || lineArgs[1] === 'yes;');
        } else if (onOffKeys.indexOf(lineArgs[0]) !== -1) {
          settings[lineArgs[0]] = (lineArgs[1] === 'on' || lineArgs[1] === 'on;');
        } else if (selectKeys.indexOf(lineArgs[0]) !== -1) {
          settings[lineArgs[0]] = lineArgs[1];
        } else {
          if (lineArgs.length > 1) {
            settings[lineArgs[0]] = lineArgs[1].replace(/;/g, '');
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

  let searchList = [];
  if(fs.existsSync(searchListPath)) {
    let data = fs.readFileSync(searchListPath);
    let strTmp = '' + data;
    if(strTmp.length > 0){
      searchList = strTmp.split('\n');
    }
  }
  win.webContents.send("getSearchList", searchList);
}

ipcMain.on("saveStatus", (event, saveData) => {
  saveStatus(saveData);
});

function saveStatus(saveData) {
  const showMessage = saveData.showMessage;
  const jsonString = JSON.stringify(saveData);
  const filePath = saveData.filePath;
  if (filePath === undefined) return;
  fs.writeFile(filePath, jsonString, err => {
    if (err) {
      if (showMessage) {
        dialog.showErrorBox('保存', '保存に失敗しました。');
      } else {
        console.log('自動保存に失敗しました。');
      }
    } else {
      if (showMessage) {
        // dialog.showErrorBox('保存', '保存に成功しました。');
        console.log('保存に成功しました。');
      } else {
        console.log('自動保存に成功しました。');
      }
    }
  });
}

ipcMain.on("loadStatus", (event, filePath) => {
  loadStatus(filePath);
});

function loadStatus(filePaths) {
  for (const filePath of filePaths) {
    fs.readFile(filePath, 'utf8', (err, jsonString) => {
      if (err) {
        dialog.showErrorBox('復元', '復元。');
        return
      }
      try {
        const loadData = JSON.parse(jsonString)
        win.webContents.send("getStatus", {data: loadData});
      } catch (err) {
        console.log('Error parsing JSON string:', err)
      }
    });
  }
}

ipcMain.on("saveSearchList", (event, searchList) => {
  if(searchList !== undefined && searchList.length > 0) {
    let data = searchList.join('\n');

    fs.writeFile('SearchList.txt', data, (err) => {
      if (err) throw err;
      console.log('The search keywords has been saved!');
    });
  }
});

ipcMain.on("saveSettings", (event, dataFilePath, remarkRes, hideRes, isResSort, isMultiAnchor
                            , isReplaceRes, isContinuousAnchor, notMoveFutureAnchor) => {
  saveSettings(dataFilePath, remarkRes, hideRes, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor);
});

function saveSettings(dataFilePath, remarkRes, hideRes, isResSort, isMultiAnchor, isReplaceRes, isContinuousAnchor, notMoveFutureAnchor) {
  fs.readFile('Setting.ini', 'utf8', function (err, data) {
    if (data.match(/(#datパス\r\n)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(#datパス\r\n)+(\r\n)/g, `$1${dataFilePath}$2`);
    } else {
      data = data.replace(/(#datパス\r\n)[^\r^\n]+(\r\n)/g, `$1${dataFilePath}$2`);
    }
    if (data.match(/(chuui:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(chuui:)+(\r\n)/g, `$1${remarkRes}$2`);
    } else {
      data = data.replace(/(chuui:)[^\r^\n]+(\r\n)/g, `$1${remarkRes}$2`);
    }
    if (data.match(/(#非表示レス\r\nhihyouji:)[^\r^\n]+(\r\n)/g) === null) {
      data = data.replace(/(#非表示レス\r\nhihyouji:)+(\r\n)/g, `$1${hideRes}$2`);
    } else {
      data = data.replace(/(#非表示レス\r\nhihyouji:)[^\r^\n]+(\r\n)/g, `$1${hideRes}$2`);
    }

    let replaceString = '';
    if (isResSort) {
      replaceString += '$1on$2';
    } else {
      replaceString += '$1off$2';
    }
    if (isMultiAnchor) {
      replaceString += 'on';
    } else {
      replaceString += 'off';
    }
    if (isContinuousAnchor) {
      replaceString += '$3on$4';
    } else {
      replaceString += '$3off$4';
    }
    if (notMoveFutureAnchor) {
      replaceString += 'on';
    } else {
      replaceString += 'off';
    }
    if (isReplaceRes) {
      replaceString += '$5on$6';
    } else {
      replaceString += '$5off$6';
    }
    data = data.replace(/(#チェックボックス\r\n1:)\w+(\r\n2:)\w+(\r\n3:)\w+(\r\n4:)\w+(\r\n5:)\w+(\r\n)/gi, replaceString);
    fs.writeFile('Setting.ini', data, (err) => {
      if (err) throw err;
      console.log('The settings file has been saved!');
    });
  });
}
