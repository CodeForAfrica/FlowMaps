import $                                from 'jquery'
import * as d3                          from 'd3'
import * as topojson                    from 'topojson'
import shuffle                          from '../utils/shuffle'
import throttle                         from '../utils/throttle'
import hexToRgb                         from '../utils/hexToRgb'
import socialMedia                      from './social-media'
import numberWithCommas                 from '../utils/numberWithCommas'

// const WIDTH = 960
const HEIGHT = 410
const COLOR_TEXT = '#192A3A'

class FlowMap {
    constructor(map) {
        this.map = map
        this.$map = $(map)
        this.mode = 'receiving'
        this.yearInterval = null
        this.startYear = this.$map.data('startYear')
        this.endYear = this.$map.data('endYear')
        this.yearGap = this.$map.data('yearGap') || 1
        this.year = this.startYear
        this.colorBG = this.$map.data('bgColor') || '#192A3A'
        this.colorText = this.$map.data('textColor') || '#EFEFEF'
        this.colorMap = this.$map.data('mapColor') || '#EFEFEF'
        this.colorSending = this.$map.data('sendingColor') || '#7E4C7F'
        this.colorReceiving = this.$map.data('receivingColor') || '#23787A'
        this.receivingText = this.$map.data('receivingText') || 'Receiving'
        this.sendingText = this.$map.data('sendingText') || 'Sending'
        this.showSocial = this.$map.data('showSocial') || false
        this.overlayTextPre = this.$map.data('overlayTextPre') || ''
        this.overlayTextPost = this.$map.data('overlayTextPost') || ''
        this.zoom = this.$map.data('zoom') || 1
        this.zoomX = this.$map.data('zoomX') || '50%'
        this.zoomY = this.$map.data('zoomY') || '50%'
        this.width = 410 * this.$map.data('ratio') || 960
        this.dataArray = []
        this.radiusScale = d3.scaleLinear()
        this.$window = $(window)
        this.multipleTimelineLines = false
    }

    init() {
        $('html, body').css('background', this.colorBG)
        this.addMarkup()
        this.setupGradient()
        this.svg.append('rect').attr('width', this.width).attr('height', HEIGHT).attr('fill', this.colorBG)
        if (this.zoom !== 1) {
            $('.flow-map__zoom-wrapper').css({
                'transform': `scale(${this.zoom})`,
                'transform-origin': `${this.zoomX} ${this.zoomY}`
            })
        }
        this.drawMap()
        this.checkHeight()

        this.$start.on('click', this.timeline.bind(this))
        this.$map.on('click', '.key__item', this.clickKeyItem.bind(this))
        this.$map.on('click', '.key__lozenge', this.clickKeyLozenge.bind(this))

        this.$timelineYears.on('click', (e) => {
            const $target = $(e.currentTarget)
            if ($target.hasClass('timeline__year--active')) {
                return false
            } else {
                $target.addClass('timeline__year--active').siblings().removeClass('timeline__year--active')
                this.moveToYear($target.data('year'))
            }
        })

        throttle('resize', 'resize.map')
        this.$window.on('resize.map', () => {
            this.checkHeight()
            this.checkWidth()
        })

        socialMedia()
    }

    setupGradient() {
        const svgDefs = this.svg.append('defs')

        const sendingGradient = svgDefs.append('linearGradient')
            .attr('id', 'flow-gradient-sending')
        const receivingGradient = svgDefs.append('linearGradient')
            .attr('id', 'flow-gradient-receiving')

        // Create the stops of the main gradient. Each stop will be assigned
        // a class to style the stop using CSS.
        sendingGradient.append('stop')
            .attr('stop-color', this.colorReceiving)
            .attr('offset', '0%')

        sendingGradient.append('stop')
            .attr('stop-color', this.colorSending)
            .attr('offset', '100%')

        receivingGradient.append('stop')
            .attr('stop-color', this.colorSending)
            .attr('offset', '0%')

        receivingGradient.append('stop')
            .attr('stop-color', this.colorReceiving)
            .attr('offset', '100%')
    }

