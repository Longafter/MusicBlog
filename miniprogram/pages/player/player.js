// pages/player/player.js
let musiclist = []
// 当前正在播放歌曲的索引
let playingIndex = 0
// 获取全局唯一背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        picUrl: '',
        isPlaying: false,  // false表示不播放，true表示播放
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        playingIndex = options.index
        // 从Storage中取出数据
        musiclist = wx.getStorageSync('musiclist')
        this._loadMusicDetail(options.musicId)
    },

    // 加载当前歌曲
    _loadMusicDetail(musicId) {
        backgroundAudioManager.stop()  // 每次加载歌曲时当前的播放器是停止的
        const musicUrl = `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`
        let music = musiclist[playingIndex]
        console.log('music: ', music)
        wx.setNavigationBarTitle({
          title: music.name,
        })
        this.setData({
            picUrl: music.al.picUrl,
            isPlaying: false,
        })
        wx.showLoading({
          title: '歌曲加载中...',
        })
        backgroundAudioManager.src = musicUrl
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
        this.setData({
            isPlaying: true
        })
        wx.hideLoading()

        // wx.cloud.callFunction({
        //     name: 'music',
        //     data: {
        //         $url: 'musicUrl',
        //         musicId: musicId
        //     }
        // }).then((res) => {
        //     console.log(res)
        // })
    },

    // 播放和暂停的切换
    togglePlaying() {
        // 正在播放
        if (this.data.isPlaying) {
            backgroundAudioManager.pause()
        } else {
            backgroundAudioManager.play()
        }
        this.setData({
            isPlaying: !this.data.isPlaying
        })
    },

    // 上一首
    onPrev() {
        playingIndex--
        // 如果当前歌曲是列表中第一首，那么上一首就需要列表中最后一首
        if (playingIndex < 0) {
            playingIndex = musiclist.length - 1
        }
        this._loadMusicDetail(musiclist[playingIndex].id)
    },

    // 下一首
    onNext() {
        playingIndex++
        // 如果当前歌曲是列表中最后一首，那么下一首就需要列表中第一首
        if (playingIndex === musiclist.length) {
            playingIndex = 0
        }
        this._loadMusicDetail(musiclist[playingIndex].id)
    }
})