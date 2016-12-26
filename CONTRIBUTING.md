# Contributing
I just published the code and there is much to do.  
I'll open issues with the known bugs.

## Pull requests
- Send PR to the `master branch`.
- Commits messages with [Angular convention](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit).
- The code is linted through eslint and stylelint.

A linter is not enough to enforce every aspect of code.  
Just try to follow what you see. Currently it uses [standardjs](https://standardjs.com/).

I am considering something like [prettier](https://github.com/prettier/prettier) if code style becomes an issue to progress.

## Getting started with development

```
git clone git@github.com:AoDev/kaiku-music-player.git
npm install
npm run dev
```

Kaiku will start in dev mode.

## Creating a release

Currently only OSX has been tested although Electron is multi-platform.  
If the app has some success I'll consider distributing the packaged app with a proper installer.

For now, you have to clone the repo and do the following:

### OSX
`npm run package-mac`
This will package the app into `./release/mac`. It will be called Kaiku.app.
You can simply execute it or move it to your `Applications` folder.

### Windows
Need to be tested.

### Linux
Need to be tested.