    addMarkup() {
        this.$map.css('background', this.colorBG)
        this.$map.css('color', this.colorText)
        this.$map.css('fill', this.colorText)
        this.$map.css('stroke', this.colorText)
        const modeColor = this.mode === 'receiving' ? this.colorReceiving : this.colorSending
        let header = '<div class="flow-map__header">'
        if (this.showSocial) {
            header += `<nav class="social-media">
                <a id="share-button" class="social-media__title">
                    <span class="social-media__title-text">Share</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="social-media__title-icon" viewBox="0 0 20.82 14.61">
                        <title>Share</title>
                        <path stroke="none" d="M20.32,6.08,12.58.17a.8.8,0,0,0-.5-.17.83.83,0,0,0-.83.83V4.16H9.17c-6,0-8.49,3.75-9.16,9.53a.81.81,0,0,0,.83.92.93.93,0,0,0,.71-.37,8.77,8.77,0,0,1,8-4.25h1.71v3.29a.83.83,0,0,0,.83.83.8.8,0,0,0,.5-.17L20.36,8A1.23,1.23,0,0,0,20.32,6.08Z"/>
                    </svg>
                </a>
                <div class="social-media__buttons">
                    <span id="share-close-button" class="social-media__close">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 51.47 51.47">
                            <title>Close</title>
                            <line fill="none" stroke-miterlimit="10" stroke-width="3" x1="50.29" y1="1.18" x2="1.18" y2="50.29"/>
                            <line fill="none" stroke-miterlimit="10" stroke-width="3" x1="50.29" y1="50.29" x2="1.18" y2="1.18"/>
                        </svg>
                    </span>
                    <ul>
                        <li class="social-media__button">
                            <a id="twitter-button" class="social-media__link" href="#0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 16.7 13.57">
                                    <title>social_tw</title>
                                    <path stroke="none" d="M16.7,1.61a6.84,6.84,0,0,1-2,.54A3.44,3.44,0,0,0,16.24.25a6.83,6.83,0,0,1-2.17.83A3.43,3.43,0,0,0,8.23,4.21,9.73,9.73,0,0,1,1.16.63,3.43,3.43,0,0,0,2.22,5.2,3.41,3.41,0,0,1,.67,4.78a3.43,3.43,0,0,0,2.75,3.4,3.48,3.48,0,0,1-1.55.06,3.42,3.42,0,0,0,3.2,2.38A6.91,6.91,0,0,1,0,12a9.7,9.7,0,0,0,5.25,1.54A9.69,9.69,0,0,0,15,3.38,7,7,0,0,0,16.7,1.61Z"/>
                                </svg>
                                <span class="social-media__text">Twitter</span>
                            </a>
                        </li>
                        <li class="social-media__button">
                            <a id="facebook-button" class="social-media__link" href="#0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 10.05 21.53">
                                    <title>social_fb</title>
                                    <path stroke="none" d="M6.68,7.05V5.2c0-1,.09-1.49,1.48-1.49H10V0h-3C3.48,0,2.23,1.8,2.23,4.83V7.05H0v3.71H2.23V21.53H6.68V10.76h3L10,7.05Z"/>
                                </svg>
                                <span class="social-media__text">Facebook</span>
                            </a>
                        </li>
                        <li class="social-media__button">
                            <a class="social-media__link" href="mailto:?subject=...">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 23.51 23.5">
                                    <title>social_mail</title>
                                    <path stroke="none" d="M23.34.32,23.27.24,23.18.16A.72.72,0,0,0,22.55,0L.56,10.93l0,0a.71.71,0,0,0-.5.51.73.73,0,0,0,0,.38H0v0a.76.76,0,0,0,.1.21l.08.09.12.11.12.06.1.05,6.67,3.18,3.88,7.37a42.65,42.65,0,0,1,.11.22.77.77,0,0,0,.11.12l.09.08a.77.77,0,0,0,.21.1h0a.73.73,0,0,0,.38,0,.71.71,0,0,0,.5-.5l0,0L23.48,1A.72.72,0,0,0,23.34.32ZM2.43,11.65l16.4-8.14L7.62,14.13Zm9.39,9.5-3.15-6L20.22,4.22Z"/>
                                </svg>
                                <span class="social-media__text">Email</span>
                            </a>
                        </li>
                        <li class="social-media__button">
                            <a id="whatsapp-button" class="social-media__link" href="whatsapp://send?text=..."
                              data-action="share/whatsapp/share">
                                <svg xmlns="http://www.w3.org/2000/svg" class="social-media__icon" viewBox="0 0 41.93 41.93">
                                    <title>WhatsApp</title>
                                    <path stroke="none" d="M41.93,20.43A20.62,20.62,0,0,1,11.4,38.31L0,41.93,3.72,31a20.21,20.21,0,0,1-3-10.55,20.59,20.59,0,0,1,41.17,0ZM21.35,3.25A17.26,17.26,0,0,0,4,20.43,17,17,0,0,0,7.34,30.5L5.18,36.87l6.65-2.11A17.32,17.32,0,0,0,38.66,20.43,17.26,17.26,0,0,0,21.35,3.25Zm10.4,21.88c-.13-.21-.46-.33-1-.58s-3-1.46-3.45-1.63-.8-.25-1.14.25-1.3,1.63-1.6,2-.59.38-1.09.13a13.81,13.81,0,0,1-4.06-2.48,15.1,15.1,0,0,1-2.81-3.47c-.29-.5,0-.77.22-1s.51-.58.76-.88a3.36,3.36,0,0,0,.5-.84.91.91,0,0,0,0-.88C18,15.45,16.94,13,16.52,12s-.84-.83-1.13-.83-.63,0-1,0a1.86,1.86,0,0,0-1.35.63,5.6,5.6,0,0,0-1.77,4.18,9.69,9.69,0,0,0,2.06,5.18c.25.33,3.49,5.55,8.62,7.56S27.12,30,28,29.89s3-1.21,3.41-2.38A4.17,4.17,0,0,0,31.74,25.13Z"/>
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
        this.$map.append($('<div class="flow-map__visualisation"><div class="flow-map__svg-wrapper"><div class="flow-map__zoom-wrapper"></div></div></div>'))

        this.svg = d3.select('.flow-map__zoom-wrapper').append('svg').attr('viewBox', `0 0 ${this.width} ${HEIGHT}`).attr('class', 'flow-map__svg').attr('stroke', 'none')
        this.numberOfYears = (this.endYear - this.startYear) / this.yearGap + 1
        this.$header = $('.flow-map__header')
        this.$visualisation = $('.flow-map__visualisation')

        if (this.numberOfYears > 1) {
            let timeline = `<div class="timeline" style="background:${this.colorMap};"><span class="timeline__play"></span><div class="timeline__years">`
            this.yearFraction = 1 / this.numberOfYears
            if (this.yearFraction * (this.$window.outerWidth() - 55) < 50) {
                let maxPerRow = Math.floor(this.$window.outerWidth() - 55) / 50
                let rows = Math.ceil(this.numberOfYears / maxPerRow)
                this.multipleTimelineLines = true
                this.yearFraction = 1 / Math.floor(this.numberOfYears / rows)
            }
            this.opacities = shuffle(Array.from(new Array((this.endYear - this.startYear) / this.yearGap + 1), (val,index) => (index + 1) * this.yearFraction))
            const hex = hexToRgb(modeColor)
            for (let i = this.startYear; i < this.endYear + 1; i += this.yearGap) {
                const className = i === this.startYear ? 'timeline__year timeline__year--active' : 'timeline__year'
                timeline += `<span class="${className}" data-year="${i}" style="width:${100 * this.yearFraction}%;background:rgba(${hex.r},${hex.g},${hex.b},${this.opacities[(i - this.startYear) / this.yearGap]})">${i}</span>`
            }
            timeline += '</div></div>'    
            this.$visualisation.append($(timeline))
        }

        this.$svgWrapper = $('.flow-map__svg-wrapper')
        this.$svg = $('.flow-map__svg')
        this.$timeline = $('.timeline')
        this.$timelineYears = this.$timeline.find('.timeline__year')
        this.$start = $('.timeline__play')
    }

    checkHeight() {
        const WINDOW_HEIGHT = this.$window.outerHeight()
        const CONTENT_HEIGHT = this.$svgWrapper.outerHeight() + this.$timeline.outerHeight() + this.$header.outerHeight()
        if (CONTENT_HEIGHT < WINDOW_HEIGHT) {
            this.$svgWrapper.css('margin-top', `${(WINDOW_HEIGHT - CONTENT_HEIGHT) / 2}px`)
        }
    }

    checkWidth() {
        if (this.yearFraction * (this.$window.outerWidth() - 55) < 50) {
            let maxPerRow = Math.floor(this.$window.outerWidth() - 55) / 50
            let rows = Math.ceil(this.numberOfYears / maxPerRow)
            this.yearFraction = 1 / Math.floor(this.numberOfYears / rows)
            this.multipleTimelineLines = true
            this.$timelineYears.css('width', `${100 * this.yearFraction}%`)
        } else if (this.multipleTimelineLines && this.yearFraction * (this.$window.outerWidth() - 55) >= 50) {
            let maxPerRow = Math.floor(this.$window.outerWidth() - 55) / 50
            let rows = Math.ceil(this.numberOfYears / maxPerRow)
            if (rows === 1) {
                this.multipleTimelineLines = false
            }
            this.yearFraction = 1 / Math.floor(this.numberOfYears / rows)
            this.$timelineYears.css('width', `${100 * this.yearFraction}%`)
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

        this.circles
            .transition()
            .duration(300)
                .attr('r', (d) => {
                    if (d[this.year] !== undefined) {
                        if (this.mode === 'receiving') {
                            return d[this.year].receiving_total > 0 ? this.radiusScale(parseFloat(d[this.year].receiving_total)) : 0
                        } else {
                            return d[this.year].sending_total > 0 ? this.radiusScale(parseFloat(d[this.year].sending_total)) : 0
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

        const BASE_URL = window.location.href.split('/').slice(0, -1).join('/')
        let mapUrl = this.$map.data('topojson') ? this.$map.data('topojson') : BASE_URL + '/data/topojson.json'
        let dataUrl = this.$map.data('data') ? this.$map.data('data') : BASE_URL + '/data/data.csv'
        d3.json(mapUrl, (error, map) => {
            const COUNTRIES = topojson.feature(map, map.objects.subunits).features

            const COUNTRY_PATHS = this.svg.selectAll('.flow-map__country')
                .data(COUNTRIES)
                .enter().append('path')
                    .attr('class', 'map__country')
                    .attr('d', PATH)
                    .attr('stroke', this.colorBG)
                    .attr('stroke-width', 0.5)
                    .attr('fill', this.colorMap)
                    .attr('data-name', (d) => d.name)
                    .on('mouseover', this.activateCountry.bind(this))
                    .on('mouseout', this.deactivateCountry.bind(this))

            d3.csv(dataUrl, (error, data) => {
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
                            sendingCountryEntry[data[i].year].amounts_sent.push(parseFloat(data[i].amount))
                        } else {
                            sendingCountryEntry[data[i].year] = {
                                'sending_total': parseFloat(data[i].amount),
                                'receiving_countries': [data[i].receiving_name],
                                'amounts_sent': [parseFloat(data[i].amount)],
                                'receiving_total': 0,
                                'sending_countries': [],
                                'amounts_received': []
                            }
                        }
                    } else {
                        const COUNTRY_PATH = COUNTRY_PATHS.filter((x) => {
                            return x.properties.name === data[i].sending_name
                        })

                        const object = {
                            'name': data[i].sending_name,
                            'id': `${i}-s`,
                            'center': PATH.centroid(COUNTRY_PATH.data()[0])
                        }
                        object[data[i].year] = {
                            'sending_total': parseFloat(data[i].amount),
                            'receiving_countries': [data[i].receiving_name],
                            'amounts_sent': [parseFloat(data[i].amount)],
                            'receiving_total': 0,
                            'sending_countries': [],
                            'amounts_received': []
                        }
                        this.dataArray.push(object)
                    }

                    if (receivingCountryEntry !== undefined) {
                        if (receivingCountryEntry[data[i].year] !== undefined) {
                            receivingCountryEntry[data[i].year].receiving_total += parseFloat(data[i].amount)
                            receivingCountryEntry[data[i].year].sending_countries.push(data[i].sending_name)
                            receivingCountryEntry[data[i].year].amounts_received.push(parseFloat(data[i].amount))
                        } else {
                            receivingCountryEntry[data[i].year] = {
                                'receiving_total': parseFloat(data[i].amount),
                                'sending_countries': [data[i].sending_name],
                                'amounts_received': [parseFloat(data[i].amount)],
                                'sending_total': 0,
                                'receiving_countries': [],
                                'amounts_sent': []
                            }
                        }
                    } else {
                        const COUNTRY_PATH = COUNTRY_PATHS.filter((x) => {
                            return x.properties.name === data[i].receiving_name
                        })

                        const object = {
                            'name': data[i].receiving_name,
                            'id': `${i}-r`,
                            'center': PATH.centroid(COUNTRY_PATH.data()[0])
                        }
                        object[data[i].year] = {
                            'receiving_total': parseFloat(data[i].amount),
                            'sending_countries': [data[i].sending_name],
                            'amounts_received': [parseFloat(data[i].amount)],
                            'sending_total': 0,
                            'receiving_countries': [],
                            'amounts_sent': []
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

                            if (this.dataArray[j][key].sending_total < minAmount && this.dataArray[j][key].sending_total !== 0) {
                                minAmount = this.dataArray[j][key].sending_total
                            }

                            if(this.dataArray[j][key].receiving_total > maxAmount) {
                                maxAmount = this.dataArray[j][key].receiving_total
                            }

                            if (this.dataArray[j][key].receiving_total < minAmount && this.dataArray[j][key].receiving_total !== 0) {
                                minAmount = this.dataArray[j][key].receiving_total
                            }
                        }
                    }
                }

                this.radiusScale.domain([minAmount, maxAmount]).range([2, 25])
                this.circleGroups = this.svg.selectAll('.flow-map__group')
                    .data(this.dataArray)
                    .enter().append('g')
                        .attr('transform', (d) => `translate(${d.center})`)
                        .attr('data-x', (d) => d.center[0])
                        .attr('data-y', (d) => d.center[1])
                        .attr('class', 'flow-map__group')
                        .attr('id', (d) => `group-${d.id}`)
                        .attr('data-sending', (d) => d[this.year] !== undefined && d[this.year].sending_total > 0)
                        .attr('data-receiving', (d) => d[this.year] !== undefined && d[this.year].receiving_total > 0)
                        .on('mouseover', this.activateGroup.bind(this))
                        .on('mouseout', this.deactivateGroup.bind(this))


                this.circles = this.circleGroups.append('circle')
                    .attr('r', (d) => {
                        if (d[this.year] !== undefined) {
                            if (this.mode === 'receiving') {
                                return d[this.year].receiving_total > 0 ? this.radiusScale(parseFloat(d[this.year].receiving_total)) : 0
                            } else {
                                return d[this.year].sending_total > 0 ? this.radiusScale(parseFloat(d[this.year].sending_total)) : 0
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
                    .attr('id', (d) => `circle-${d.id}`)
            })
        })
    }

    activateCountry(d) {
        let name = d.properties.name
        let data = this.dataArray.find((element) => element.name === name)
        if (data !== undefined) {
            let group = $(`#group-${data.id}`)
            if (group.length > 0 && group.data(this.mode) === true) {
                this.activateGroup(data)
            }
        }
    }

