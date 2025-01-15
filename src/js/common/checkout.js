document.addEventListener('DOMContentLoaded', function (event) {

    /*================================== 
    step tabs
    ==================================*/

    class TabsCheckout {
        constructor(params) {

            this.params = params
            this.nav = document.querySelector(params.nav)
            this.container = document.querySelector(params.container)
            this.currentSlide = 0
            this.maxSlide = null

            this.init()
        }

        init() {
            this.maxSlide = Array.from(this.nav.children).length
            this.addEvents()
        }

        next() {
            if (this.currentSlide < this.maxSlide) {
                this.currentSlide++
                this.changeTab(this.currentSlide)
            }
        }

        prev() {
            if (this.currentSlide > 0) {
                this.currentSlide--
                this.changeTab(this.currentSlide)
            }
        }

        changeTab(index) {
            Array.from(this.container.children).forEach((el, i) => {
                el.classList.toggle('is-active', i == index)

                if (this.params.onChange) this.params.onChange(el, index)
                this.currentSlide = index
            })

            Array.from(this.nav.children).forEach((el, i) => {
                el.classList.toggle('is-active', i == index)
            })
        }


        addEvents() {
            Array.from(this.nav.children).forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.changeTab(index)
                })
            })
        }
    }


    class loadMapPointPickup {
        constructor() {
            this.$el = document.querySelector('.checkout-pickup')
            this.map = null;
            this.points = []
            this.init()
        }

        init() {
            window.loadApiYmaps((ymaps) => {
                this.initMap(ymaps)
            })

            this.createPointsArray()
            this.addEvents()
        }

        initMap() {
            ymaps.ready(() => {


                this.map = new ymaps.Map('map', {
                    center: [55.76, 37.64],
                    zoom: 14,
                    controls: ['zoomControl'],

                }, {
                    searchControlProvider: 'yandex#search',
                    suppressMapOpenBlock: true,
                    zoomControlPosition: {
                        right: 32,
                        top: 32
                    },

                });


                this.createPlacemark()



            })
        }

        createPointsArray() {
            this.$el.querySelectorAll('[data-coordinates]').forEach(item => {
                this.points.push({
                    coordinates: item.dataset.coordinates.split(',')
                })
            })
        }

        createPlacemark() {

            console.log(this.points)

            this.points.forEach(item => {

                const myPlacemark = new ymaps.Placemark(item.coordinates, {
                    hintContent: '',
                }, {
                    iconLayout: 'default#image',
                    iconImageHref: '/img/svg/ic_pin.svg',
                    iconImageSize: [60, 68],
                    iconImageOffset: [-30, -68]
                });

                this.map.geoObjects.add(myPlacemark)
            })


            this.map.setBounds(this.map.geoObjects.getBounds());
            this.map.setZoom(this.map.getZoom() - 1);

        }

        setCenterPoint(index) {
            this.map.setCenter(this.points[index]['coordinates'])
            this.map.setZoom(17)
        }

        addEvents() {
            this.$el.querySelectorAll('[data-coordinates]').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.setCenterPoint(index)

                    this.$el.querySelectorAll('[data-coordinates]').forEach((el, i) => {
                        el.classList.toggle('is-active', i == index)
                    })
                })
            })
        }

    }

    if (document.querySelector('.checkout__steps-nav')) {
        new TabsCheckout({
            nav: '.checkout__steps-nav ul',
            container: '.checkout__steps-content'
        })
    }

    if (document.querySelector('.checkout-user__tabs')) {
        new TabsCheckout({
            nav: '.checkout-user__tabs ul',
            container: '.checkout-user__tabs-container'
        })
    }

    if (document.querySelector('.checkout-delivery__tabs')) {
        new TabsCheckout({
            nav: '.checkout-delivery__tabs',
            container: '.checkout-delivery__content',
            onChange: (el, index) => {

                if (index == 0 && !window.mapPointPickup) {
                    window.mapPointPickup = new loadMapPointPickup()
                }

            }
        })
    }



});