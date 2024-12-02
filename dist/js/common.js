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

            scrollToElem(elem, container) {
                var rect = elem.getBoundingClientRect();
                var rectContainer = container.getBoundingClientRect();

                let elemOffset = {
                    top: rect.top + document.body.scrollTop,
                    left: rect.left + document.body.scrollLeft
                }

                let containerOffset = {
                    top: rectContainer.top + document.body.scrollTop,
                    left: rectContainer.left + document.body.scrollLeft
                }

                let leftPX = elemOffset.left - containerOffset.left + container.scrollLeft - (container.offsetWidth / 2) + ((elem.offsetWidth + 0) / 2)

                container.scrollTo({
                    left: leftPX,
                    behavior: 'smooth'
                });
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

                    if (i == index) {
                        this.scrollToElem(item, this.navСontainer)
                        item.classList.add('is-active')
                    }
                })


            }
        }

        const mainbanner = new Splide('[data-slider="main-banner"]', {
            type: 'fade',
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
                        perPage: 2.6,
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

        class BuilderVideo {
            constructor(el) {
                this.$el = el
                this.button = this.$el.querySelector('[data-rv="play"]')
                this.file = this.$el.querySelector('[data-rv="file"]')
                this.isplay = false;
                this.init()
            }

            init() {
                this.addEvents()
            }

            playVideo() {
                this.file.play()
                //this.file.setAttribute('controls', true)
                this.isplay = true;
                this.$el.classList.add('is-play')
            }

            pauseVideo() {

                this.file.removeAttribute('controls')
                this.isplay = false;
                this.$el.classList.remove('is-play')
            }

            addEvents() {
                this.button.addEventListener('click', () => {
                    if (!this.isplay) {
                        this.playVideo()
                    } else {
                        this.pauseVideo()
                    }
                })
                this.file.addEventListener('pause', () => this.pauseVideo())
            }
        }

        document.querySelectorAll('[data-rv="el"]').forEach(el => new BuilderVideo(el))

        const SliderReview = new Splide('[data-slider="review"]', {
            arrows: true,
            arrowPath: SLIDER_ARROW_PATH,
            pagination: false,
            autoWidth: true,
            start: 0,
            perPage: 1,
            perMove: 1,
            gap: 112,

            breakpoints: {

                1400: {
                    gap: 112
                },

                1400: {
                    gap: 60
                }

            },

        });



        SliderReview.mount();

        //dsdds

        let countChars = document.body.clientWidth > 576 ? 500 : 150

        document.querySelectorAll('.item-review__text').forEach(item => {
            if (item.innerText.length > countChars) {
                item.classList.add('crop--text')

                let showButton = document.createElement('div')
                showButton.classList.add('item-review__more')
                showButton.innerText = 'Читать полностью'

                showButton.addEventListener('click', e => {
                    if (item.classList.contains('crop--text')) {
                        item.classList.remove('crop--text')
                        showButton.innerText = 'Cвернуть'
                    } else {
                        item.classList.add('crop--text')
                        showButton.innerText = 'Читать полностью'
                    }
                })

                item.after(showButton)
            }
        })


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

    /* ==============================
    header
    ==============================*/

    const header = document.querySelector('.header')
    const headerTop = document.querySelector('.header-top')
    const htg = header.clientHeight

    window.addEventListener('scroll', () => {

        if (window.scrollY >= 44) {
            header.classList.add('is-fixed')
            headerTop.style.marginBottom = htg + 'px'
        } else {
            !header.classList.contains('is-fixed') || header.classList.remove('is-fixed')
            headerTop.style.marginBottom = 0
        }

    })

    /* =================================
    show-more
    =================================*/

    if (document.querySelector('.footer__label.show-hide')) {
        document.querySelectorAll('.footer__label.show-hide').forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('is-open')
            })
        })
    }

    // remove worktime
    if (document.querySelector('.header-top__worktime')) {
        const el = document.querySelector('.header-top__worktime')

        el.querySelector('svg').addEventListener('click', e => el.remove())
    }

    //copy email

    if (document.querySelector('.copy-field')) {
        document.querySelectorAll('.copy-field').forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault()

                navigator.clipboard.writeText(e.target.closest('a').innerText)
                    .then(() => {
                        window.STATUS.msg('Скопировано в буфер обмена!')
                    })
                    .catch(err => {
                        console.log('Something went wrong', err);
                    });

            })
        })
    }

    /* ===========================================
    Video
    =========================================== */

    if (document.querySelectorAll('[data-video], [data-youtube]').length) {

        function patternsIframe() {

            var $start = 0;
            var $iframe = {


                youtube: {
                    index: 'youtu',
                    id: function (url) {

                        var m = url.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
                        if (!m || !m[1]) return null;

                        if (url.indexOf('t=') != -1) {

                            var $split = url.split('t=');
                            var hms = $split[1].replace('h', ':').replace('m', ':').replace('s', '');
                            var a = hms.split(':');

                            if (a.length == 1) {

                                $start = a[0];

                            } else if (a.length == 2) {

                                $start = (+a[0]) * 60 + (+a[1]);

                            } else if (a.length == 3) {

                                $start = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

                            }
                        }

                        var suffix = '?autoplay=1';

                        if ($start > 0) {

                            suffix = '?start=' + $start + '&autoplay=1';
                        }

                        return m[1] + suffix;
                    },
                    src: '//www.youtube.com/embed/%id%'
                },

                vimeo: {
                    index: 'vimeo.com/',
                    id: function (url) {
                        var m = url.match(/(https?:\/\/)?(www.)?(player.)?vimeo.com\/([a-z]*\/)*([0-9]{6,11})[?]?.*/);
                        if (!m || !m[5]) return null;
                        return m[5];
                    },
                    src: '//player.vimeo.com/video/%id%?autoplay=1&volume=10'
                },

                kinescope: {
                    index: 'kinescope.io/',
                    id: function (url) {
                        var m = url.match(/io\/([^"]*)/);
                        if (!m || !m[1]) return null;
                        return m[1];
                    },

                    src: 'https://kinescope.io/embed/%id%',
                    allow: 'autoplay'
                }

            };

            return $iframe;

        }

        document.querySelectorAll('[data-youtube]').forEach(item => {
            item.addEventListener('click', e => {

                if (!item.dataset.youtube || !item.dataset.youtube.length) return false;

                const patterns = patternsIframe()
                const id = patterns.youtube.id(item.dataset.youtube)

                const popup = new afLightbox()

                popup.open(
                    `<div class="player-embed" >
                        <div class = "player-embed__iframe">
                            <iframe allowfullscreen="" src="${patterns.youtube.src.replace('%id%', id)}"></iframe>
                        </div>
                    </div>`
                )

            })
        })

        document.querySelectorAll('[data-video]').forEach(item => {
            item.addEventListener('click', e => {

                if (!item.dataset.video || !item.dataset.video.length) return false;

                const popup = new afLightbox()

                popup.open(
                    `<div class="player-embed" >
                        <div class = "player-embed__video">
                            <video src="${item.dataset.video}" autoplay="true" controls="true" ></video>
                        </div>
                    </div>`
                )

            })
        })
    }

    /* ====================================================
     SelectRegion  
    ====================================================*/

    class SelectRegion {
        constructor(params) {
            this.$el = document.querySelector(params.el) || document
            this.shopList = this.$el.querySelector('[data-shop="list"]')
            this.content = this.$el.querySelector('[data-sr="content"]')

            this.selectCity = this.$el.querySelector('[data-filter="select-city"]')
            this.elWindow = this.$el.querySelector('[data-sr="window"]')
            this.elPopup = this.$el.querySelector('[data-sr="popup"]')
            this.btnSelectRegion = this.$el.querySelector('[data-sr="open-window"]')

            this.btnApplyPopup = this.$el.querySelector('[data-sr="apply-popup"]')
            this.btnOpenPopup = this.$el.querySelector('[data-sr="open-popup"]')
            this.btnClosePopup = this.$el.querySelector('[data-sr="close-popup"]')
            this.data = null
            this.paneSelectCity = null
            this.inputFind = '';


            this.init()
        }

        init() {
            this.addEvents()
            this.$el.classList.add('is-open-popup')


        }

        fetchData(callback) {
            let url = '/json/cities.json';

            fetch(url, {
                    method: 'GET',
                })
                .then(async response => await response.json())
                .then((data) => {
                    this.data = JSON.parse(JSON.stringify(data))
                    callback(this.data);
                });
        }

        getTemplateSelectCity(data) {

            console.log(data)

            function getCity(array) {
                array = Array.from(array)
                let str = ''
                for (let key in array) {
                    str += `<li data-name="${array[key]['name']}" ><span>${array[key]['name']} </span></li>`
                }
                return str
            }

            function getCountCity(data) {
                let i = 0
                for (let key in data) {
                    i += data[key].data.size
                }
                return i
            }

            let items = ''

            for (let key in data) {

                items += `<div class="pane-selectcity__item">
                            <div class="pane-selectcity__item-letter">${key}</div>
                            <div class="pane-selectcity__item-list">
                            <ul>  ${getCity(data[key]['city'])} </ul>
                            </div>
                        </div>`
            }

            return `
                <div class="pane-selectcity">
                    <div class="pane-selectcity__close"><span class="icon-cross"></span></div>
                    <div class="pane-selectcity__title">Выбор города</div>

                    <div class="pane-selectcity__find">
                        <input type="text" data-filter="find-city" placeholder="Укажите свой город">
                    </div>

                    <div class="pane-selectcity__fast">
                        <ul>
                            <li><span>Москва</span></li>
                            <li><span>Санкт-Петербург</span></li>
                            <li><span>Екатеринбург</span></li>
                            <li><span>Новосибирск</span></li>
                        </ul>
                    </div>

                    <div class="pane-selectcity__list">
                        ${items}
                    </div>
                </div>
            `;
        }

        getTemplateMessage(data) {
            return `<div class="map-filter__message" >${data.msg}</div>`
        }

        getArrayCity() {
            var complexArr = {};
            var firstLetter = '';

            this.data.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                // если имена равны
                return 0;
            });

            this.data.forEach((item, index) => {

                firstLetter = String(item.name).charAt(0)

                if (typeof complexArr[firstLetter] === 'undefined') {

                    complexArr[firstLetter] = {
                        name: item.name,
                        data: new Set(),
                        city: [{
                            name: item.name,
                            count: 1
                        }]
                    }

                    complexArr[firstLetter]['data'].add(item.name)

                } else {
                    complexArr[firstLetter]['data'].add(item.name)

                    if (typeof complexArr[firstLetter]['city'].find(c => c.name == item.name) === 'undefined') {
                        complexArr[firstLetter]['city'].push({
                            name: item.name,
                            count: 1
                        })
                    } else {
                        complexArr[firstLetter]['city'].find(c => c.name == item.name).count++
                    }

                }


            })




            return complexArr;
        }

        openSelectCity() {

            if (this.paneSelectCity != null) return false

            this.paneSelectCity = document.createElement('div')
            this.paneSelectCity.classList.add('pane')
            this.paneSelectCity.innerHTML = this.getTemplateSelectCity(this.getArrayCity())

            this.paneSelectCity.querySelector('.pane-selectcity__close').addEventListener('click', e => {
                this.closeSelectCity()
            })

            this.addEventsFindCity(this.paneSelectCity)

            this.content.append(this.paneSelectCity)
        }

        getAllCity() {
            let uniq = new Set()
            this.data.forEach(item => {
                uniq.add(item.name)
            })

            let arr = Array.from(uniq)

            arr.sort((a, b) => {
                const startsWithM_a = a.toLowerCase().startsWith(this.inputFind.toLowerCase().substr(0, 2));
                const startsWithM_b = b.toLowerCase().startsWith(this.inputFind.toLowerCase().substr(0, 2));

                if (startsWithM_a && !startsWithM_b) {
                    return -1;
                }
                if (!startsWithM_a && startsWithM_b) {
                    return 1;
                }
                return a.localeCompare(b);
            });

            return arr
        }

        addEventsFindCity(paneSelectCity) {

            paneSelectCity.querySelector('[data-filter="find-city"]').addEventListener('keyup', (e) => {

                this.inputFind = e.target.value

                let ul = document.createElement('ul')
                let list = this.paneSelectCity.querySelector('.pane-selectcity__list')

                if (e.target.value) {

                    let ul = document.createElement('ul')
                    ul.classList.add('pane-selectcity__result')

                    this.getAllCity().forEach(item => {
                        if (item.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1) {
                            let li = document.createElement('li')
                            li.innerHTML = item
                            ul.append(li)
                            li.addEventListener('click', e => this.selectedCity(item))
                        }
                    })

                    list.classList.add('hide')

                    if (this.paneSelectCity.querySelector('.pane-selectcity__result')) {
                        this.paneSelectCity.querySelector('.pane-selectcity__result').remove()
                    }

                    this.paneSelectCity.querySelector('.pane-selectcity').append(ul)

                    if (!ul.childNodes.length) {
                        ul.innerHTML = this.getTemplateMessage({
                            msg: 'Увы, такого города не нашлось :('
                        })
                    }

                } else {
                    if (this.paneSelectCity.querySelector('.pane-selectcity__result')) {
                        this.paneSelectCity.querySelector('.pane-selectcity__result').remove()
                    }!list.classList.contains('hide') || list.classList.remove('hide')
                }

            })
        }

        closeSelectCity() {
            if (this.paneSelectCity) {
                this.content.classList.add('is-close-animate')
                document.body.classList.remove('page-hidden')
                setTimeout(() => {
                    this.paneSelectCity.remove()
                    this.paneSelectCity = null
                    this.$el.classList.remove('is-open-window')
                    this.content.classList.remove('is-close-animate')
                }, 400)
            }

        }

        renderList() {
            this.fetchData((response) => {

                this.openSelectCity()

            })
        }

        selectedCity(city) {

            console.log(city)

            this.closeSelectCity()
        }

        openWindow() {
            this.$el.classList.add('is-open-window')
            this.renderList()
            document.body.classList.add('page-hidden')
        }

        addEvents() {

            this.btnSelectRegion.addEventListener('click', () => {
                this.openWindow()
            })

            this.btnClosePopup.addEventListener('click', () => {
                this.$el.classList.remove('is-open-popup')
            })

            this.btnApplyPopup.addEventListener('click', () => {
                this.$el.classList.remove('is-open-popup')
            })




            this.$el.addEventListener('click', e => {

                if (e.target.closest('.pane-selectcity__item-list li span')) {
                    this.selectedCity(e.target.closest('.pane-selectcity__item-list li').dataset.name)
                }

                if (e.target.closest('.pane-selectcity__fast li span')) {
                    this.selectedCity(e.target.closest('.pane-selectcity__fast li span').innerText)
                }

            })
        }

    }

    if (document.querySelector('.select-region')) {
        window.SelectRegion = new SelectRegion({
            el: '.select-region'
        })

    }




}); //dcl