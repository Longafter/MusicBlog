// pages/player/player.js
let musiclist = []
// 当前正在播放歌曲的索引
let playingIndex = 0
// 获取全局唯一背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        picUrl: '',
        isPlaying: false,  // false表示不播放，true表示播放
        isLyricShow: false,  // false不显示歌词，true表示显示
        lyric: '',
        isSame: false  // 表示两次点击是否为同一首歌
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
        if (musicId == app.getPlayingMusicId()) {
            this.setData({
                isSame: true
            })
        } else {
            this.setData({
                isSame: false
            })
        }
        if (!this.data.isSame) {
            backgroundAudioManager.stop()  // 每次加载歌曲时当前的播放器是停止的
        }
        const musicUrl = `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`
        // if (musicUrl == null) {
        //     wx.showToast({
        //       title: '无权限播放QAQ',
        //     })
        //     return
        // }
        let music = musiclist[playingIndex]
        console.log('music: ', music)
        wx.setNavigationBarTitle({
          title: music.name,
        })
        this.setData({
            picUrl: music.al.picUrl,
            isPlaying: false,
        })
        app.setPlayingMusicId(musicId)
        wx.showLoading({
          title: '歌曲加载中...',
        })
        if (!this.data.isSame) {
            backgroundAudioManager.src = musicUrl
            backgroundAudioManager.title = music.name
            backgroundAudioManager.coverImgUrl = music.al.picUrl
            backgroundAudioManager.singer = music.ar[0].name
            backgroundAudioManager.epname = music.al.name
        }
        this.setData({
            isPlaying: true
        })
        wx.hideLoading()

        // 加载歌词
        wx.cloud.callFunction({
            name: 'music',
            data: {
                $url: 'lyric',
                musicId: musicId
            }
        }).then((res) => {
            console.log("[歌词][获取成功]", res)
            let lyric = '暂无歌词'
            const lrc = JSON.parse(res.result).lrc
            if (lrc) {
                lyric = lrc.lyric
            }
            this.setData({
                lyric: lyric
            })
        }).catch((err) => {
            console.log("[歌词][获取失败]", err)
        })
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
    },

    // 点击封面切换歌词
    onChangeLyricShow() {
        this.setData({
            isLyricShow: !this.data.isLyricShow
        })
    },

    // 将进度条组件里的currentTime传递到歌词组件里
    timeUpdate(event) {
        // 根据类名选择相应组件
        this.selectComponent('.lyric').update(event.detail.currentTime)
    },

    onPlay() {
        this.setData({
            isPlaying: true,
        })
    },
    onPause() {
        this.setData({
            isPlaying: false,
        })
    }
})