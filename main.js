const { app, BrowserWindow,ipcMain  } = require('electron');
const fs = require('fs');
const encoding = require('encoding-japanese');

let win;
let num = 0;
let ids = [];
let resList = [];
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1213,
    height: 948,
    minWidth: 1213,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`,
    webPreferences: {
      nodeIntegration: true
    }
  })


  win.loadURL(`file://${__dirname}/dist/Mtmex/index.html`)

  //// uncomment below to open the DevTools.
  win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// Create window on electron intialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})
function getResList(url,isResSort, isMultiAnchor, isReplaceRes) {

  fs.open(url, 'r', (err, fd) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(url+' does not exist');
        return;
      }
      throw err;
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
  input.on('data', function(data) {
    let encoded_data = encoding.convert(data, {
      from: 'SJIS',
      to: 'UNICODE',
      type: 'string',
    });
    remaining += encoded_data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      let line = remaining.substring(last, index);
      last = index + 1;
      resList.push(readLines(line));
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      resList.push(readLines(remaining));
    }
    adjustResList(isResSort, isMultiAnchor, isReplaceRes);
    win.webContents.send("getResResponse", resList);
  });
}
ipcMain.on("loadRes", (event, url,isResSort, isMultiAnchor, isReplaceRes) => {
  getResList(url,isResSort, isMultiAnchor, isReplaceRes);
});

function adjustResList(isResSort, isMultiAnchor, isReplaceRes){
    for(let idItem of ids){
      let idNum = 0;
      for(let i=0; i<resList.length; i++) {
        if(idItem.id === resList[i].id){
          idNum ++;
          resList[i].idTotal = idItem.totalCount;
          resList[i].idNum = idNum;
        }
      }
    }
    let tmpResList = [];
    if(isResSort || isReplaceRes){
      for(let i=0; i<resList.length; i++){
        let hasAnchor = false;
        if(resList[i].anchors.length >0) {
          if(!isReplaceRes && resList[i].anchors.indexOf(1) !== -1){
            continue;
          }
          tmpResList.push(resList[i])
          resList.splice(i,1);
          i--;
        }
      }
      // tmpResList.reverse();
      for(let resItem of tmpResList){
        for(let anchor of resItem.anchors) {
          for (let i = 0; i < resList.length; i++) {
            if(resList[i].num === anchor){
              if(isReplaceRes) {
                  if(isMultiAnchor){
                    addAnchorRes(i+1,resItem,anchor,isMultiAnchor);
                    resItem.isAdded = true;
                  }
                  else{
                    if(!resItem.isAdded){
                      addAnchorRes(i+1,resItem,anchor,isMultiAnchor);
                      // resList.splice(i + 1, 0, resItem);
                      resItem.isAdded = true;
                    }
                  }
              }else{
                if(resList[i].num !== 1){
                  if(isMultiAnchor){
                    addAnchorRes(i+1,resItem,anchor,isMultiAnchor);
                    // resList.splice(i + 1, 0, resItem);
                    resItem.isAdded = true;
                  }
                  else{
                    if(!resItem.isAdded){
                      addAnchorRes(i+1,resItem,anchor,isMultiAnchor);
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

function addAnchorRes(index, item, anchor,isMultiAnchor){
  let i = index;
  let parentAnchors = [];
  while(true){
    if(resList.length-2<i)
      break;
    if(resList[i].anchors.indexOf(anchor) !==-1){
      parentAnchors.push(resList[i].num);
      i++;
      continue;
    }
    let exists = false;
    for(let parentAnchor of parentAnchors){
      if(resList[i].anchors.indexOf(parentAnchor) !==-1) {
        exists = true;
        break;
      }
    }
    if(exists){
      parentAnchors.push(resList[i].num);
      i++;
    }else{
      break;
    }
  }
  // 複数アンカーを分割
  if(isMultiAnchor) {
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
  }else{
    resList.splice(i, 0, item);
  }

}
function readLines(line) {
  let words = line.split('<>');
  let date_and_id = words[2].split(' ID:');
  let resItem = {
    num: -1,
    name: '',
    date: '',
    id:'',
    idTotal:0,
    idNum:0,
    anchors:[],
    content:'',
    isAdded: false,
    parent: 0,
    show: true,
  };

  num++;
  resItem.num = num;
  resItem.name = words[0].replace( /(<([^>]+)>)/ig, '');
  resItem.date = date_and_id[0];
  resItem.id = date_and_id[1];

  // add id to id array
  let idExists = false;

  for (let i = 0; i < ids.length; i++) {
    if (ids[i].id === resItem.id) {
      ids[i].totalCount++;
      idExists =true;
    }
  }

  if(!idExists){
    let newId = {
      id: resItem.id,
      totalCount: 1
    };
    ids.push(newId);
  }

  if(words.length>2) {
    let tmp_str = words[3];
    let tmp_items = tmp_str.split('<br>');
    let index = 0;
    for(let tmp_item of tmp_items){
      if(index > 0 )
        resItem.content +='<br>';
      tmp_item = tmp_item.replace( /(<([^>]+)>)/ig, '');
      if(tmp_item.startsWith("https:")){
        tmp_item = tmp_item.replace('.JPG','.jpg');
        tmp_item = tmp_item.replace('.GIF','.gif');
        tmp_item = tmp_item.replace('.JPEG','.jpeg');
        tmp_item = tmp_item.replace('.PNG','.png');
        tmp_item = tmp_item.replace('.BMP','.bmp');
        if(tmp_item.endsWith("jpg")
          || tmp_item.endsWith("gif")
          || tmp_item.endsWith("jpeg")
          || tmp_item.endsWith("png")
          || tmp_item.endsWith("bmp")
        ){
          tmp_item = `<img src="${tmp_item}"><a class="res-img-link" href="${tmp_item}">${tmp_item}</a>`;
        }else{
          tmp_item = `<a class="res-link" href="${tmp_item}">${tmp_item}</a>`;
        }
      }else{

        if(tmp_item.indexOf("&gt;&gt;")!==-1){
          let tmpAnchors = tmp_item.split("&gt;&gt;");
          if(tmpAnchors.length>1) {
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


