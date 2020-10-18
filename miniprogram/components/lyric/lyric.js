// components/lyric/lyric.js
let lyricHeight = 0  // 一行歌词的高度

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isLyricShow: {
            type: Boolean,
            value: false,
        },
        lyric: {
            type: String,
        }
    },

    /**
     * 属性监听器
     */
    observers: {
        lyric(lrc) {
            if (lrc == '暂无歌词') {
                this.setData({
                  lrcList: [{
                    lyric: lrc,
                    time: 0,
                  }],
                  nowLyricIndex: -1
                })
              } else {
                this._parseLyric(lrc)
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        lrcList: [],
        nowLyricIndex: 0, // 高亮显示歌词的索引
        scrollTop: 0,  // 滚动条滚动的高度
    },

    lifetimes: {
        ready() {
          // 手机宽度均为750rpx
          // rpx <=> px 换算
          wx.getSystemInfo({
            success(res) {
              // console.log(res)
              // 求出1rpx的大小
              lyricHeight = res.screenWidth / 750 * 64
            },
          })
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 获取进度条组件传过来的歌曲当前播放时间
        update(currentTime) {
            // console.log(currentTime)
            let lrcList = this.data.lrcList
            // 没有歌词则直接返回
            if (lrcList.length == 0) {
                return
            }
            if (currentTime > lrcList[lrcList.length - 1].time) {
                if (this.data.nowLyricIndex != -1) {
                  this.setData({
                    nowLyricIndex: -1,
                    scrollTop: lrcList.length * lyricHeight
                  })
                }
            }
            for (let i = 0; i < lrcList.length; i++) {
                if (currentTime <= lrcList[i].time) {
                    this.setData({
                        nowLyricIndex: i - 1,
                        scrollTop: ( i- 1) * lyricHeight
                    })
                    // console.log(this.data.nowLyricIndex)
                    break
                }
            }
        },

        _parseLyric(strLyric) {
            let lines = strLyric.split('\n') // 将歌词从字符串转换为数组
            // console.log(lines)
            let _lrcList = []
            // 逐行解析歌词
            lines.forEach(element => {
                let time = element.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
                if (time != null) {
                    // console.log(time)
                    let lyric = element.split(time)[1]
                    // console.log(lyrics)
                    let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
                    // console.log(timeReg)
                    // 把时间转换为秒
                    let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
                    _lrcList.push({
                        lyric: lyric,
                        time: time2Seconds,
                    })
                }
            })
            this.setData({
                lrcList: _lrcList
            })
        }
    }
})
