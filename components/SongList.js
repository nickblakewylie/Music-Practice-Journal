import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import SetListItem from './SetListItem'

function SongList({songList}) {
    return (
        <View>
            { songList.map(data => (
            <TouchableOpacity key={data.songName}>
                <SetListItem  name={data.songName} difficulty={data.songDifficulty} pTime={data.pTime} />
           </TouchableOpacity>
            ))
             }   
        </View>
    )
}

export default SongList
