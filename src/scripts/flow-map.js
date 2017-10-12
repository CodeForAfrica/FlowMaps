import $                                from 'jquery'
import FlowMap                          from './modules/flow-map'

const $map = $('.flow-map')
$map.each((index, element) => {
    const flowMap = new FlowMap(element)
    flowMap.init()
})
