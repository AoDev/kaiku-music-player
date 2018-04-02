# App architecture

Here is a summary of how the app is structured.
Useful to get started with development.

## File and Folder structure

All the source code is in the `app` folder.

* __application__: is the `UI` related code (React + Mobx, related services, ...)
* __images__: all images go there
* __lib__: contains modules that handle the data under the hood (media library, db wrapper, ...)
* __main__: contains modules that should be required in the main process runtime
* __styles__: contains the entry point for styles, variables and skins (less)
* __ui-framework__: contains resusable styles and UI components (less / React)
* __utils__: reusable utility functions
* __windowMenu__: code for the native app menu

## Webpack build

The client app (frontend) is built with Webpack.

The _entry point_ is in `app/index`.
Everything that Webpack loads is required there.

## Electron build

The app releases are created with [electron-builder](https://github.com/electron-userland/electron-builder).
Currently using the [two package.json structure](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure).

Electron main entry file is in `app/main.development.js` which is transpiled after in `main.dist.js`.

## Current implementation

### Media libray

- The media library is stored in the browser WebSQL database.
- When the app loads, it will load the media library into memory through the app store.

### Scanning for audio files

- Given a directory, it will look for audio files and parse their audio tag with [musicmetadata](https://github.com/leetreveil/musicmetadata).
- A new entry will be added in the DB.

### Playing songs

- The player is using [Howler.js](https://howlerjs.com/) under the hood.
- It can be manipulated through the UI or keyboard media keys registered in [main.development](https://github.com/AoDev/kaiku-music-player/blob/master/app/main.development.js)

### App settings

- They are stored in a JSON config file located in the corresponding [user data folder](https://github.com/AoDev/kaiku-music-player/blob/master/app/main/configService/configService.js).
- When the app loads, it will read the settings there. If any setting changes, the file is updated.
