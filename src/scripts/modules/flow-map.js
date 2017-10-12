import $                                from 'jquery'
import * as d3                          from 'd3'
import * as topojson                    from 'topojson'
import shuffle                          from '../utils/shuffle'
import throttle                         from '../utils/throttle'
import hexToRgb                         from '../utils/hexToRgb'
import socialMedia                      from './social-media'

const WIDTH = 960
const HEIGHT = 410

class FlowMap {
    constructor(map) {
        this.map = map
        this.$map = $(map)
        this.mode = 'receiving'
        this.yearInterval = null
        this.startYear = this.$map.data('startYear')
        this.endYear = this.$map.data('endYear')
        this.year = this.startYear
        this.colorBG = this.$map.data('bgColor') || '#192A3A'
        this.colorText = this.$map.data('textColor') || '#EFEFEF'
        this.colorMap = this.$map.data('mapColor') || '#EFEFEF'
        this.colorSending = this.$map.data('sendingColor') || '#7E4C7F'
        this.colorReceiving = this.$map.data('receivingColor') || '#23787A'
        this.receivingText = this.$map.data('receivingText') || 'Receiving'
        this.sendingText = this.$map.data('sendingText') || 'Sending'
        this.showSocial = this.$map.data('showSocial') || false
        this.dataArray = []
        this.radiusScale = d3.scaleLinear()
        this.$window = $(window)
    }

    init() {
        $('html, body').css('background', this.colorBG)
        this.addMarkup()
        this.svg.append('rect').attr('width', WIDTH).attr('height', HEIGHT).attr('fill', this.colorBG)
        this.drawMap()
        this.checkHeight()

        // this.$start.on('click', this.timeline.bind(this))
        this.$map.on('click', '.key__item', this.clickKeyItem.bind(this))
        this.$map.on('click', '.key__lozenge', this.clickKeyLozenge.bind(this))

        // $('.map__year-marker').on('click', (e) => {
        //     this.moveToYear($(e.currentTarget).data('year'))
        // })

        // this.$yearTracker.on('change', () => {
        //     this.moveToYear(this.$yearTracker.val())
        // })

        throttle('resize', 'resize.map')
        this.$window.on('resize.map', () => {
            this.checkHeight()
        })

        socialMedia()
    }