    deactivateCountry(d) {
        let name = d.properties.name
        let data = this.dataArray.find((element) => element.name === name)
        if (data !== undefined) {
            this.deactivateGroup(data)
        }
    }

    activateGroup(d) {
        let group = $(`#group-${d.id}`)
        this.circles.filter((data) => data.id !== d.id)
            .transition()
            .duration(300)
                .attr('r', (data) => {
                    if (this.mode === 'receiving' && d[this.year].sending_countries.indexOf(data.name) >= 0) {
                        const index = data[this.year].receiving_countries.indexOf(d.name)
                        return data[this.year].amounts_sent[index] > 0 ? this.radiusScale(parseFloat(data[this.year].amounts_sent[index])) : 0
                    } else if (this.mode === 'sending' && d[this.year].receiving_countries.indexOf(data.name) >= 0) {
                        const index = data[this.year].sending_countries.indexOf(d.name)
                        return data[this.year].amounts_received[index] > 0 ? this.radiusScale(parseFloat(data[this.year].amounts_received[index])) : 0
                    } else {
                        return 0
                    }
                })
                .attr('fill', this.mode === 'receiving' ? this.colorSending : this.colorReceiving)
                .attr('opacity', 1)
        
        d3.select(`#group-${d.id}`).raise().select('circle')
            .transition()
            .duration(300)
                .attr('r', () => {
                    if (this.mode === 'receiving') {
                        return d[this.year].receiving_total > 0 ? this.radiusScale(parseFloat(d[this.year].receiving_total)) : 0
                    } else {
                        return d[this.year].sending_total > 0 ? this.radiusScale(parseFloat(d[this.year].sending_total)) : 0
                    }
                })
                .attr('fill', this.mode === 'receiving' ? this.colorReceiving : this.colorSending)
                .attr('opacity', 1)
        
        this.circleGroups.filter((data) => {
            if ((this.mode === 'receiving' && d[this.year].sending_countries.indexOf(data.name) >= 0) || (this.mode === 'sending' && d[this.year].receiving_countries.indexOf(data.name) >= 0)) {
                return true
            } else {
                return false
            }
        }).insert('line', ':first-child')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (data) => {
                const length = Math.sqrt((parseInt(group.data('x')) - parseInt(data.center[0])) * (parseInt(group.data('x')) - parseInt(data.center[0])) + (parseInt(group.data('y')) - parseInt(data.center[1])) * (parseInt(group.data('y')) - parseInt(data.center[1])))
                return length
            })
            .attr('y2', 0.1)
            .attr('stroke-width', 2)
            .attr('stroke', this.mode === 'receiving' ? 'url(#flow-gradient-receiving)' : 'url(#flow-gradient-sending)')
            .attr('transform', (data) => {
                let angle = Math.atan((group.data('y') - data.center[1]) / (group.data('x') - data.center[0]))
                if (group.data('x') < data.center[0]) {
                    angle += Math.PI
                }
                return `rotate(${angle * 180 / Math.PI}, 0, 0)`
            })
            .attr('class', 'flow-map__line')
            .attr('stroke-dasharray', (data) => {
                const length = Math.sqrt((parseInt(group.data('x')) - parseInt(data.center[0])) * (parseInt(group.data('x')) - parseInt(data.center[0])) + (parseInt(group.data('y')) - parseInt(data.center[1])) * (parseInt(group.data('y')) - parseInt(data.center[1])))
                return `${length}, ${length}`
            })
            .attr('stroke-dashoffset', (data) => {
                const length = Math.sqrt((parseInt(group.data('x')) - parseInt(data.center[0])) * (parseInt(group.data('x')) - parseInt(data.center[0])) + (parseInt(group.data('y')) - parseInt(data.center[1])) * (parseInt(group.data('y')) - parseInt(data.center[1])))
                return this.mode === 'receiving' ? length : -length
            })
            .transition()
                .delay(300)
                .duration(500)
                .attr('stroke-dashoffset', 0)

