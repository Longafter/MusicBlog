// components/musiclist/musiclist.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        musiclist: {
            type: Array
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        playingId: -1
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onSelectMusic(event) {
            let musicid = event.currentTarget.dataset.musicid
            console.log("被选中歌曲", musicid)
            this.setData({
                playingId: musicid
            })
        }
    }
})