    addMarkup() {
        this.$map.css('background', this.colorBG)
        this.$map.css('color', this.colorText)
        const modeColor = this.mode === 'receiving' ? this.colorReceiving : this.colorSending
        let header = '<div class="flow-map__header">'
        if (this.showSocial) {
            header += `<nav class="social-media">
                <a id="share-button" class="social-media__title">
                    <span class="social-media__title-text">Share</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="social-media__title-icon" viewBox="0 0 20.82 14.61">
                        <title>Share</title>
                        <path fill="#fff" d="M20.32,6.08,12.58.17a.8.8,0,0,0-.5-.17.83.83,0,0,0-.83.83V4.16H9.17c-6,0-8.49,3.75-9.16,9.53a.81.81,0,0,0,.83.92.93.93,0,0,0,.71-.37,8.77,8.77,0,0,1,8-4.25h1.71v3.29a.83.83,0,0,0,.83.83.8.8,0,0,0,.5-.17L20.36,8A1.23,1.23,0,0,0,20.32,6.08Z"/>
                    </svg>
                </a>
                <div class="social-media__buttons">
                    <span id="share-close-button" class="social-media__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.47 51.47">
                            <title>Close</title>
                            <line fill="none" stroke="#fff" stroke-miterlimit="10" stroke-width="3" x1="50.29" y1="1.18" x2="1.18" y2="50.29"/>
                            <line fill="none" stroke="#fff" stroke-miterlimit="10" stroke-width="3" x1="50.29" y1="50.29" x2="1.18" y2="1.18"/>
                        </svg>
                    </span>
                    <ul>
                        <li class="social-media__button">
                            <a id="twitter-button" class="social-media__link" href="#0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 16.7 13.57">
                                    <title>social_tw</title>
                                    <path fill="#fff" d="M16.7,1.61a6.84,6.84,0,0,1-2,.54A3.44,3.44,0,0,0,16.24.25a6.83,6.83,0,0,1-2.17.83A3.43,3.43,0,0,0,8.23,4.21,9.73,9.73,0,0,1,1.16.63,3.43,3.43,0,0,0,2.22,5.2,3.41,3.41,0,0,1,.67,4.78a3.43,3.43,0,0,0,2.75,3.4,3.48,3.48,0,0,1-1.55.06,3.42,3.42,0,0,0,3.2,2.38A6.91,6.91,0,0,1,0,12a9.7,9.7,0,0,0,5.25,1.54A9.69,9.69,0,0,0,15,3.38,7,7,0,0,0,16.7,1.61Z"/>
                                </svg>
                                <span class="social-media__text">Twitter</span>
                            </a>
                        </li>
                        <li class="social-media__button">
                            <a id="facebook-button" class="social-media__link" href="#0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 10.05 21.53">
                                    <title>social_fb</title>
                                    <path fill="#fff" d="M6.68,7.05V5.2c0-1,.09-1.49,1.48-1.49H10V0h-3C3.48,0,2.23,1.8,2.23,4.83V7.05H0v3.71H2.23V21.53H6.68V10.76h3L10,7.05Z"/>
                                </svg>
                                <span class="social-media__text">Facebook</span>
                            </a>
                        </li>
                        <li class="social-media__button">
                            <a class="social-media__link" href="mailto:?subject=...">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 23.51 23.5">
                                    <title>social_mail</title>
                                    <path fill="#fff" d="M23.34.32,23.27.24,23.18.16A.72.72,0,0,0,22.55,0L.56,10.93l0,0a.71.71,0,0,0-.5.51.73.73,0,0,0,0,.38H0v0a.76.76,0,0,0,.1.21l.08.09.12.11.12.06.1.05,6.67,3.18,3.88,7.37a42.65,42.65,0,0,1,.11.22.77.77,0,0,0,.11.12l.09.08a.77.77,0,0,0,.21.1h0a.73.73,0,0,0,.38,0,.71.71,0,0,0,.5-.5l0,0L23.48,1A.72.72,0,0,0,23.34.32ZM2.43,11.65l16.4-8.14L7.62,14.13Zm9.39,9.5-3.15-6L20.22,4.22Z"/>
                                </svg>
                                <span class="social-media__text">Email</span>
                            </a>
                        </li>
                        <li class="social-media__button">
                            <a id="whatsapp-button" class="social-media__link" href="whatsapp://send?text=..."
                              data-action="share/whatsapp/share">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 41.93 41.93">
                                    <title>WhatsApp</title>
                                    <path fill="#fff" d="M41.93,20.43A20.62,20.62,0,0,1,11.4,38.31L0,41.93,3.72,31a20.21,20.21,0,0,1-3-10.55,20.59,20.59,0,0,1,41.17,0ZM21.35,3.25A17.26,17.26,0,0,0,4,20.43,17,17,0,0,0,7.34,30.5L5.18,36.87l6.65-2.11A17.32,17.32,0,0,0,38.66,20.43,17.26,17.26,0,0,0,21.35,3.25Zm10.4,21.88c-.13-.21-.46-.33-1-.58s-3-1.46-3.45-1.63-.8-.25-1.14.25-1.3,1.63-1.6,2-.59.38-1.09.13a13.81,13.81,0,0,1-4.06-2.48,15.1,15.1,0,0,1-2.81-3.47c-.29-.5,0-.77.22-1s.51-.58.76-.88a3.36,3.36,0,0,0,.5-.84.91.91,0,0,0,0-.88C18,15.45,16.94,13,16.52,12s-.84-.83-1.13-.83-.63,0-1,0a1.86,1.86,0,0,0-1.35.63,5.6,5.6,0,0,0-1.77,4.18,9.69,9.69,0,0,0,2.06,5.18c.25.33,3.49,5.55,8.62,7.56S27.12,30,28,29.89s3-1.21,3.41-2.38A4.17,4.17,0,0,0,31.74,25.13Z"/>
                                </svg>
                                <span class="social-media__text">WhatsApp</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>`
        }
        header += `<div class="flow-map__heading"><h1 class="flow-map__title">${this.$map.data('title')}</h1><p class="flow-map__description">${this.$map.data('description')}</p></div>`
        header +=
            `<div class="key">
                <a class="key__item key__item--sending">${this.sendingText}</a>
                <span class="key__lozenge"><span class="key__lozenge-disc" style="background:${modeColor}"></span></span>
                <a class="key__item key__item--receiving active">${this.receivingText}</a>
            </div>`
        header += '</div>'
        this.$map.append(header)
        this.$map.append($('<div class="flow-map__visualisation"></div>'))
        this.svg = d3.select('.flow-map__visualisation').append('svg').attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`).attr('class', 'flow-map__svg')
        let timeline = `<div class="timeline" style="background:${this.colorMap};"><span class="timeline__play"></span><div class="timeline__years">`
        const yearFraction = 1 / (this.endYear + 1 - this.startYear)
        this.opacities = shuffle(Array.from(new Array(this.endYear + 1 - this.startYear), (val,index) => (index + 1) * yearFraction))
        const hex = hexToRgb(modeColor)
        for (let i = this.startYear; i < this.endYear + 1; i++) {
            const className = i === this.startYear ? 'timeline__year timeline__year--active' : 'timeline__year'
            timeline += `<span class="${className}" style="width:${100 * yearFraction}%;background:rgba(${hex.r},${hex.g},${hex.b},${this.opacities[i - this.startYear]})">${i}</span>`
        }
        timeline += '</div></div>'
        this.$header = $('.flow-map__header')
        this.$visualisation = $('.flow-map__visualisation')
        this.$visualisation.append($(timeline))
        this.$svg = $('.flow-map__svg')
        this.$timeline = $('.timeline')
        this.$timelineYears = this.$timeline.find('.timeline__year')
    }

    checkHeight() {
        const WINDOW_HEIGHT = this.$window.outerHeight()
        const CONTENT_HEIGHT = this.$svg.outerHeight() + this.$timeline.outerHeight() + this.$header.outerHeight()
        if (CONTENT_HEIGHT < WINDOW_HEIGHT) {
            this.$svg.css('margin-top', `${(WINDOW_HEIGHT - CONTENT_HEIGHT) / 2}px`)
        }
    }

    clickKeyItem(e) {
        const $TARGET = $(e.currentTarget)
        if ($TARGET.hasClass('active')) {
            return
        }

        $TARGET.addClass('active').siblings('.key__item').removeClass('active')
        this.switchMode()
    }

    clickKeyLozenge(e) {
        const $TARGET = $(e.currentTarget)
        $TARGET.siblings('.key__item').toggleClass('active')
        this.switchMode()
    }

    switchMode() {
        this.mode = this.mode === 'receiving' ? 'sending' : 'receiving'
        const color = this.mode === 'receiving' ? this.colorReceiving : this.colorSending
        $('.key__lozenge-disc').css('background', color)

        d3.selectAll('.flow-map__sending-circle')
            .transition()
            .duration(300)
                .attr('r', (d) => {
                    if (d[this.year] !== undefined) {
                        if (this.mode === 'receiving') {
                            return this.radiusScale(parseFloat(d[this.year].receiving_total))
                        } else {
                            return this.radiusScale(parseFloat(d[this.year].sending_total))
                        }
                    } else {
                        return 0
                    }
                })
                .attr('fill', color)
        
        const hex = hexToRgb(color)
        
        this.$timelineYears.each((index, element) => {
            $(element).css('background', `rgba(${hex.r}, ${hex.g}, ${hex.b}, ${this.opacities[index]})`)
        })
    }

    drawMap() {
        const projection = d3.geoEquirectangular()

        const PATH = d3.geoPath()
            .projection(projection)

        const URL = window.location.href.split('/').slice(0, -1).join('/')

        d3.json(URL + '/data/world-map.json', (error, world) => {
            const COUNTRIES = topojson.feature(world, world.objects.mapgeo).features

            const COUNTRY_PATHS = this.svg.selectAll('.flow-map__country')
                .data(COUNTRIES)
                .enter().append('path')
                    .attr('class', 'map__country')
                    .attr('d', PATH)
                    .attr('stroke', this.colorBG)
                    .attr('stroke-width', 0.5)
                    .attr('fill', this.colorMap)
                    .attr('data-name', (d) => d.name)

            d3.csv(URL + '/data/data.csv', (error, data) => {
                let maxAmount = 0
                let minAmount = 0
                let sendingCountryEntry
                let receivingCountryEntry
                for (let i = 0; i < data.length; i++) {
                    sendingCountryEntry = this.dataArray.find(o => o.name === data[i].sending_name)
                    receivingCountryEntry = this.dataArray.find(o => o.name === data[i].receiving_name)
                    minAmount += parseFloat(data[i].amount)
                    if (sendingCountryEntry !== undefined) {
                        if (sendingCountryEntry[data[i].year] !== undefined) {
                            sendingCountryEntry[data[i].year].sending_total += parseFloat(data[i].amount)
                            sendingCountryEntry[data[i].year].receiving_countries.push(data[i].receiving_name)
                        } else {
                            sendingCountryEntry[data[i].year] = {
                                'sending_total': parseFloat(data[i].amount),
                                'receiving_countries': [data[i].receiving_name],
                                'receiving_total': 0,
                                'sending_countries': []
                            }
                        }
                    } else {
                        const object = {
                            'name': data[i].sending_name
                        }
                        object[data[i].year] = {
                            'sending_total': parseFloat(data[i].amount),
                            'receiving_countries': [data[i].receiving_name],
                            'receiving_total': 0,
                            'sending_countries': []
                        }
                        this.dataArray.push(object)
                    }

                    if (receivingCountryEntry !== undefined) {
                        if (receivingCountryEntry[data[i].year] !== undefined) {
                            receivingCountryEntry[data[i].year].receiving_total += parseFloat(data[i].amount)
                            receivingCountryEntry[data[i].year].sending_countries.push(data[i].sending_name)
                        } else {
                            receivingCountryEntry[data[i].year] = {
                                'receiving_total': parseFloat(data[i].amount),
                                'sending_countries': [data[i].sending_name],
                                'sending_total': 0,
                                'receiving_countries': []
                            }
                        }
                    } else {
                        const object = {
                            'name': data[i].receiving_name
                        }
                        object[data[i].year] = {
                            'receiving_total': parseFloat(data[i].amount),
                            'sending_countries': [data[i].receiving_name],
                            'sending_total': 0,
                            'receiving_countries': []
                        }
                        this.dataArray.push(object)
                    }
                }

                for (let j = 0; j < this.dataArray.length; j++) {
                    for (let key in this.dataArray[j]) {
                        if (key !== 'name') {
                            if(this.dataArray[j][key].sending_total > maxAmount) {
                                maxAmount = this.dataArray[j][key].sending_total
                            }

                            if (this.dataArray[j][key].sending_total < minAmount) {
                                minAmount = this.dataArray[j][key].sending_total
                            }

                            if(this.dataArray[j][key].receiving_total > maxAmount) {
                                maxAmount = this.dataArray[j][key].receiving_total
                            }

                            if (this.dataArray[j][key].receiving_total < minAmount) {
                                minAmount = this.dataArray[j][key].receiving_total
                            }
                        }
                    }
                }

                this.radiusScale.domain([minAmount, maxAmount]).range([0, 25])
                this.circleGroups = this.svg.selectAll('.flow-map__group')
                    .data(this.dataArray)
                    .enter().append('g')
                        .attr('transform', (d) => {
                            const COUNTRY_PATH = COUNTRY_PATHS.filter((i) => {
                                return i.properties.name === d.name
                            })
                            return `translate(${PATH.centroid(COUNTRY_PATH.data()[0])})`
                        })
                        .attr('class', 'flow-map__group')

                this.circleGroups.append('circle')
                    .attr('r', (d) => {
                        if (d[this.year] !== undefined) {
                            if (this.mode === 'receiving') {
                                return this.radiusScale(parseFloat(d[this.year].receiving_total))
                            } else {
                                return this.radiusScale(parseFloat(d[this.year].sending_total))
                            }
                        } else {
                            return 0
                        }
                    })
                    .attr('opacity', 0.82)
                    .attr('fill', () => {
                        if (this.mode === 'receiving') {
                            return this.colorReceiving
                        } else {
                            return this.colorSending
                        }
                    })
                    .attr('class', 'flow-map__sending-circle')
            })
        })
    }

    // hideOverlay(d) {
    //     d3.select(`#overlay-${d.id}`).remove()
    // }

    // showOverlay(d) {
    //     if (window.matchMedia('(max-width: 640px)').matches) {
    //         return
    //     }
        
    //     const X = parseInt($(`[data-country="${d.country}"]`).data('x'))
    //     const Y = parseInt($(`[data-country="${d.country}"]`).data('y'))
    //     const SHOW_RIGHT = (X > 510 && X < WIDTH - 350) || X < 350

    //     this.addOverlayGroup(SHOW_RIGHT, X, Y, d)
    //     this.addOverlayBox(SHOW_RIGHT)
    //     this.addOverlayNubbin(SHOW_RIGHT)
    //     this.addOverlayCountryText(SHOW_RIGHT, d)
    //     this.addOverlayCountryType(SHOW_RIGHT, d)

    //     if (d[`sending_${this.year}`] > 0) {     
    //         this.addOverlayTransactionsCircle(COLOR_SENDING, 8, SHOW_RIGHT)       
    //         this.addOverlayTransactionsText(d[`sending_${this.year}`], 2, SHOW_RIGHT)

    //         if (d[`receiving_${this.year}`] > 0) {
    //             this.addOverlayTransactionsCircle(COLOR_RECEIVING, 22, SHOW_RIGHT)
    //             this.addOverlayTransactionsText(d[`receiving_${this.year}`], 16, SHOW_RIGHT)
    //         }
    //     } else {
    //         this.addOverlayTransactionsCircle(COLOR_RECEIVING, 8, SHOW_RIGHT)
    //         this.addOverlayTransactionsText(d[`receiving_${this.year}`], 2, SHOW_RIGHT)
    //     }
    // }

    // addOverlayGroup(SHOW_RIGHT, X, Y, d) {
    //     this.overlay = this.svg.append('g')
    //         .attr('id', `overlay-${d.id}`)
    //         .attr('transform', SHOW_RIGHT ? `translate(${X}, ${Y})` : `translate(${X - 180}, ${Y})`)
    //         .attr('style', 'filter:url(#dropshadow)')
    // }

    // addOverlayBox(SHOW_RIGHT) {
    //     this.overlay.append('rect')
    //         .attr('width', 160)
    //         .attr('height', 84)
    //         .attr('x', SHOW_RIGHT ? 20 : 0)
    //         .attr('y', -42)
    //         .attr('fill', COLOR_WHITE)
    // }

    // addOverlayNubbin(SHOW_RIGHT) {
    //     this.overlay.append('polyline')
    //         .attr('fill', COLOR_WHITE)
    //         .attr('points', SHOW_RIGHT ? '12 0 21 -5 21 5' : '159 -5 159 5 168 0')
    // }

    // addOverlayCountryText(SHOW_RIGHT, d) {
    //     this.overlay.append('text')
    //         .text(d.country)
    //         .attr('font-size', d.country.length > 22 ? '7' : '11')
    //         .attr('font-family', 'proxima-nova')
    //         .attr('x', SHOW_RIGHT ? 40 : 20)
    //         .attr('y', -25)
    //         .attr('fill', COLOR_TEXT)
    //         .attr('dominant-baseline', 'hanging')
    // }

    // addOverlayCountryType(SHOW_RIGHT, d) {
    //     const MODE_STRING = d[`sending_${this.year}`] > 0 && d[`receiving_${this.year}`] > 0 ? 'Sending / receiving country' : d[`sending_${this.year}`] > 0 ? 'Sending country' : 'Receiving country'
    //     this.overlay.append('text')
    //         .text(MODE_STRING)
    //         .attr('font-family', 'proxima-nova')
    //         .attr('font-size', '9')
    //         .attr('x', SHOW_RIGHT ? 40 : 20)
    //         .attr('y', -12)
    //         .attr('fill', COLOR_TEXT)
    //         .attr('dominant-baseline', 'hanging')
    // }

    // addOverlayTransactionsCircle(color, y, SHOW_RIGHT) {
    //     this.overlay.append('circle')
    //         .attr('cx', SHOW_RIGHT ? 44 : 24)
    //         .attr('cy', y)
    //         .attr('r', 4)
    //         .attr('fill', color)
    // }

    // addOverlayTransactionsText(value, y, SHOW_RIGHT) {
    //     this.overlay.append('text')
    //         .text(value === 1 ? value + ' relationship' : value + ' relationships')
    //         .attr('font-family', 'proxima-nova')
    //         .attr('font-size', '11')
    //         .attr('x', SHOW_RIGHT ? 55 : 35)
    //         .attr('y', y)
    //         .attr('fill', COLOR_TEXT)
    //         .attr('dominant-baseline', 'hanging')
    // }

    // timeline(e) {
    //     const $TARGET = $(e.currentTarget)
        
    //     if ($TARGET.hasClass('pause')) {
    //         $TARGET.removeClass('pause')
    //         clearInterval(this.yearInterval)
    //         if (this.year === MAX_YEAR) {
    //             $TARGET.addClass('reset')
    //             this.startText.text('Reset')
    //         } else {
    //             $TARGET.removeClass('reset')
    //             this.startText.text('Animate')
    //         }
    //     } else if ($TARGET.hasClass('reset')) {
    //         this.moveToYear(START_YEAR)
    //     } else {
    //         $TARGET.removeClass('reset')
    //         $TARGET.addClass('pause')
    //         this.startText.text('Pause')
    //         this.yearInterval = setInterval(() => {
    //             this.year += 1
    //             d3.selectAll('.map__marker')
    //                 .transition()
    //                     .duration(1000)
    //                     .attr('r', (d) => d[`${this.mode}_${this.year}`] > 0 ? this.radiusScale(d[`${this.mode}_${this.year}`]) : 0)

    //             this.$yearTracker.val(this.year)

    //             if(this.year >= MAX_YEAR) { 
    //                 clearInterval(this.yearInterval) 
    //                 $TARGET.removeClass('pause')
    //                 this.startText.text('Reset')
    //                 $TARGET.addClass('reset')
    //             }
    //         }, 1000)
    //     }
    // }

    // moveToYear(year) {
    //     this.year = parseInt(year)
    //     clearInterval(this.yearInterval)
    //     this.$start.removeClass('pause')
    //     if (this.year === MAX_YEAR) {
    //         this.$start.addClass('reset')
    //         this.startText.text('Reset')
    //     } else {
    //         this.$start.removeClass('reset')
    //         this.startText.text('Animate')
    //     }
        
    //     d3.selectAll('.map__marker')
    //         .transition()
    //             .duration(1000)
    //             .attr('r', (d) => d[`${this.mode}_${this.year}`] > 0 ? this.radiusScale(d[`${this.mode}_${this.year}`]) : 0)

    //     this.$yearTracker.val(this.year)
    // }
}

export default FlowMap