        this.showOverlay(d, group)
    }

    deactivateGroup(d) {
        this.hideOverlay(d)
        d3.selectAll('.flow-map__line').remove()

        this.circles.transition()
            .duration(300)
                .attr('r', (data) => {
                    if (data[this.year] !== undefined) {
                        if (this.mode === 'receiving') {
                            return data[this.year].receiving_total > 0 ? this.radiusScale(parseFloat(data[this.year].receiving_total)) : 0
                        } else {
                            return data[this.year].sending_total > 0 ? this.radiusScale(parseFloat(data[this.year].sending_total)) : 0
                        }
                    } else {
                        return 0
                    }
                })
                .attr('fill', this.mode === 'receiving' ? this.colorReceiving : this.colorSending)
                .attr('opacity', 0.82)
    }

    hideOverlay(d) {
        d3.select(`#overlay-${d.id}`).remove()
    }

    showOverlay(d, group) {
        if (window.matchMedia('(max-width: 640px)').matches) {
            return
        }
        let X = parseInt(group.data('x'))
        const Y = parseInt(group.data('y'))
        let offLeft = false
        let offRight = false

        if (X < 80) {
            X = X + 80
            offLeft = true
        } else if (X > this.width - 80) {
            X = X - 80
            offRight = true
        }

        this.addOverlayGroup(X, Y, d)
        this.addOverlayBox()
        this.addOverlayNubbin(offLeft, offRight)
        this.addOverlayCountryText(d)
        this.addOverlayCountryType(d)
    }

    addOverlayGroup(X, Y, d) {
        let radius = 0
        if (this.mode === 'receiving') {
            radius = this.radiusScale(parseFloat(d[this.year].receiving_total))
        } else {
            radius = this.radiusScale(parseFloat(d[this.year].sending_total))
        }
        this.overlay = this.svg.append('g')
            .attr('id', `overlay-${d.id}`)
            .attr('transform', `translate(${X - 80}, ${Y - 48 - radius})`)
    }

    addOverlayBox() {
        this.overlay.append('rect')
            .attr('width', 160)
            .attr('height', 40)
            .attr('x', 0)
            .attr('y', 0)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', '#FFFFFF')
    }

    addOverlayNubbin(offLeft, offRight) {
        if (offLeft) {
            this.overlay.append('polyline')
                .attr('fill', '#FFFFFF')
                .attr('points', '0 30 10 39 0 45')
        } else if (offRight) {
            this.overlay.append('polyline')
                .attr('fill', '#FFFFFF')
                .attr('points', '150 39 160 30 160 45')
        } else {
            this.overlay.append('polyline')
                .attr('fill', '#FFFFFF')
                .attr('points', '75 39 85 39 80 45')
        }
    }

    addOverlayCountryText(d) {
        this.overlay.append('text')
            .text(d.name.toUpperCase())
            .attr('font-size', d.name.length > 22 ? '7' : '11')
            .attr('font-family', 'proxima-nova')
            .attr('font-weight', 'light')
            .attr('x', 80)
            .attr('y', 18)
            .attr('fill', COLOR_TEXT)
            .attr('text-anchor', 'middle')
    }

    addOverlayCountryType(d) {
        let amount = this.mode === 'receiving' ? d[this.year].receiving_total : d[this.year].sending_total
        if (Math.round(amount) >= 10) {
            amount = numberWithCommas(Math.round(amount))
        } else {
            amount = Math.round(amount * 10) / 10
        }
        
        amount = this.overlayTextPre + amount + this.overlayTextPost
        this.overlay.append('text')
            .text(amount)
            .attr('font-family', 'proxima-nova')
            .attr('font-size', '9')
            .attr('font-weight', 'bold')
            .attr('x', 80)
            .attr('y', 30)
            .attr('fill', COLOR_TEXT)
            .attr('text-anchor', 'middle')
    }

    timeline(e) {
        const $TARGET = $(e.currentTarget)
        
        if ($TARGET.hasClass('timeline__pause')) {
            $TARGET.removeClass('timeline__pause')
            clearInterval(this.yearInterval)
            if (this.year === this.endYear) {
                $TARGET.addClass('timeline__reset')
            } else {
                $TARGET.removeClass('timeline__reset')
            }
        } else if ($TARGET.hasClass('timeline__reset')) {
            this.$timelineYears.filter(`[data-year=${this.startYear}]`).addClass('timeline__year--active').siblings().removeClass('timeline__year--active')
            this.moveToYear(this.startYear)
        } else {
            $TARGET.removeClass('timeline__reset')
            $TARGET.addClass('timeline__pause')
            this.yearInterval = setInterval(() => {
                this.year += this.yearGap
                this.$timelineYears.filter(`[data-year=${this.year}]`).addClass('timeline__year--active').siblings().removeClass('timeline__year--active')
                this.circles
                    .transition()
                    .duration(300)
                        .attr('r', (d) => {
                            if (d[this.year] !== undefined) {
                                if (this.mode === 'receiving') {
                                    return d[this.year].receiving_total > 0 ? this.radiusScale(parseFloat(d[this.year].receiving_total)) : 0
                                } else {
                                    return d[this.year].sending_total > 0 ? this.radiusScale(parseFloat(d[this.year].sending_total)) : 0
                                }
                            } else {
                                return 0
                            }
                        })

                if(this.year >= this.endYear) { 
                    clearInterval(this.yearInterval) 
                    $TARGET.removeClass('timeline__pause')
                    $TARGET.addClass('timeline__reset')
                }
            }, 1000)
        }
    }

    moveToYear(year) {
        this.year = parseInt(year)
        clearInterval(this.yearInterval)
        this.$start.removeClass('timeline__pause')
        if (this.year === this.endYear) {
            this.$start.addClass('timeline__reset')
        } else {
            this.$start.removeClass('timeline__reset')
        }
        
        this.circles
            .transition()
            .duration(300)
                .attr('r', (d) => {
                    if (d[this.year] !== undefined) {
                        if (this.mode === 'receiving') {
                            return d[this.year].receiving_total > 0 ? this.radiusScale(parseFloat(d[this.year].receiving_total)) : 0
                        } else {
                            return d[this.year].sending_total > 0 ? this.radiusScale(parseFloat(d[this.year].sending_total)) : 0
                        }
                    } else {
                        return 0
                    }
                })
    }
}

export default FlowMap
