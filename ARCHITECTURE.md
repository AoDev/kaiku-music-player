# App architecture

Here is a summary of how the app is structured.
Useful to get started with development.

## File and Folder structure

There are two source folders. One for the `renderer` process and one for the `main` process.

### __src__: the `renderer` process code and assets

* __src/application__: the SPA js code (React + Mobx, related services, ...)
* __src/images__: all images go there
* __src/lib__: contains modules that handle the data under the hood (media library, db wrapper, ...)
* __src/styles__: contains the entry point for styles, variables and skins (less)
* __src/ui-framework__: contains resusable styles and UI components (less / React)

### __app__: the `main` process code
Note: named "app" to follow the [two package.json structure](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure).

* __app/main__: js code for all the main/nodejs logic.

## Webpack build

The client app (renderer) is built with Webpack.

The _entry point_ is in `src/index`.
Everything that Webpack loads is required there.

## Electron build

The app releases are created with [electron-builder](https://github.com/electron-userland/electron-builder).
Currently using the [two package.json structure](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure).

Electron main entry file is in `app/main.js` which is transpiled after in `main.dist.js`.

## Current implementation

### Media libray

- The media library is stored in the browser WebSQL database.
- When the app loads, it will load the media library into memory through the app store.

### Scanning for audio files

- Given a directory, it will look for audio files and parse their audio tag with [music-metadata](https://github.com/Borewit/music-metadata).
- A new entry will be added in the DB.

### Playing songs

- The player is using [Howler.js](https://howlerjs.com/) under the hood.
- It can be manipulated through the UI or keyboard media keys registered in [playerEventManager.js](https://github.com/AoDev/kaiku-music-player/blob/master/app/main/playerEventManager.js)

### App settings

- They are stored in a JSON config file located in the corresponding [user data folder](https://github.com/AoDev/kaiku-music-player/blob/master/app/main/configService/configService.js).
- When the app loads, it will read the settings there. If any setting changes, the file is updated.
