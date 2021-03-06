# Vind
<img src="https://i.gyazo.com/09d5228e4a97738793cdc7406be3e005.png" width="100"/>
Electron based software that stores clipboards with **CTRL + B**.<br>

# Features
* Full Text formatting support (newline, spaces etc)
* Multiple tags for different things, if you want one tag for "History" then go ahead. Clicking on the default "General" at the top right will let you choose tags.
* Correct date and time sorting, you can also hide dates if you dont want to show them by pressing the date text at the top left of each date container.
* Themes, you can currently change between 3 themes: ```bright, dark, and stars```

> Default view<br>
<img src="https://i.gyazo.com/9ba827aea1d6f46547abc96dd7a28b39.png" width="200"/><br>

> Clipboard added<br>
<img src="https://i.gyazo.com/dcd86a826a21edbaa3afa9907a8d09be.png" width="200"/><br>

> Tags<br>
<img src="https://i.gyazo.com/9c16f044bbca35f2a5e3589e9fd904f4.png" width="200"/><br>

> Themes<br>
<img src="https://i.gyazo.com/c32b5c233013d1a5812586861f7edce6.png" width="200"/><br>

> Video usage can be found here:<br>
[LINK](https://i.gyazo.com/e410e9086ea3400b934e046a37694fe1.mp4)<br>

# Supported OS
Here is a list of supported OS my wish is to have these in full support but I do not own a Mac and barely use Linux so I cant test it.<br><br>Should be pretty straight forward however, I guess only the shortcuts needs to have a different support such as **CMD + B** for mac.

* Windows 7 => 10
* No Linux support
* No MacOS support

# Prerequisites
Vind is built on Electron, so for you to run the current Vind application you need to have Electron installed

```
npm install electron -g
```

# Getting started
Since Vind is still in development phases there is currently no production installer ready.
You can clone the repo and run it like below:

```
git clone https://github.com/axesve/vind.git
cd ../vind
npm i
npm start
```

# Themes
It is possible to create custom themes, the system is not designed to make it easy but it is possible.<br><br>

* Add your CSS code to ```css/style.css```
* Add a button to the Theme container in ```/index.html``` add this ```<img class="themeBtn" value="YOURTHEMENAME" src="imgs/YOURTHEMELOGO.png">```
* Add YOURTHEMELOGO.png into ```imgs/```

> Would LOVE someone to remake it so people could just put in a new CSS file and push a new theme name into a "theme" array.

# Plans
I was going to add a backend system where all your clipboards where to be stored in a cloud, I got pretty far but did not finish it.

# Contributing
This project is open source, would love for people to come help me build it into something even better!<br><br>

Check the TODO list if there is anything that needs fixing also if you find any features that are missing / could be improved go ahead and just right on it.

> Sadly when I wrote this I did not add that many comments for some reason stupid reason, the code is pretty easy to understand tho.

# Authors
* **Axel Svensson** - *Initial work* - [axesve](https://github.com/axesve) & [@axesve](https://twitter.com/axesve)
* **Fraasi** - *Contributor* - [fraasi](https://github.com/Fraasi/)

