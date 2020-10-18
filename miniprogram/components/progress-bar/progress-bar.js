// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1  // 当前歌曲播放的秒数
let duration = 0  // 当前歌曲总时长，以秒为单位
let isMoving = false  // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题（拖动时滑块乱跳）

Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        showTime: {
            currentTime: '00:00',
            totalTime: '00:00'
        },
        movableDis: 0,  // 进度条滑块距离起点的距离
        progress: 0,  // 进度条进度
    },

    /**
     * 生命周期函数
     */
    lifetimes: {
        ready() {
            this._getMovableDis()
            this._bindBGMEvent()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 拖动进度条触发事件
        onChange(event) {
            console.log(event)
            // 拖动
            // this.data.progress 这种赋值方式只是暂时保存，不会展示在页面
            if (event.detail.source == 'touch') {
                this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100,
                this.data.movableDis = event.detail.x
                isMoving = true
                console.log('change', isMoving)
            }
        },

        // 触摸完成触发事件
        // 小程序中频繁setData会影响性能，所在在触摸完成后setData
        onTouchEnd() {
            const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
            // 改变进度条后时间的变化
            this.setData({
                progress: this.data.progress,
                movableDis: this.data.movableDis,
                ['showTime.currentTime']: `${currentTimeFmt.minutes}:${currentTimeFmt.seconds}`
            })
            // 改变进度条后歌曲节点的变化
            backgroundAudioManager.seek(duration * this.data.progress / 100)
            isMoving = false
            console.log('end', isMoving)
        },

        // 获取进度条宽度
        _getMovableDis() {
            const query = this.createSelectorQuery()
            query.select('.movable-area').boundingClientRect()
            query.select('.movable-view').boundingClientRect()
            query.exec((rect) => {
                movableAreaWidth = rect[0].width  // 进度条宽度
                movableViewWidth = rect[1].width  // 滑块宽度
                console.log(movableAreaWidth, movableViewWidth)
            })
        },

        _bindBGMEvent() {
            backgroundAudioManager.onPlay(() => {
                console.log('onPlay')
                isMoving = false
            })
            backgroundAudioManager.onStop(() => {
                console.log('onStop')
            })
            backgroundAudioManager.onPause(() => {
                console.log('onPause')
            })
            backgroundAudioManager.onWaiting(() => {
                console.log('onWaiting')
            })
            backgroundAudioManager.onCanplay(() => {
                console.log('onCanplay')
                // backgroundAudioManager.duration 获取歌曲时长
                // 如果获取不到歌曲时长，等待一秒再继续获取
                if (typeof backgroundAudioManager.duration != 'undefined') {
                    this._getMusicTime()
                } else {
                    setTimeout(() => {
                        this._getMusicTime()
                    }, 1000)
                }
            })
            backgroundAudioManager.onTimeUpdate(() => {
                console.log('onTimeUpdate')
                if (!isMoving) {
                    // 获取当前播放时间--纯秒的时间格式，需要格式化时间
                    const currentTime = backgroundAudioManager.currentTime
                    // 获取歌曲总时间
                    const duration = backgroundAudioManager.duration
                    // console.log(currentTime)

                    // 歌曲播放时currentTime在一秒间隔内会输出4次值，只需取一次就好
                    const sec = currentTime.toString().split('.')[0]
                    if (sec != currentSec) {
                        // console.log(currentTime)
                        const currentTimeFmt = this._dateFormat(currentTime)
                        this.setData({
                            movableDis: (movableAreaWidth - movableViewWidth) * (currentTime / duration),
                            progress: (currentTime / duration) * 100,
                            ['showTime.currentTime']: `${currentTimeFmt.minutes}:${currentTimeFmt.seconds}`
                        })
                        currentSec = sec
                    }
                }
            })
            backgroundAudioManager.onEnded(() => {
                console.log("onEnded")
                // 组件如何调用父元素方法
                // 抛出musicEnd时间，在父元素接收
                this.triggerEvent('musicEnd')
            })
            backgroundAudioManager.onError((res) => {
                console.error(res.errMsg)
                console.error(res.errCode)
                wx.showToast({
                title: '错误:' + res.errCode,
                })
            })
        },

        // 获取歌曲时长
        _getMusicTime() {
            duration = backgroundAudioManager.duration
            // console.log('duration: ', duration)
            const durationFmt = this._dateFormat(duration)
            // console.log('durationFmt: ', durationFmt)
            this.setData({
                // 如何给对象里的某一项赋值
                ['showTime.totalTime']: `${durationFmt.minutes}:${durationFmt.seconds}`
            })
        },

        // 格式化时间--获取到的歌曲时间是总秒数
        _dateFormat(time) {
            // 分钟
            const minutes = Math.floor(time / 60)  // 向下取整
            // 秒
            const seconds = Math.floor(time % 60)
            return {
                'minutes': this._parseZero(minutes),
                'seconds': this._parseZero(seconds)
            }
        },

        // 时间补'0'
        _parseZero(number) {
            return (number < 10 ? '0' + number : number) 
        }
    }
})
