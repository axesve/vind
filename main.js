/*
r
Fixa konto
Fixa synkning
Enkryptera?
Grupper?


*/

const {app, BrowserWindow, globalShortcut, clipboard, Tray, Menu} = require('electron')
const path = require('path')
const url = require('url')
const {ipcMain} = require('electron')
const Store = require('electron-store');
const store = new Store();
const fetch = require('electron-fetch');

var list = [];
var toggle = [];
var tags = [];

if(store.get("items") != undefined){
	var list = store.get('items');
}

if(store.get("hide") != undefined){
	toggle = store.get("hide");
}

if(store.get("tags") != undefined){
	var tags = store.get('tags');
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let notis;
let about;
let tray = null
var saved = false;


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
        width: 350,
        height: 500,
        resizable:false,
        name:"Vind",
        title:"Vind",
        focusable: true,
        show:false,
        frame:false,
        alwaysOnTop:true,
	  	'minHeight': 400,
	  	'minWidth': 350,
	  	'maxHeight': 800,
  		'maxWidth': 1000,
  		icon: __dirname + '/imgs/logo.ico'
    });

	notis = new BrowserWindow({
			width:250,
			height:50,
	        resizable:false,
	        name:"Vind",
	        title:"Vind",
	        focusable: false,
	        show:false,
	        frame:false,
	        alwaysOnTop:true,
	        transparent:false,
	        icon: __dirname + '/imgs/logo.ico'
	    });

	about = new BrowserWindow({
			width:300,
			height:225,
	        resizable:false,
	        name:"About Vind",
	        title:"About Vind",
	        focusable: false,
	        show:false,
	        frame:false,
	        alwaysOnTop:true,
	        center:true,
	       	icon: __dirname + '/imgs/logo.ico'
	    });

	var Positioner = require('electron-positioner')
	var notisXY = new Positioner(notis)
	var winXY = new Positioner(win)

	var n_xy = notisXY.calculate('bottomRight');
	var w_xy = winXY.calculate('bottomRight');

	n_xy.x -= 5;
	n_xy.y -= 5;

	w_xy.x -= 5;
	w_xy.y -= 5;

	notis.setPosition(n_xy.x, n_xy.y);
	win.setPosition(w_xy.x, w_xy.y);

	notis.setMenu(null);
	about.setMenu(null);

	 win.data = {
	        list,
	        toggle,
	        tags
	    };

  win.setMenu(null);

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  notis.loadURL(url.format({
    pathname: path.join(__dirname, 'notis.html'),
    protocol: 'file:',
    slashes: true
  }))

  about.loadURL(url.format({
    pathname: path.join(__dirname, 'about.html'),
    protocol: 'file:',
    slashes: true
  }))


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })


//Backend implementation
fetch('http://127.0.0.1/')
    .then(res => res.text())
    .then(body => console.log(body))

}

app.on('ready', () => {
  createWindow();

  win.setBackgroundColor('#FFFFFF');
  	var iconPath = path.join(__dirname,'imgs/logo.ico');
	  tray = new Tray(iconPath);
	  const contextMenu = Menu.buildFromTemplate([
	  		 {label: 'About', click:  function(){
				about.show();
    		}},
	        {label: 'Quit', click:  function(){
				app.quit();
				globalShortcut.unregisterAll();
    		}}
	  ])
	  tray.setToolTip('Vind')
	  tray.setContextMenu(contextMenu)

	tray.on('click', () => {
	  win.show();

		 globalShortcut.register('space', () => {
	     	globalShortcut.unregister('space');
			win.hide();
	    })

	})

    //win.show();

    //win.openDevTools();
    //notis.openDevTools();
     
	globalShortcut.register('CommandOrControl+B', () => {
    	if(!saved){
    	var d = new Date();
    	var time = d.toISOString().slice(0,10).replace(/-/g,"-") + " " + (d.getHours()<10?'0':'') + d.getHours() + ":" + (d.getMinutes()<10?'0':'') + d.getMinutes() + ":" + (d.getSeconds()<10?'0':'') + d.getSeconds();
     	var p = d.toISOString().slice(0,10).replace(/-/g,"-");

     	if(clipboard.readText('selection') != "" && clipboard.readText('selection').length > 0 && !containsObject(clipboard.readText('selection'), list)){

    		saved = true;
 			var text = clipboard.readText('selection').toString();

		    list.unshift({date:time, content:text, id:d.getTime(), tag:"General"});

	     	store.set('items', list);

	        win.webContents.send('ping', {date:time, content:text, id:d.getTime(), tag:"General"});

	        notis.webContents.send('notis', "success");

	    }else{
	    	saved = true;
	    	notis.webContents.send('notis', "fail");
	    }
	}
    })

    // Don't forget to save the current state 
    // of the Browser window when it's about to be closed 
    win.on('close', () => {

        app.quit();

    });

var ipc = require('electron').ipcMain;

ipc.on('createTag', function(event, data){
	store.set('tags', data);
});

ipc.on('setToggle', function(event, data){
	store.set('hide', data);
});


ipc.on('updateList', function(event, data){
	list = data;
});

ipc.on('notisReady', function(event, data){
	notis.show();
	setTimeout(() => { notis.hide(); setTimeout(() => { saved = false; }, 250);}, 800);	
});

ipc.on('closeAbout', function(event, data){
	about.hide();
});


})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})


app.on('browser-window-blur', () => {
	globalShortcut.unregister('space');
})

app.on('browser-window-focus', () => {
	globalShortcut.register('space', () => {
	    globalShortcut.unregister('space');
		win.hide();
	 })
})


const appFolder = path.dirname(process.execPath)
  const appExe = path.resolve(appFolder, '..', 'Vind.exe')
  const exeName = path.basename(process.execPath)

app.setLoginItemSettings({
    openAtLogin: true,
    args: [
      '--processStart', `"${exeName}"`
    ]
  })

function containsObject(obj, list) {
    
    if(list != undefined){
	    var i;
	    for (i = 0; i < list.length; i++) {
	        if (list[i].content === obj) {
	            return true;
	        }
	    }
	    return false;
	}else{
		return false;
	}
}

