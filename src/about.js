const { ipcRenderer, remote, shell } = require('electron');

// get the app version from package.json, so on update you dont have to manually change the version here
const appVersion = remote.app.getVersion();

// no need for jquery for simple dom manipulation
// you can use this simple helper function to get the dom-elements
const _q = function(id) {
  return document.querySelector(id);
}

const paragraph = _q('#version-link');
// set the version and link to paragraph element
paragraph.innerHTML = `Version ${appVersion} BETA<br>https://github.com/axesve/vind`;
// Open link in users default browser & close about when clicked
paragraph.onclick = function() {
  shell.openExternal('https://github.com/axesve/vind');
  ipcRenderer.send('closeAbout', "");
}

_q('#close').onclick = function() {
  ipcRenderer.send('closeAbout', "");
}

