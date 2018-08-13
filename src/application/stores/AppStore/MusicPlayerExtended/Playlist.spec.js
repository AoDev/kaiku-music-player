import Playlist from './Playlist'

const musicPlayerMock = {
}

const songsMock = [
  {id: 1, title: 'title 1'},
  {id: 2, title: 'title 2'},
  {id: 3, title: 'title 3'},
]

describe('Playlist', () => {
  /** @type {Playlist} */
  let playlist

  beforeEach(() => {
    playlist = new Playlist(musicPlayerMock)
  })

  it('should load songs with setSongs()', () => {
    playlist.setSongs(songsMock)
    expect(playlist.songs).toBe(songsMock)
  })

  describe('playlist.selectSong()', () => {
    it('should allow to set the current song', () => {
      playlist.setSongs(songsMock)
      expect(playlist.currentIndex).toBe(0)
      playlist.selectSong(1)
      expect(playlist.currentIndex).toBe(1)
    })

    it('should return the current song', () => {
      playlist.setSongs(songsMock)
      const song = playlist.selectSong(1)
      expect(playlist.currentIndex).toBe(1)
      expect(song).toBe(songsMock[1])
    })
  })

  it('should allow to be cleared', () => {
    playlist.setSongs(songsMock)
    playlist.selectSong(1)
    playlist.clear()
    expect(playlist.songs).toEqual([])
    expect(playlist.currentIndex).toBe(0)
  })

  it('should setRepeat mode', () => {
    playlist.setRepeat('off')
    expect(playlist.repeatMode).toBe('off')
    playlist.setRepeat('repeatAll')
    expect(playlist.repeatMode).toBe('repeatAll')
    playlist.setRepeat('repeatOne')
    expect(playlist.repeatMode).toBe('repeatOne')

    // TODO: check that it throws in case of invalid repeat value passed
  })

  describe('going to next song', () => {
    it('should NOT do anything if the playlist is empty', () => {
      playlist.goToNext()
      expect(playlist.currentIndex).toBe(-1)
      expect(playlist.currentSong).toBeNull()
    })

    it('should NOT do anything if the repeat mode is "repeatOne"', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(1)
      playlist.setRepeat('repeatOne')
      playlist.goToNext()
      expect(playlist.currentIndex).toBe(1)
    })

    it('should NOT do anything if it is the last song and repeat mode is "off"', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(2)
      playlist.goToNext()
      expect(playlist.currentIndex).toBe(2)
    })

    it('should select first song if the repeat mode is "repeatAll" and it is the last song', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(2) // last song in mocks
      playlist.setRepeat('repeatAll')
      playlist.goToNext()
      expect(playlist.currentIndex).toBe(0)
    })

    it('should select next song in any other case', () => {
      playlist.setSongs(songsMock)
      playlist.goToNext()
      expect(playlist.currentIndex).toBe(1)
      playlist.goToNext()
      expect(playlist.currentIndex).toBe(2)
    })
  })

  describe('going to previous song', () => {
    it('should NOT do anything if the playlist is empty', () => {
      playlist.goToPrev()
      expect(playlist.currentIndex).toBe(-1)
      expect(playlist.currentSong).toBeNull()
    })

    it('should NOT do anything if the repeat mode is "repeatOne"', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(1)
      playlist.setRepeat('repeatOne')
      playlist.goToPrev()
      expect(playlist.currentIndex).toBe(1)
    })

    it('should NOT do anything if it is the first song and repeat mode is "off"', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(0)
      playlist.goToPrev()
      expect(playlist.currentIndex).toBe(0)
    })

    it('should select last song if the repeat mode is "repeatAll" and it is the first song', () => {
      playlist.setSongs(songsMock)
      playlist.setRepeat('repeatAll')
      playlist.goToPrev()
      expect(playlist.currentIndex).toBe(2)
    })

    it('should select previous song in any other case', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(2) // last song in mocks
      playlist.goToPrev()
      expect(playlist.currentIndex).toBe(1)
      playlist.goToPrev()
      expect(playlist.currentIndex).toBe(0)
    })
  })

  describe('computed props', () => {
    it('should return the "current" song and index', () => {
      expect(playlist.currentSong).toBeNull()
      playlist.setSongs(songsMock)
      expect(playlist.currentSong).toBe(songsMock[0])
      playlist.selectSong(1)
      expect(playlist.currentSong).toBe(songsMock[1])
    })

    it('should tell if it "isEmpty"', () => {
      expect(playlist.isEmpty).toBe(true)
      playlist.setSongs(songsMock)
      expect(playlist.isEmpty).toBe(false)
    })

    it('should tell if current song "isFirstSong"', () => {
      playlist.setSongs(songsMock)
      expect(playlist.isFirstSong).toBe(true)
      playlist.selectSong(1)
      expect(playlist.isFirstSong).toBe(false)
    })

    it('should tell if current song "isLastSong"', () => {
      playlist.setSongs(songsMock)
      expect(playlist.isLastSong).toBe(false)
      playlist.selectSong(2)
      expect(playlist.isLastSong).toBe(true)
    })
  })

  describe('removing songs from playlist', () => {
    it('should update the song list', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(0)
      playlist.removeSongsAt([1, 2])
      expect(playlist.currentIndex).toBe(0)
      expect(playlist.songs.length).toBe(1)
    })

    it('should update the song list', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(1)
      playlist.removeSongsAt([0, 2])
      expect(playlist.currentIndex).toBe(0)
      expect(playlist.songs.length).toBe(1)
    })

    it('should update the song list', () => {
      playlist.setSongs(songsMock)
      playlist.selectSong(1)
      playlist.removeSongsAt([1])
      expect(playlist.currentIndex).toBe(-1)
      expect(playlist.songs.length).toBe(2)
    })
  })
})
