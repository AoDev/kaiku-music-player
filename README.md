[![CircleCI](https://circleci.com/gh/AoDev/kaiku-music-player/tree/master.svg?style=svg)](https://circleci.com/gh/AoDev/kaiku-music-player/tree/master)

<img align="right" src="https://github.com/AoDev/kaiku-music-player/blob/master/app/images/kaiku-logo.png" width="128" alt="Kaiku logo"/>

# Kaiku Music Player

"Kaiku" means "echo" in Finnish and it is a music player inspired by Winamp.

Built on top of Electron (Chromium + Node.js), React and Mobx.

## Features

- __Music library__. It will look for songs in your computer and index them.
- __Fast search__. It is pretty fast to find a song, even with huge libraries.
- __Customizable__. Built with CSS and React component, it is easy to customize.

### Planned

- __Get music information from online services__ like last.fm API.
- __Radio mode__. Stream some song to your friends.

## Quick peek

[![Kaiku screenshot](http://img.youtube.com/vi/LakkaR4O_ww/maxresdefault.jpg)](https://www.youtube.com/watch?v=LakkaR4O_ww "Kaiku Music Player ")

Click the image to watch a 1 minute video with the player working.

## How to get it?

Currently the app must be built on your computer.  
Have a look at "Creating a release" in [Contributing](https://github.com/AoDev/kaiku-music-player/blob/master/CONTRIBUTING.md) section.

## Current status

I just open sourced it. It works pretty well in general but has a few bugs and limitations that I want to fix first before considering it to be OK.

- I only tested and developed it for OSX. I don't focus on other platforms for now.

### Recommendations and limitations

- Currently the player expects audio tags in your files to build the library correctly.
- Although you can add multiple folders to scan, better scan a unique folder.
- When you scan, the current library will be emptied and replaced.
  (The library needs a rewrite and a different strategy to be more robust and flexible).
- After OSX gets into sleep or you lock the screen, sometimes the player will play two songs at the same time when you play again. Often, you need to restart the player.

## Contributing

Do you want to help? :)
Check the [contributing guidelines](https://github.com/AoDev/kaiku-music-player/blob/master/CONTRIBUTING.md).
There is also a summary of the [app architecture](https://github.com/AoDev/kaiku-music-player/blob/master/ARCHITECTURE.md).

## This project history

A brief recap of the why and how this player was built.

### Why it was created

#### Winamp nostalgic

I built the first version of this player at the beginning of 2015 to have an experience similar to the one I had with Winamp. I used that opportunity to learn React and node-webkit.

I even gave a talk about [building desktop apps with web technologies](https://github.com/AoDev/desktop-apps-with-html-nodejs) where I showed Kaiku, in a meetup in Budapest.

I have been using Winamp forever.  
I wasn't happy with the players available in the Mac ecosystem. Especially that now everything goes "in the cloud", people have moved to services like Spotify.

#### Listening music through video chat does not work.

I talk music with some friends from time to time.  
We play a song and comment it. Unfortunately it's hard to listen to music through the same channel than a video chat. The sound is badly captured and interrupted if you start speaking.
One goal is that you or your friend could be streaming the song, like a radio. P2P feature, hence the name Kaiku. (echo).

### Open source (mid 2017)

Although not ok for any real product, what I built was just fine for me. So I've been enjoying Kaiku for a long time without developing further.

This isn't yet an end-user ready version. But I've been wanting to publish it for a while.
So I have rewritten the UI with ES6 and mobx and will continue to work on it.

I hope some people will get interested ;)
