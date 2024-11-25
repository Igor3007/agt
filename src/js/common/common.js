document.addEventListener('DOMContentLoaded', function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug';
    const SLIDER_ARROW_PATH = 'M16.2859 12.2421C16.6493 11.9029 17.2188 11.9225 17.558 12.2859L23.7802 18.9526C24.1029 19.2984 24.1029 19.835 23.7802 20.1808L17.558 26.8474C17.2188 27.2108 16.6493 27.2304 16.2859 26.8913C15.9225 26.5521 15.9029 25.9826 16.2421 25.6193L21.8911 19.5667L16.2421 13.5141C15.9029 13.1507 15.9225 12.5812 16.2859 12.2421Z'


    /* =================================================
    css variable
    =================================================*/

    function css_variable() {
        let vh = window.innerHeight * 0.01;
        let hgtheader = document.querySelector('.header') ? document.querySelector('.header').clientHeight : 64
        let hgtheadertop = document.querySelector('.header-top') ? document.querySelector('.header-top').clientHeight : 41

        document.documentElement.style.setProperty('--vh', vh + 'px');
        document.documentElement.style.setProperty('--hgt-header', hgtheader + 'px');
        document.documentElement.style.setProperty('--hgt-header-top', hgtheadertop + 'px');
    }

    window.addEventListener('load', css_variable)
    window.addEventListener('resize', css_variable)

    /* =================================================
    smooth scroll
    ================================================= */

    window.scrollToTargetAdjusted = function (params) {

        let element = typeof params.elem == 'string' ? document.querySelector(params.elem) : params.elem
        let elementPosition = element.getBoundingClientRect().top + window.scrollY

        let offsetPosition = elementPosition
        offsetPosition -= (params.offset ? params.offset : 0)

        window.scrollTo({
            top: Number(offsetPosition),
            behavior: "smooth"
        });
    }

    /* =================================================
    preloader
    ================================================= */

    class Preloader {

        constructor() {
            this.$el = this.init()
            this.state = false
        }

        init() {
            const el = document.createElement('div')
            el.classList.add('loading')
            el.innerHTML = '<div class="indeterminate"></div>';
            document.body.append(el)
            return el;
        }

        load() {

            this.state = true;

            setTimeout(() => {
                if (this.state) this.$el.classList.add('load')
            }, 300)
        }

        stop() {

            this.state = false;

            setTimeout(() => {
                if (this.$el.classList.contains('load'))
                    this.$el.classList.remove('load')
            }, 200)
        }

    }

    window.preloader = new Preloader();


    /* ==============================================
    Status
    ============================================== */

    function Status() {

        this.containerElem = '#status'
        this.headerElem = '#status_header'
        this.msgElem = '#status_msg'
        this.btnElem = '#status_btn'
        this.timeOut = 10000,
            this.autoHide = true

        this.init = function () {
            let elem = document.createElement('div')
            elem.setAttribute('id', 'status')
            elem.innerHTML = '<div id="status_header"></div> <div id="status_msg"></div><div id="status_btn"></div>'
            document.body.append(elem)

            document.querySelector(this.btnElem).addEventListener('click', function () {
                this.parentNode.setAttribute('class', '')
            })
        }

        this.msg = function (_msg, _header) {
            _header = (_header ? _header : 'Отлично!')
            this.onShow('complete', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.err = function (_msg, _header) {
            _header = (_header ? _header : 'Ошибка')
            this.onShow('error', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }
        this.wrn = function (_msg, _header) {
            _header = (_header ? _header : 'Внимание')
            this.onShow('warning', _header, _msg)
            if (this.autoHide) {
                this.onHide();
            }
        }

        this.onShow = function (_type, _header, _msg) {
            document.querySelector(this.headerElem).innerText = _header
            document.querySelector(this.msgElem).innerText = _msg
            document.querySelector(this.containerElem).classList.add(_type)
        }

        this.onHide = function () {
            setTimeout(() => {
                document.querySelector(this.containerElem).setAttribute('class', '')
            }, this.timeOut);
        }

    }

    window.STATUS = new Status();
    const STATUS = window.STATUS;
    STATUS.init();

    /* ==============================================
    ajax request
    ============================================== */

    window.ajax = function (params, response) {

        //params Object
        //dom element
        //collback function

        window.preloader.load()

        let xhr = new XMLHttpRequest();
        xhr.open((params.type ? params.type : 'POST'), params.url)

        if (params.headers) {
            for (let key in params.headers) {
                xhr.setRequestHeader(key, params.headers[key]);
            }
        }

        if (params.responseType == 'json') {
            xhr.responseType = 'json';
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xhr.send(JSON.stringify(params.data))
        } else {
            let formData = new FormData()
            for (key in params.data) {
                formData.append(key, params.data[key])
            }
            xhr.send(formData)
        }

        xhr.onload = function () {

            response ? response(xhr.status, xhr.response) : ''
            window.preloader.stop()
            setTimeout(function () {
                if (params.btn) {
                    params.btn.classList.remove('btn-loading')
                }
            }, 300)
        };

        xhr.onerror = function () {
            window.STATUS.err('Error: ajax request failed')
        };

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 3) {
                if (params.btn) {
                    params.btn.classList.add('btn-loading')
                }
            }
        };
    }

    /* ==================================================
    maska
    ==================================================*/
    const {
        MaskInput,
    } = Maska

    function initMaska() {
        new MaskInput("[data-maska]")
    }

    initMaska();


    /* ==================================================
    burgerMenu
    ==================================================*/

    class MainMenu {
        constructor(ctx) {
            this.$el = ctx
            this.btns = this.$el.querySelectorAll('.btn-burger')
            this.container = this.$el.querySelector('[data-menu="container"]')

            this.containerLinks = this.$el.querySelector('[data-menu="links"]')
            this.containerTop = this.$el.querySelector('[data-menu="top"]')
            this.containerContacts = this.$el.querySelector('[data-menu="contacts"]')

            this.addEvent()
        }

        toggleMenu(item) {
            item.classList.toggle('open')

            if (!item.classList.contains('open')) {
                this.closeMenu()
            } else {
                this.openMenu()
            }
        }

        openMenu() {
            this.container.classList.toggle('is-open')
            this.$el.body.classList.toggle('page-hidden')
            this.$el.body.classList.toggle('open-modile-menu')
            this.containerLinks.children.length || this.renderMenu()
        }

        closeMenu() {
            this.btns.forEach(item => {
                !item.classList.contains('open') || item.classList.remove('open')
            });

            !this.$el.body.classList.contains('open-modile-menu') || !this.$el.body.classList.remove('open-modile-menu');
            !this.container.classList.contains('is-open') || this.container.classList.remove('is-open');
            !this.$el.body.classList.contains('page-hidden') || this.$el.body.classList.remove('page-hidden');
        }

        renderMenu() {
            this.containerLinks.innerHTML = document.querySelector('.header__links').outerHTML
            this.containerTop.innerHTML = document.querySelector('.header-top').outerHTML
            this.containerContacts.innerHTML = document.querySelector('.header-phone-wrp').outerHTML

            this.afterLoad()
        }

        afterLoad() {
            this.containerLinks.querySelectorAll('a[href="#catalog-popup"]').forEach(item => {
                item.addEventListener('click', e => {
                    window.catalogPopup.open()
                    this.closeMenu()
                })
            })

            //menu

            this.containerTop.querySelectorAll('.header-top__nav .isset-sub').forEach(item => {
                item.addEventListener('click', e => {
                    e.preventDefault()
                    item.classList.toggle('is-open')
                    item.querySelector('.sub-menu').classList.toggle('is-open')

                    item.querySelectorAll('.sub-menu li').forEach(item => {
                        item.addEventListener('click', e => e.stopPropagation())
                    })
                })
            })
        }

        addEvent() {
            this.btns.forEach(item => {
                item.addEventListener('click', e => this.toggleMenu(item))
            })
        }
    }

    if (document.querySelector('.btn-burger')) {
        window.MainMenu = new MainMenu(document)
    }

    /* ==================================================
    get width scrollbar
    ==================================================*/

    window.getScrollBarWidth = function () {
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);

        const inner = document.createElement('div');
        outer.appendChild(inner);

        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
    }



    /* ========================================
    MainBanner
    ========================================*/


    if (document.querySelector('[data-slider="main-banner"]')) {

        class MainBanner {
            constructor(params) {
                this.$el = params.el
                this.slider = params.slider
                this.navСontainer = this.$el.querySelector('[data-mb=nav]')
                this.init()
            }

            init() {
                this.createPagination()
            }

            itemTemplate(data) {
                return ` <span>${data.text}</span> `
            }

            createPagination() {

                let ulContainer = document.createElement('ul')

                this.slider.root.querySelectorAll('.main-banner__title').forEach((el, index) => {

                    let itemNav = document.createElement('li')
                    itemNav.innerHTML = this.itemTemplate({
                        text: el.innerHTML
                    })

                    if (index == 0) itemNav.classList.add('is-active')

                    itemNav.addEventListener('click', () => this.changeSlide(index))

                    ulContainer.append(itemNav)

                })

                this.navСontainer.append(ulContainer)
            }

            changeSlide(index) {
                this.slider.go(index)
            }

            changeSliderMain(index) {
                this.navСontainer.querySelectorAll('li').forEach((item, i) => {
                    !item.classList.contains('is-active') || item.classList.remove('is-active')

                    if (i == index) item.classList.add('is-active')
                })
            }
        }

        const mainbanner = new Splide('[data-slider="main-banner"]', {
            arrows: false,
            pagination: false,
            start: 0,
            perPage: 1,
        });

        mainbanner.on('mounted', (e) => {
            mainbanner['helper'] = new MainBanner({
                slider: mainbanner,
                el: document.querySelector('[data-mb="el"]')
            })
        })

        mainbanner.on('moved', (index) => {
            mainbanner['helper'].changeSliderMain(index)
        })

        mainbanner.mount();
    }

    /* ========================================
    TopBrands
    ========================================*/

    if (document.querySelector('[data-slider="topbrands"]')) {

        const topBrands = new Splide('[data-slider="topbrands"]', {
            arrows: true,
            arrowPath: SLIDER_ARROW_PATH,
            pagination: false,
            start: 0,
            perPage: 7,
            perMove: 1,
            gap: 36,
            breakpoints: {

                992: {
                    perMove: 4,
                    perPage: 4,
                },

                576: {
                    perMove: 3,
                    perPage: 3,
                    gap: 16,
                },
            },

        });

        topBrands.mount();
    }

    /* ========================================
    SliderProduct
    =========================================*/

    if (document.querySelector('[data-slider="product"]')) {

        const items = document.querySelectorAll('[data-slider="product"]')

        items.forEach(slider => {

            let splide = new Splide(slider, {

                arrows: true,
                arrowPath: SLIDER_ARROW_PATH,

                pagination: false,
                gap: 20,

                start: 0,
                perPage: 5,
                perMove: 4,
                flickMaxPages: 1,
                flickPower: 100,


                breakpoints: {

                    1400: {
                        perMove: 5,
                        perPage: 5,
                    },

                    1200: {
                        perMove: 3,
                        perPage: 4,
                    },

                    992: {
                        perMove: 2,
                        perPage: 3,
                    },

                    576: {
                        perPage: 2,
                        gap: 16,
                    },
                },

            });

            const getTopArrowButtons = () => {

                if (slider) {
                    let heigthEl = slider.querySelector('picture').clientHeight
                    slider.querySelectorAll('.splide__arrow').forEach(btn => {
                        btn.style.top = (heigthEl / 2) + 'px'
                    })
                }
            }

            splide.on('mounted', (e) => {

                if (splide.length == (splide.options.perPage)) {
                    nextButton.setAttribute('aria-hidden', '')
                    prevButton.setAttribute('aria-hidden', '')
                }

                //auto perMove
                const getPerMove = () => {
                    return Math.floor((splide.root.clientWidth / splide.root.querySelector('.splide__slide').clientWidth)) || 1
                }

                splide.options = {
                    perMove: getPerMove(),
                };

                // top for nan button
                getTopArrowButtons()
            })

            splide.on('resize', (e) => {
                getTopArrowButtons()
            })

            splide.mount();
        })



    }

    /* ================================================
    Minicard
    ================================================*/

    if (document.querySelector('.minicard')) {

        class Minicard {
            constructor(el) {
                this.$el = el;

                this.addEvents()
            }

            changeColor(e, el) {
                this.$el.querySelectorAll('[data-image-color]').forEach(item => {
                    if (item.dataset.imageColor == e.target.dataset.color) {
                        item.classList.add('is-active')
                    } else {
                        !item.classList.contains('is-active') || item.classList.remove('is-active')
                    }
                })

                this.$el.querySelectorAll('[data-color]').forEach(item => {
                    !item.closest('li').classList.contains('is-active') || item.closest('li').classList.remove('is-active')
                })

                el.classList.add('is-active')
            }



            addEvents() {
                this.$el.querySelectorAll('[data-color]').forEach((item, index) => {
                    item.addEventListener('click', e => this.changeColor(e, item.closest('li')))

                    if (index == 0) item.closest('li').classList.add('is-active')
                })


            }
        }

        document.querySelectorAll('.minicard').forEach(item => new Minicard(item))

    }

    /* ================================================
    SliderStore
    ================================================*/

    if (document.querySelector('[data-slider="store"]')) {

        const SliderStore = new Splide('[data-slider="store"]', {
            arrows: false,
            arrowPath: SLIDER_ARROW_PATH,
            pagination: false,
            start: 0,
            perPage: 1,
            perMove: 1,
        });

        const btnPrev = document.querySelector('[data-slider-prev="store"]')
        const btnNext = document.querySelector('[data-slider-next="store"]')

        btnPrev.addEventListener('click', () => {
            SliderStore.go('<')
        })
        btnNext.addEventListener('click', () => {
            SliderStore.go('>')
        })

        SliderStore.mount();
    }

    /* ================================================
    SliderReview
    ================================================*/

    if (document.querySelector('[data-slider="review"]')) {

        const SliderReview = new Splide('[data-slider="review"]', {
            arrows: true,
            arrowPath: SLIDER_ARROW_PATH,
            pagination: false,
            autoWidth: true,
            start: 0,
            perPage: 1,
            perMove: 1,
            gap: 112

        });



        SliderReview.mount();
    }


    /* ================================
    slider default
    ================================*/

    if (document.querySelector('[data-slider="default"]')) {

        const items = document.querySelectorAll('[data-slider="default"]')

        items.forEach(slider => {

            let splide = new Splide(slider, {

                arrows: true,
                arrowPath: SLIDER_ARROW_PATH,

                pagination: false,
                gap: 20,
                autoWidth: true,
                start: 0,
                perPage: 1,
                perMove: 4,
                flickMaxPages: 1,
                flickPower: 100,


                breakpoints: {

                    1400: {
                        perMove: 4,
                    },

                    1200: {
                        perMove: 3,
                    },

                    992: {
                        perMove: 2,
                    },

                    576: {
                        perPage: 1,
                        gap: 16,
                    },
                },

            });

            const getTopArrowButtons = () => {

                if (slider) {
                    let heigthEl = slider.querySelector('picture').clientHeight
                    slider.querySelectorAll('.splide__arrow').forEach(btn => {
                        btn.style.top = (heigthEl / 2) + 'px'
                    })
                }
            }

            splide.on('mounted', (e) => {

                if (splide.length == (splide.options.perPage)) {
                    nextButton.setAttribute('aria-hidden', '')
                    prevButton.setAttribute('aria-hidden', '')
                }

                //auto perMove
                const getPerMove = () => {
                    return Math.floor((splide.root.clientWidth / splide.root.querySelector('.splide__slide').clientWidth)) || 1
                }

                splide.options = {
                    perMove: getPerMove(),
                };

                // top for nan button
                getTopArrowButtons()

            })

            splide.on('resize', (e) => {
                getTopArrowButtons()
            })


            splide.mount();
        })



    }

    /* ================================
    faq
    ================================*/

    if (document.querySelectorAll('.faq-item__question')) {

        const faqItems = document.querySelectorAll('.faq-item__question')

        faqItems.forEach(function (item, index) {
            item.addEventListener('click', function () {
                this.parentNode.classList.toggle('open')
            })
        })

    }


}); //dcl