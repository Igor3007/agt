document.addEventListener('DOMContentLoaded', function (event) {
    /* ========================================
    objects
    ========================================*/

    if (document.querySelector('#map-root')) {

        class Placemark {
            constructor(params) {
                this.$el = null
                this.point = params.point
                this.rootSize = params.rootSize
                this.icon = null
                this.closeButton = null
                this.init()


            }

            init() {
                this.createMarker()
            }

            isMobile() {
                return document.body.clientWidth <= 767
            }

            iconSvg() {
                return `<svg width="32" height="42" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.328 5.884a13.601 13.601 0 00-10-3.875A13.8 13.8 0 002.017 15.095a13.663 13.663 0 003.551 9.889 47.434 47.434 0 018.795 13.197l.24.563a1.25 1.25 0 002.298 0l.534-1.25a43.5 43.5 0 018.4-12.405 13.743 13.743 0 00-.507-19.21v.005zM15.752 20.75a4.999 4.999 0 110-9.998 4.999 4.999 0 010 9.998z" />
                <path d="M15.752 20.751a4.999 4.999 0 110-9.998 4.999 4.999 0 010 9.998z" fill="#fff"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M2.017 15.095A13.8 13.8 0 0115.328 2.009a13.601 13.601 0 019.996 3.87l.004.005V5.88l.004.004a13.737 13.737 0 014.165 9.497 13.743 13.743 0 01-3.661 9.708 43.5 43.5 0 00-8.401 12.405l-.534 1.25a1.25 1.25 0 01-2.298 0l-.24-.563a47.434 47.434 0 00-8.795-13.197 13.663 13.663 0 01-3.551-9.89zM12.53 38.98a45.436 45.436 0 00-8.417-12.626l-.011-.012-.011-.012A15.662 15.662 0 01.02 14.995v-.002A15.8 15.8 0 0115.259.01a15.601 15.601 0 018.07 1.92l3.392 2.514a15.743 15.743 0 01.581 22.005l-.014.015-.014.015a41.497 41.497 0 00-8.008 11.817l-.527 1.236a3.25 3.25 0 01-5.974 0l-.001-.003-.234-.548z" fill="#fff"/></svg>`
            }

            createBallon() {

                if (typeof this.point.objects == 'undefined') return false

                const createList = () => {
                    let html = '';
                    this.point.objects.forEach(data => {
                        html += ` <li class="point-popup" >
                                    <div class="point-popup__name" >${data.name}</div>
                                    <div class="point-popup__city" >${data.address}</div>
                                    <div class="point-popup__desc" >${data.desc}</div>
                                </li>`;
                    })
                    return html
                }

                return `
                    <div class="placemark-balloon" >
                        <div class="placemark-balloon__top" >
                            <div class="placemark-balloon__title" >${this.point.city}</div>
                            <div class="placemark-balloon__close" ><span class="icon-cross ic_24" ></span></div>
                        </div>
                        <div class="placemark-balloon__content" >
                            <ul >
                                ${createList()}
                            </ul>
                        </div>
                    </div>
                `
            }

            createMarker() {

                if (this.$el) return false

                this.$el = document.createElement('div')
                this.$el.className = 'placemark';

                this.$el.innerHTML = `
                    <div class="placemark__icon" >${this.iconSvg()}</div>
                    <div class="placemark__balloon" >${this.createBallon()}</div>
                `

                this.icon = this.$el.querySelector('.placemark__icon')
                this.closeButton = this.$el.querySelector('.placemark-balloon__close')

                this.createEventMarker()
            }

            openBalloon() {

                if (typeof this.point.objects == 'undefined') return false

                if (this.isMobile()) {
                    const instansePopup = new afLightbox({
                        mobileInBottom: true
                    })
                    instansePopup.open(this.createBallon(), false)
                } else {
                    this.$el.classList.add('is-open--balloon')
                    this.point.marker.update({
                        zIndex: 10
                    })

                    this.checkPositionBallon()
                }
            }

            checkPositionBallon() {

                let offsetEl = this.$el.closest('ymaps').style.getPropertyValue('transform').match(/translate\(([\d.]+)px,\s*([\d.]+)px\)/);
                let balloonEl = this.$el.querySelector('.placemark-balloon')
                let ballonList = balloonEl.querySelector('ul')

                let toppx = offsetEl[2];
                let leftpx = offsetEl[1];

                let offsetBotton = this.rootSize.height - toppx
                let offsetRight = this.rootSize.width - leftpx

                let balloonHeight = balloonEl.clientHeight
                let balloonWidth = balloonEl.clientWidth


                ballonList.style.setProperty('max-height', (this.rootSize.height * 0.35) + 'px')


                if ((balloonWidth > offsetRight && balloonHeight > offsetBotton) || leftpx < balloonWidth) {
                    window.map.setLocation({
                        center: this.point.marker._props.coordinates,
                        duration: 500
                    });

                    return false
                }

                if (balloonHeight > offsetBotton) {
                    window.map.setLocation({
                        center: [window.map.center[0], this.point.marker._props.coordinates[1]],
                        duration: 500
                    });
                } else {


                    ballonList.style.setProperty('max-height', (offsetBotton - 100) + 'px')
                }

                if (balloonWidth > offsetRight) {
                    window.map.setLocation({
                        center: [this.point.marker._props.coordinates[0], window.map.center[1]],
                        duration: 500
                    });
                }



            }

            closeBalloon() {
                if (this.$el.classList.contains('is-open--balloon'))
                    this.$el.classList.remove('is-open--balloon')


                this.point.marker.update({
                    zIndex: 1
                })
            }

            createEventMarker() {
                if (this.closeButton) this.closeButton.addEventListener('click', () => this.closeBalloon())

                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.placemark')) this.closeBalloon()
                })
            }

            marker() {
                return this.$el;
            }
        }

        window.loadApiYmaps3(() => {
            initMap();

            async function initMap() {
                // Промис `ymaps3.ready` будет зарезолвлен, когда загрузятся все компоненты основного модуля API
                await ymaps3.ready;

                const {
                    YMap,
                    YMapDefaultSchemeLayer,
                    YMapMarker,
                    YMapLayer,
                    YMapFeatureDataSource,
                    YMapControls,
                } = ymaps3;

                const {
                    YMapZoomControl
                } = await ymaps3.import('@yandex/ymaps3-controls@0.0.1')
                const rootEl = document.getElementById('map-root')

                // Иницилиазируем карту
                window.map = new YMap(rootEl, {
                    location: {
                        center: [53.117374431117014, 71.41754715721409].reverse(),
                        zoom: 4
                    },
                    zoomRange: {
                        min: 3,
                        max: 7
                    },
                    behaviors: ['drag', 'pinchZoom', 'dblClick'],
                    mode: 'vector'
                });


                //controls
                const controls = new YMapControls({
                    position: 'left',
                    orientation: 'vertical'
                });

                controls.addChild(new YMapZoomControl({
                    easing: 'ease'
                }));
                window.map.addChild(controls);



                //источник данных для маркеров
                window.map.addChild(
                    new YMapFeatureDataSource({
                        id: 'markerSource'
                    })
                );

                // Добавляем слой для отображения схематической карты
                window.map.addChild(new YMapDefaultSchemeLayer({
                    customization: layerStyle
                }));

                // Добавляем слой для отображения маркеров

                let layerMarker = new YMapLayer({
                    source: 'markerSource',
                    type: 'markers',
                    zIndex: 2020
                })

                window.map.addChild(
                    layerMarker
                );



                fetch('/json/map.json')
                    .then(response => response.json())
                    .then(points => {

                        points.forEach(point => {

                            point['pl'] = new Placemark({
                                point,
                                rootSize: {
                                    width: rootEl.clientWidth,
                                    height: rootEl.clientHeight
                                }
                            })

                            point['marker'] = new YMapMarker({
                                source: 'markerSource',
                                coordinates: point['coordinates'].split(',').reverse(),
                                zIndex: 1,
                                onClick: () => {
                                    points.forEach(el => el.pl.closeBalloon())
                                    point['pl'].openBalloon()
                                }

                            }, point['pl'].marker());
                            window.map.addChild(point['marker']);
                        })

                    });




            }

        })

    }

    /* =======================================
    filter
    =======================================*/

    if (document.querySelector('#app-filter')) {
        var app = new Vue({
            el: '#app-filter',
            data: {
                json: null,
                isLoading: false,
                uniqFields: {},
                defaultConfig: {
                    type: 'all',
                    sub: 'Все'
                }
            },

            created: function () {
                this.fetchData()
            },

            methods: {
                fetchData: function () {
                    fetch('/json/clients.json')
                        .then(response => response.json())
                        .then(data => {
                            this.uniqFields = data.filter
                            this.json = data.clients
                            this.getUniqArray()
                            this.isLoading = !this.isLoading
                        });
                },

                getUniqArray() {
                    this.json.forEach(item => {
                        for (let key in item) {
                            if (typeof this.uniqFields[key] != 'undefined') {
                                if (typeof this.uniqFields[key]['uq'] == 'undefined') {
                                    this.uniqFields[key]['uq'] = new Set()
                                    this.uniqFields[key]['uq'].add('Все')
                                }

                                if (item[key]) this.uniqFields[key]['uq'].add(item[key])
                            }

                        }
                    })
                },

                changeType(index) {
                    this.defaultConfig.type = index
                    this.defaultConfig.sub = 'Все'
                },

                changeTypeSub(index) {
                    this.defaultConfig.sub = index
                }
            },

            computed: {
                getSubType() {
                    if (this.defaultConfig.type == 'all') return [];
                    return this.uniqFields[this.defaultConfig.type]['uq'];
                },

                getList() {
                    if (this.defaultConfig.sub == 'Все') return this.json;
                    return this.json.filter(item => item[this.defaultConfig.type] == this.defaultConfig.sub)
                }
            }
        })
    }

});