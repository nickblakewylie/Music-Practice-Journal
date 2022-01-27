import React from 'react'
import { View } from 'react-native'
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory-native'

function MyChart({chartData}) {
    function getData() {
        var tempData = []
        if(chartData != null){
                for(var i = 0; i < chartData.length; i++){
                    if(Number(chartData[i].practiceTime) != null){
                        tempData.push({x: i, y : Math.round(Number(chartData[i].practiceTime))})
                }
            }
            console.log(tempData)
            return tempData
        }else{
            return [{x: 0, y : 100}, {x: 1, y: 200}]
        }
    }
    return (
        <VictoryChart
        width={400}
        theme={VictoryTheme.material}
        >
            <VictoryLine
                data={getData()}
                x="x"
                y="y"
                animate={{
                    duration: 2000,
                    onLoad: {duration: 1000}
                }}
            />
        </VictoryChart>
    )
}

export default MyChart