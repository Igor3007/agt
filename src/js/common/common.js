document.addEventListener('DOMContentLoaded', function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?apikey=0e2d85e0-7f40-4425-aab6-ff6d922bb371&suggest_apikey=ad5015b5-5f39-4ba3-9731-a83afcecb740&lang=ru_RU&mode=debug';
    const SLIDER_ARROW_PATH = 'M16.2859 12.2421C16.6493 11.9029 17.2188 11.9225 17.558 12.2859L23.7802 18.9526C24.1029 19.2984 24.1029 19.835 23.7802 20.1808L17.558 26.8474C17.2188 27.2108 16.6493 27.2304 16.2859 26.8913C15.9225 26.5521 15.9029 25.9826 16.2421 25.6193L21.8911 19.5667L16.2421 13.5141C15.9029 13.1507 15.9225 12.5812 16.2859 12.2421Z'


    /* =================================================
    css variable
    =================================================*/

    function css_variable() {
        let vh = window.innerHeight * 0.01;
        let hgtheader = document.querySelector('.header') ? document.querySelector('.header').clientHeight : 64
        let hgtheadertop = document.querySelector('.header-top') ? document.querySelector('.header-top').clientHeight : 41
        let sphead = document.querySelector('.sp-head') ? document.querySelector('.sp-head').clientHeight : 41

        document.documentElement.style.setProperty('--vh', vh + 'px');
        document.documentElement.style.setProperty('--hgt-header', hgtheader + 'px');
        document.documentElement.style.setProperty('--hgt-header-top', hgtheadertop + 'px');
        document.documentElement.style.setProperty('--hgt-sp-head', sphead + 'px');

        return {
            vh,
            hgtheader,
            hgtheadertop,
            sphead
        }
    }

    window.addEventListener('load', css_variable)
    window.addEventListener('resize', css_variable)

    /* =================================================
    load ymaps api
    =================================================*/

    window.loadApiYmaps = function (callback) {

        if (window.ymaps == undefined && !window.stateLoadingApi) {
            window.stateLoadingApi = true
            const script = document.createElement('script')
            script.src = API_YMAPS
            script.onload = () => {
                callback(window.ymaps)
            }
            document.head.append(script)
        } else {
            callback(window.ymaps)
        }

    }

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

        new MaskInput("[data-input-mask='name']", {
            mask: 'A',
            tokens: {
                A: {
                    pattern: /[a-zA-ZА-Яа-я ]/,
                    repeated: true
                },
            }
        })


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

            this.addEvent()
            this.afterLoad()
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

        }

        closeMenu() {
            this.btns.forEach(item => {
                !item.classList.contains('open') || item.classList.remove('open')
            });

            !this.$el.body.classList.contains('open-modile-menu') || !this.$el.body.classList.remove('open-modile-menu');
            !this.container.classList.contains('is-open') || this.container.classList.remove('is-open');
            !this.$el.body.classList.contains('page-hidden') || this.$el.body.classList.remove('page-hidden');
        }



        afterLoad() {
            this.container.querySelectorAll('.isset-sub').forEach(item => {
                item.addEventListener('click', e => {
                    e.stopPropagation()


                    if (e.target.classList.contains('is-open')) {
                        e.target.classList.remove('is-open')
                        return false;
                    }

                    e.target.closest('ul').querySelectorAll('.is-open').forEach(li => {
                        li.classList.remove('is-open')
                    })

                    e.target.classList.toggle('is-open')
                })
            })
        }

        addEvent() {
            this.btns.forEach(item => {
                item.addEventListener('click', e => this.toggleMenu(item))
            })

            this.$el.querySelectorAll('[data-menu="close"]').forEach(item => {
                item.addEventListener('click', () => {
                    this.closeMenu()
                })
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

    /* =========================================
    ajax tooltip
    ==========================================*/

    class TooltipAjax {
        constructor() {
            this.$items = document.querySelectorAll('[data-prop-tooltip]')
            this.addEvents()
            this.tooltip = null;
        }

        ajaxLoadTooltip(e, callback) {
            callback({
                title: '',
                text: e.target.dataset.propTooltip || e.target.closest('[data-prop-tooltip]').dataset.propTooltip
            })
        }

        getTemplate(data) {
            let html = ` <div class="tooltip-box" ><div class="af-spiner" ></div></div> `;
            if (data) {

                html = `<div class="tooltip-box" >
                               <div class="tooltip-box__title" >${data.title}</div>
                               <div class="tooltip-box__text" >${data.text}</div>
                           </div> `;
            }
            return html;
        }

        positionTooltip(e) {
            const DomRect = e.target.getBoundingClientRect()
            const tooltipW = this.tooltip.clientWidth;
            const tooltipH = this.tooltip.clientHeight;
            const offset = 12;

            this.tooltip.style.left = (DomRect.x - (tooltipW / 2) + (offset / 2)) + 'px'
            this.tooltip.style.top = (DomRect.y - tooltipH - (offset / 2)) + 'px'


            if (this.tooltip.getBoundingClientRect().left < offset) {
                this.tooltip.classList.add('tooltip-box-item--left')
                this.tooltip.style.left = (DomRect.x - (DomRect.x / 2) + (offset / 2)) + 'px'
            }

            if (this.tooltip.getBoundingClientRect().top < offset) {
                this.tooltip.classList.add('tooltip-box-item--top')
                this.tooltip.style.top = (DomRect.y + (offset)) + 'px'
            }
        }

        tooltipDesctop(e) {

            this.tooltipRemove()
            this.tooltip = document.createElement('div')
            this.tooltip.innerHTML = this.getTemplate(false)
            this.tooltip.classList.add('tooltip-box-item')

            e.target.closest('span').append(this.tooltip)
            this.positionTooltip(e)

            //load data

            this.ajaxLoadTooltip(e, (response) => {
                this.tooltip.innerHTML = this.getTemplate(response)
                this.positionTooltip(e)
            })
        }

        tooltipPopup(e) {
            const tooltipPopup = new afLightbox({
                mobileInBottom: true
            })

            tooltipPopup.open('<div class="popup-tooltip-box" >' + this.getTemplate(false) + '</div>', () => {
                this.ajaxLoadTooltip(e, (response) => {
                    tooltipPopup.changeContent('<div class="popup-tooltip-box" >' + this.getTemplate(response) + '</div>')
                })
            })
        }

        tooltipRemove() {
            !this.tooltip || this.tooltip.remove()
        }

        addEvents() {
            this.$items.forEach(item => {

                //for desctop
                if (document.body.clientWidth > 576) {

                    item.addEventListener('mouseenter', e => {
                        this.tooltipDesctop(e)

                        //add event close on scroll
                        window.addEventListener('scroll', e => {
                            this.tooltipRemove()
                        })
                    })

                    //add event close on outher click 
                    item.addEventListener('mouseleave', e => {
                        this.tooltipRemove()
                    })

                } else {
                    item.addEventListener('click', e => {
                        //for mobile
                        this.tooltipPopup(e)
                    })
                }

            })
        }

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
    HeaderBrands
    ========================================*/

    if (document.querySelector('[data-slider="header-brands"]')) {

        const HeaderBrands = new Splide('[data-slider="header-brands"]', {
            arrows: true,
            arrowPath: SLIDER_ARROW_PATH,
            pagination: false,
            start: 0,
            perPage: 9,
            perMove: 1,
            gap: 36,
            breakpoints: {

                1440: {
                    perMove: 7,
                    perPage: 7,
                },

                1200: {
                    perMove: 5,
                    perPage: 5,
                },

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

        HeaderBrands.mount();
    }

    /* ========================================
    HeaderProfessionals
    ========================================*/

    if (document.querySelector('[data-slider="header-prof"]')) {



        const topProf = new Splide('[data-slider="header-prof"]', {
            arrows: true,
            arrowPath: SLIDER_ARROW_PATH,
            pagination: false,
            start: 0,
            perPage: 5,
            perMove: 1,
            gap: 12,
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

        topProf.mount();
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

    /* ========================================
    SingleProductGallery
    =========================================*/

    if (document.querySelector('[data-slider="sp-gallery"]')) {

        const items = document.querySelectorAll('[data-slider="sp-gallery"]')

        items.forEach(slider => {

            let totalSlide = slider.querySelectorAll('.splide__slide').length

            if (totalSlide < 2) {
                slider.classList.add('splide--one')
            }

            let splide = new Splide(slider, {

                arrows: true,
                arrowPath: SLIDER_ARROW_PATH,
                pagination: true,
                gap: 20,
                start: 0,
                perPage: (totalSlide > 1 ? 2 : 1),
                perMove: (totalSlide > 1 ? 2 : 1),
                flickMaxPages: 1,
                flickPower: 100,


                breakpoints: {

                    breakpoints: {

                        992: {
                            perPage: (totalSlide > 1 ? 2 : 1),
                            perMove: (totalSlide > 1 ? 2 : 1),
                        },

                        576: {
                            perPage: 1,
                            gap: 16,
                        },
                    },


                },

            });



            splide.mount();
        })



    }


    /* ======================================
    fixed sticky details
    ======================================*/

    if (document.querySelector('.single-product__head')) {

        const stickyElm = document.querySelector('.single-product__head')
        const observer = new IntersectionObserver(
            ([e]) => e.target.classList.toggle('is-sticky', e.intersectionRatio < 1), {
                threshold: [1]
            }
        );

        observer.observe(stickyElm)

        let scrollPosition = window.scrollY - document.querySelector('.sp-details').clientHeight
        let detailsHeight = document.querySelector('.sp-details').clientHeight

        window.addEventListener('scroll', e => {
            let scrollHeight = document.querySelector('.section-single-product').clientHeight + document.querySelector('header').clientHeight
            scrollPosition = scrollHeight - (detailsHeight + 130)
            document.querySelector('.single-product__details').classList.toggle('is-opacity', (window.scrollY > scrollPosition))
            document.querySelector('.single-product__details').classList.toggle('is-nofixed', (detailsHeight > window.innerHeight - css_variable()['hgtheader']))

        })
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
            updateOnMove: true,
        });

        const params = {}

        const btnPrev = document.querySelector('[data-slider-prev="store"]')
        const btnNext = document.querySelector('[data-slider-next="store"]')

        btnPrev.addEventListener('click', () => {
            SliderStore.go('<')
        })
        btnNext.addEventListener('click', () => {
            SliderStore.go('>')
        })

        SliderStore.on('active', (e) => {

            e.slide.querySelectorAll('[data-slide]').forEach(p => {
                params[p.dataset.slide] = p.innerHTML
            })

            let container = e.slide.closest('section')

            if (container.querySelector('.stores-slider__city--mobile')) {
                container.querySelector('.stores-slider__city--mobile').innerHTML = params.city
            }
            if (container.querySelector('.stores-slider__phone')) {
                container.querySelector('.stores-slider__phone').innerHTML = params.phone
            }

            container.querySelector('.stores-slider__city').innerHTML = params.city
            container.querySelector('.stores-slider__address').innerHTML = params.address
            container.querySelector('.stores-slider__worktime').innerHTML = params.worktime

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

                this.file.pause()
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

        //document.querySelectorAll('[data-rv="el"]').forEach(el => new BuilderVideo(el))

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

            if (!localStorage.getItem('region')) {
                this.$el.classList.add('is-open-popup')
            }

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

            localStorage.setItem('region', city)
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
                this.$el.classList.remove('is-open-popup')
            })

            this.btnClosePopup.addEventListener('click', () => {
                this.$el.classList.remove('is-open-popup')
            })

            this.btnApplyPopup.addEventListener('click', () => {
                this.$el.classList.remove('is-open-popup')
                this.selectedCity(this.btnApplyPopup.dataset.region)
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

        document.querySelectorAll('[data-region="open-window"]').forEach(item => {
            item.addEventListener('click', () => window.SelectRegion.openWindow())
        })
    }

    /* =========================================================================
    filter category
    =========================================================================*/

    /* =========================================
    range price slider
    =========================================*/

    function initPriceRange(el) {
        let newRangeSlider = new ZBRangeSlider('price-range');

        let inputMax = el.querySelector('[data-price-range="max"]');
        let inputMin = el.querySelector('[data-price-range="min"]');

        let priceMax = newRangeSlider.slider.getAttribute('se-max')
        let priceMin = newRangeSlider.slider.getAttribute('se-min')



        let delimiter = (num) => {
            return String(num).replace(/(\d)(?=(\d{3})+([^\d]|$))/g, '$1 ')
        }
        let setCurrency = (str) => {
            return str.indexOf('₽') == -1 ? ' ₽' : ''
        }

        inputMax.value = delimiter(inputMax.value) + setCurrency(inputMax.value)
        inputMin.value = delimiter(inputMin.value) + setCurrency(inputMin.value)

        newRangeSlider.onChange = function (min, max) {
            inputMax.value = delimiter(max) + ' ₽'
            inputMin.value = delimiter(min) + ' ₽'
        }

        inputMax.addEventListener('blur', e => {
            e.target.value = e.target.value + setCurrency(e.target.value)
        })
        inputMin.addEventListener('blur', e => {
            e.target.value = e.target.value + setCurrency(e.target.value)
        })

        inputMax.addEventListener('keyup', e => {
            let int = e.target.value.replace(/[^\+\d]/g, '');

            if (Number(int) >= Number(priceMax)) {
                int = priceMax
            }


            e.target.value = delimiter(int)
            newRangeSlider.setMaxValue(int)
        })

        inputMin.addEventListener('keyup', e => {
            let int = e.target.value.replace(/[^\+\d]/g, '');

            if (int >= 0) {
                e.target.value = delimiter(int)
                newRangeSlider.setMinValue(int)
            }
        })


    }

    if (document.querySelector('#price-range')) {
        initPriceRange(document)
    }

    /* =========================================
    show / hide item filter
    =========================================*/

    if (document.querySelector('.filter-properties__head')) {
        const items = document.querySelectorAll('.filter-properties__head')

        items.forEach(item => {
            item.addEventListener('click', e => {
                item.closest('.filter-properties').classList.toggle('is-hide')
            })
        })
    }

    /* ====================================
    show-hide properties filter
    ====================================*/

    if (document.querySelector('.filter-properties')) {

        const container = document.querySelector('.category-filter')
        const subMenu = container.querySelectorAll('.filter-properties__list ul')

        // console.log(subMenu)

        subMenu.forEach(item => {

            if (item.querySelectorAll('li').length > 5) {

                const elem = document.createElement('div')
                elem.classList.add('sub-menu-toggle')
                elem.innerText = 'Ещё'

                //add event

                elem.addEventListener('click', e => {
                    item.classList.toggle('is-open')
                    elem.classList.toggle('is-open')
                    elem.innerText = (item.classList.contains('is-open') ? 'Свернуть' : 'Ещё')
                })

                item.after(elem)

            }

        })

    }

    /* ====================================
    clear filter
    ====================================*/

    if (document.querySelector('[data-filter="clear"]')) {

        const items = document.querySelectorAll('[data-filter="clear"]')

        items.forEach(item => {
            item.addEventListener('click', e => {
                e.target.closest('form').reset()
            })
        })


    }

    /* ====================================
    data-filter="open"
    ====================================*/

    if (document.querySelector('[data-filter="open"]')) {
        document.querySelectorAll('[data-filter="open"]').forEach(item => {
            item.addEventListener('click', e => {
                if (document.body.clientWidth >= 993) {
                    e.target.closest('.catalog-category').classList.toggle('is-close-filter')
                } else {
                    document.body.classList.toggle('page-hidden')
                    document.querySelector('[data-filter-container="catalog"]').classList.toggle('is-open')
                    initPriceRange(document)
                }
            })
        })
    }

    /* ====================================
    data-filter="open"
    ====================================*/

    if (document.querySelector('[data-filter="submit"]') && document.body.clientWidth < 992) {
        document.querySelectorAll('[data-filter="submit"]').forEach(item => {
            item.addEventListener('click', e => {
                document.querySelector('[data-filter-container="catalog"]').classList.toggle('is-open')
            })
        })
    }

    /* ===================================================================================
    end filter
    ===================================================================================*/

    /* ====================================
    FlexTags
    ====================================*/

    if (document.querySelector('[data-category="tags"]')) {
        const items = document.querySelectorAll('[data-category="tags"] li')

        items.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault()
                item.classList.toggle('is-active')
            })
        })

        class FlexTags {
            constructor(params) {
                this.params = params
                this.$el = document.querySelector(params.el) || document
                this.widthButtonShowMore = 110;
                this.container = document.querySelector(this.params.container) || document
                this.showMoreBotton = this.container.querySelector('.show-more-tag')
                this.init()
            }

            init() {
                this.addEvent()
                this.render()
            }

            widthItems() {
                return this.$el.clientWidth;
            }

            widthContainer() {
                return this.container.clientWidth - this.widthButtonShowMore;
            }

            render() {

                if (this.$el.closest(this.params.container).classList.contains('is-open')) {
                    return false;
                }

                this.$el.querySelectorAll('li.is-hide').forEach(li => li.classList.remove('is-hide'))

                this.showMoreBotton.style.display = (this.widthItems() > this.widthContainer() ? 'flex' : 'none')

                let i = 0;

                console.log(this.widthItems(), 'this.widthItems()')
                console.log(this.widthContainer(), 'this.widthContainer()')

                while (this.widthItems() > this.widthContainer()) {
                    let visibleElements = this.$el.querySelectorAll('li:not(.is-hide)')
                    if (visibleElements[(visibleElements.length - 1)]) {
                        visibleElements[(visibleElements.length - 1)].classList.add('is-hide')
                    }

                    i++;

                    if (i > 100) return false
                }


            }

            debounce(method, delay, e) {
                clearTimeout(method._tId);
                method._tId = setTimeout(function () {
                    method(e);
                }, delay);
            }



            addEvent() {
                const resizeHahdler = (e) => {
                    this.render()
                }

                const observer = new ResizeObserver((entries) => {
                    this.debounce(resizeHahdler, 30, entries)
                });

                observer.observe(document.querySelector(this.params.container));
            }

        }

        window.flextags = new FlexTags({
            el: '[data-category="tags"]',
            container: '.catalog-category__tags'
        })


        //flextags

        if (document.querySelector('[data-isopen="catalog-category__tags"]')) {
            const items = document.querySelectorAll('[data-isopen="catalog-category__tags"]')

            items.forEach(item => {

                const buttonText = item.innerText

                if (item.dataset.isopen) {
                    item.addEventListener('click', e => {
                        let el = e.target.closest('.' + item.dataset.isopen)
                        el.classList.toggle('is-open')
                        el.querySelector('span').innerText = el.classList.contains('is-open') ? 'Свернуть' : buttonText
                    })
                }
            })

        }

        //flex collections

        if (document.querySelector('[data-isopen="tag-collections"]')) {
            const items = document.querySelectorAll('[data-isopen="tag-collections"]')

            items.forEach(item => {

                const buttonText = item.innerText

                if (item.dataset.isopen) {
                    item.addEventListener('click', e => {
                        let el = e.target.closest('.' + item.dataset.isopen)
                        el.classList.toggle('is-open')
                        el.querySelector('span').innerText = el.classList.contains('is-open') ? 'Свернуть' : buttonText
                    })
                }
            })

        }

        // subcat

        if (document.querySelector('[data-isopen="catalog-category__subcat"]')) {
            const items = document.querySelectorAll('[data-isopen="catalog-category__subcat"]')



            items.forEach(item => {

                const parent = item.closest('.' + item.dataset.isopen).querySelector('ul')


                if (parent.querySelectorAll('li').length > 4 && document.body.clientWidth <= 480) {
                    item.style.display = 'flex'
                }



                const buttonText = item.innerText

                if (item.dataset.isopen) {
                    item.addEventListener('click', e => {
                        let el = e.target.closest('.' + item.dataset.isopen)
                        el.classList.toggle('is-open')
                        item.innerText = el.classList.contains('is-open') ? 'Свернуть' : buttonText
                    })
                }
            })

        }




    }


    /* ======================================
    top-catalog
    ======================================*/

    if (document.querySelector('.top-catalog')) {


        class TopCatalog {
            constructor(params) {
                this.$el = document.querySelector(params.el)
                this.menuLevel1 = this.$el.querySelector('[data-topcat="level1"]')
                this.menuLevel2 = this.$el.querySelector('[data-topcat="level2"]')
                this.menuLevel3 = this.$el.querySelector('[data-topcat="level3"]')
                this.elImage = this.$el.querySelector('[data-topcat="imgbg"]')
                this.back = this.$el.querySelector('[data-topcat="back"]')
                this.close = this.$el.querySelector('[data-topcat="close"]')

                this.init()
            }

            init() {
                this.back.classList.add('is-start')
                this.isMobile()
                this.addEvents()
            }

            isMobile() {
                if (document.body.clientWidth < 992) {
                    this.$el.classList.add('is-mobile')
                } else {
                    !this.$el.classList.contains('is-mobile') || this.$el.classList.remove('is-mobile')
                }

                return this.$el.classList.contains('is-mobile')
            }

            renderLevel3(menu) {

                if (!menu.querySelector('ul')) {
                    this.menuLevel3.innerHTML = '';
                    return false
                }

                const ulLevel3 = menu.querySelector('ul').cloneNode(true)
                this.menuLevel3.innerHTML = ulLevel3.outerHTML
            }

            renderLevel2(menu) {

                if (!menu.querySelector('ul')) return false

                this.menuLevel3.innerHTML = ''

                const ulLevel2 = menu.querySelector('ul').cloneNode(true)
                this.menuLevel2.innerHTML = ulLevel2.outerHTML

                this.menuLevel2.querySelectorAll('.sub-level2 > li').forEach(li => {

                    const renderHandler = (e) => {

                        if (li.querySelector('.sub-level3')) {
                            e.preventDefault()
                        }

                        this.menuLevel2.querySelectorAll('.sub-level2 > li').forEach(li2 => {
                            !li2.classList.contains('is-active') || li2.classList.remove('is-active')
                        })

                        li.classList.add('is-active')

                        if (this.isMobile()) {

                            !this.menuLevel2.classList.contains('animation-show-pane') || !this.menuLevel2.classList.remove('animation-show-pane')
                            this.menuLevel2.classList.add('animation-hide-pane')
                            this.menuLevel3.classList.add('animation-show-pane')
                            this.menuLevel3.classList.add('animation-show-pane--next')

                            setTimeout(() => {
                                if (document.querySelector('.animation-show-pane--next'))
                                    document.querySelector('.animation-show-pane--next').classList.remove('animation-show-pane--next')
                            }, 1200)

                            this.back.innerHTML = li.querySelectorAll('a')[0].innerText
                            this.back.style.display = 'flex'
                            this.menuLevel3.setAttribute('data-prev', li.querySelectorAll('a')[0].innerText);
                            !this.back.classList.contains('is-start') || this.back.classList.remove('is-start')
                        }

                        this.renderLevel3(li)
                    }

                    if (this.isMobile()) {
                        li.addEventListener('click', e => renderHandler(e, li))
                    } else {
                        li.addEventListener('mouseenter', e => renderHandler(e, li))
                    }


                })

                if (!this.isMobile()) {
                    this.renderLevel3(this.menuLevel2.querySelectorAll('.sub-level2 > li')[0])
                    this.menuLevel2.querySelectorAll('.sub-level2 > li')[0].classList.add('is-active')
                }
            }

            renderLevel1(e, item) {
                if (item.querySelector('.sub-level2')) {
                    if (e) e.preventDefault()
                }

                this.$el.querySelectorAll('.sub-level1 li').forEach(li => {
                    !li.classList.contains('is-active') || li.classList.remove('is-active')
                })

                item.classList.add('is-active')

                this.elImage.setAttribute('src', item.dataset.image)


                if (this.isMobile()) {
                    this.menuLevel1.classList.add('animation-hide-pane');
                    !this.menuLevel1.classList.contains('animation-show-pane') || this.menuLevel1.classList.remove('animation-show-pane')

                    this.menuLevel2.classList.add('animation-show-pane--next')
                    this.menuLevel2.classList.add('animation-show-pane')

                    setTimeout(() => {
                        if (document.querySelector('.animation-show-pane--next'))
                            document.querySelector('.animation-show-pane--next').classList.remove('animation-show-pane--next')
                    }, 1200)


                    this.back.innerHTML = item.querySelectorAll('a')[0].innerText
                    this.back.style.display = 'flex'
                    this.menuLevel2.setAttribute('data-prev', item.querySelectorAll('a')[0].innerText);
                    !this.back.classList.contains('is-start') || this.back.classList.remove('is-start')
                }

                this.renderLevel2(item)
            }

            backPaneOnMobile() {
                if (!this.$el.querySelector('.animation-show-pane')) return false

                let elem = this.$el.querySelector('.animation-show-pane')

                if (!elem.previousElementSibling.getAttribute('data-prev')) return false;

                elem.classList.remove('animation-show-pane')
                elem.classList.add('animation-hide-pane')
                elem.previousElementSibling.classList.add('animation-show-pane--back');
                elem.previousElementSibling.classList.add('animation-show-pane');

                setTimeout(() => {
                    if (document.querySelector('.animation-show-pane--back'))
                        document.querySelector('.animation-show-pane--back').classList.remove('animation-show-pane--back')
                }, 400)

                this.back.innerText = elem.previousElementSibling.dataset.prev ? elem.previousElementSibling.dataset.prev : this.back.style.display = 'none';
                !elem.previousElementSibling.classList.contains('animation-hide-pane') || elem.previousElementSibling.classList.remove('animation-hide-pane')

                if (this.$el.querySelector('.animation-show-pane').dataset.topcat == 'level1') {
                    this.back.classList.add('is-start')
                } else {
                    !this.back.classList.contains('is-start') || this.back.classList.remove('is-start')
                }
            }

            addEvents() {


                document.querySelectorAll('[data-headercat="open"]').forEach(item => {
                    item.addEventListener('click', e => {
                        this.$el.classList.toggle('is-open')
                        document.body.classList.toggle('page-hidden')

                        if (item.hasAttribute('data-type')) {
                            this.$el.classList.toggle('is-fixed-open')
                        }

                        const closeInOut = (e) => {
                                if (!e.target.closest('.menu-catalog')) {
                                    this.$el.classList.remove('is-open')
                                    document.removeEventListener('click', closeInOut)

                                        !document.body.classList.contains('page-hidden') || document.body.classList.remove('page-hidden');
                                    !this.$el.classList.contains('is-fixed-open') || this.$el.classList.remove('is-fixed-open')
                                }
                            }

                            !this.$el.classList.contains('is-open') || document.addEventListener('click', closeInOut)
                    })
                })


                //create event for level 1

                this.$el.querySelectorAll('.sub-level1 li').forEach((item, index) => {

                    if (!index && !this.isMobile()) this.renderLevel1(false, item)
                    if (!item.querySelector('ul')) item.classList.add('not-sub')

                    if (this.isMobile()) {
                        item.addEventListener('click', e => this.renderLevel1(e, item))
                    } else {
                        item.addEventListener('mouseenter', e => this.renderLevel1(e, item))
                        this.renderLevel1(false, this.$el.querySelectorAll('.sub-level1 li')[0])
                    }
                })


                if (this.isMobile()) {

                    // create event close
                    this.close.addEventListener('click', e => {
                        !this.$el.classList.contains('is-open') || this.$el.classList.remove('is-open');
                        !document.body.classList.contains('page-hidden') || document.body.classList.remove('page-hidden');
                    })

                    // create event back
                    this.back.addEventListener('click', e => this.backPaneOnMobile())
                }

                window.addEventListener('resize', () => this.isMobile())


            }
        }

        new TopCatalog({
            el: '.top-catalog'
        })
    }

    /* ===========================================
    HeaderMenu
    ===========================================*/

    if (document.querySelector('[data-menu]')) {

        const popups = document.querySelectorAll('[data-header-popup]')
        let timer = null;

        document.querySelectorAll('[data-menu]').forEach(item => {
            item.addEventListener('mouseenter', () => {

                clearTimeout(timer)

                popups.forEach(p => {
                    if (p.dataset.headerPopup == item.dataset.menu) {
                        p.classList.add('is-active')
                    } else {
                        !p.classList.contains('is-active') || p.classList.remove('is-active')
                    }
                })

            })

            item.addEventListener('mouseleave', e => {
                timer = setTimeout(() => {
                    popups.forEach(p => !p.classList.contains('is-active') || p.classList.remove('is-active'))
                }, 100)
            })

            popups.forEach(p => {
                p.addEventListener('mouseenter', () => {
                    clearTimeout(timer)
                })

                p.addEventListener('mouseleave', () => {
                    p.classList.remove('is-active')
                })
            })


        })

    }

    /* ======================================
    change view
    ======================================*/

    if (document.querySelector('.change-view')) {
        const inputs = document.querySelectorAll('.change-view input')
        const container = document.querySelector('.category-products')

        inputs.forEach(item => {
            item.addEventListener('change', e => {

                if (item.value == 'list') {
                    container.classList.add('view--list');
                    return false;
                }

                if (item.value == 'one') {
                    container.classList.add('column-one')
                } else {
                    !container.classList.remove('column-one') || container.classList.remove('column-one');
                    !container.classList.remove('view--list') || container.classList.remove('view--list');
                }

            })
        })
    }

    /* ===============================================
    text-accordion
    ===============================================*/

    if (document.querySelector('.text-accordion')) {

        const $el = document.querySelector('.text-accordion')
        const items = $el.querySelectorAll('.text-accordion__label')

        if (document.body.clientWidth < 992) {

            items.forEach(label => {
                const item = label.closest('.text-accordion__item')

                document.body.clientWidth < 992 || item.classList.add('is-open')

                item.querySelector('.text-accordion__text').style.height = item.querySelector('.text-height').clientHeight + 0 + 'px'

                label.addEventListener('click', e => {
                    item.classList.toggle('is-open');
                    //!item.classList.contains('is-open') || window.scrollToTargetAdjusted(label)
                })
            })
        } else {

            let ul = document.createElement('ul')

            const changeActive = (index) => {
                ul.querySelectorAll('li').forEach((item, i) => {
                    if (i == index) {
                        item.classList.add('is-open')
                    } else {
                        !item.classList.contains('is-open') || item.classList.remove('is-open')
                    }
                })

                items.forEach((label, i) => {
                    if (i == index) {
                        label.parentNode.classList.add('is-open')
                    } else {
                        !label.parentNode.classList.contains('is-open') || label.parentNode.classList.remove('is-open')
                    }
                })
            }

            items.forEach((label, index) => {
                let li = document.createElement('li')
                li.innerText = label.innerText
                ul.append(li);

                if (!index) {
                    li.classList.add('is-open')
                }

                li.addEventListener('click', e => {
                    changeActive(index)
                })
            })

            $el.querySelector('.text-accordion__nav').append(ul)
            changeActive(0)
        }


    }

    /* =========================================
    video youtube
    =========================================*/

    if (document.querySelector('.yt-video')) {
        document.querySelectorAll('.yt-video').forEach(container => {

            const getYoutubeId = (url) => {
                var m = url.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
                if (!m || !m[1]) return null;
                return m[1];
            }

            container.querySelector('.yt-video__button').addEventListener('click', e => {
                container.classList.add('is-play')

                let iframe = document.createElement('iframe')
                let v = container.dataset.id;

                if (v.indexOf('dzen.ru') !== -1) {
                    iframe.src = v + '?autoplay=true'
                } else {
                    iframe.src = '//www.youtube.com/embed/' + getYoutubeId(container.dataset.id) + '?autoplay=true'
                }





                container.querySelector('.yt-video__iframe').append(iframe)
            })


        })
    }

    /* ===========================================
    input material
    =========================================== */

    function materialInput() {
        this.init = function () {

            let _this = this

            document.querySelectorAll('.input-material input, .input-material textarea').forEach(function (input) {

                if (input.value.length) {
                    input.setAttribute('area-valid', true)
                } else {
                    input.removeAttribute('area-valid')
                }

                _this.addEvent(input)
            })
        }

        this.reset = function () {
            document.querySelectorAll('.input-material input, .input-material textarea').forEach(function (input) {
                input.removeAttribute('area-valid')
            })

            document.querySelectorAll('.input-material, .multi-mask').forEach(function (im) {
                im.classList.toggle('err', false)
            })

            this.init()
        }

        this.addEvent = function (input) {
            input.addEventListener('keyup', function (event) {
                if (event.target.value.length) {
                    event.target.setAttribute('area-valid', 'true')
                } else {
                    event.target.removeAttribute('area-valid')
                }
            })
        }


    }

    const MATERIAL_INPUT = new materialInput()
    MATERIAL_INPUT.init()


    /* ==================================
    footer subscribe
    ==================================*/


    if (document.querySelector('.footer-subscribe__form')) {
        const container = document.querySelector('.footer-subscribe__form')
        const checkbox = container.querySelector('[type="checkbox"]')
        const btn = container.querySelector('.btn')

        const checkHahdler = (checkbox) => {
            if (!checkbox.checked) {
                btn.setAttribute('disabled', '')
            } else {
                btn.removeAttribute('disabled')
            }
        }

        checkbox.addEventListener('change', () => checkHahdler(checkbox))
        checkHahdler(checkbox);
    }

    /* ==================================
    validation
    ==================================*/

    class Validation {
        constructor(form) {
            this.form = form
            this.init()
        }

        init() {
            if (!this.form.length) return false

            this.form.forEach(form => {
                form.querySelectorAll('[type=submit]').forEach(btn => {
                    btn.addEventListener('click', e => {
                        this.validateCheckbox(form)
                        this.validateText(form)
                        this.validateEmail(form)
                    })
                })

                form.querySelectorAll('[type=text], [type=tel], [type=email]').forEach(input => {
                    input.addEventListener('input', e => {
                        if (input.required && !e.target.value) {
                            if (input.closest('.input-material')) {

                                if (input.closest('.multi-mask')) {
                                    input.closest('.multi-mask').classList.add('err')
                                } else {
                                    input.closest('.input-material').classList.add('err')
                                }

                            } else {
                                input.classList.add('err')
                            }

                        } else {
                            this.clearErr(input)
                        }
                    })
                })

            })

        }

        clearErr(input) {

            if (input.closest('.input-material')) {
                !input.closest('.input-material').classList.contains('err') || input.closest('.input-material').classList.remove('err')
            } else {
                !input.classList.contains('err') || input.classList.remove('err')
            }

            if (input.closest('.multi-mask')) {
                !input.closest('.multi-mask').classList.contains('err') || input.closest('.multi-mask').classList.remove('err')
            } else {
                !input.classList.contains('err') || input.classList.remove('err')
            }


        }

        validateCheckbox(form) {

            form.querySelectorAll('[type="checkbox"]').forEach(input => {
                if (input.required && !input.checked) {
                    input.classList.add('err')
                } else {
                    this.clearErr(input)
                }
            })
        }

        validateText(form) {

            form.querySelectorAll('[type="text"],[type="tel"]').forEach(input => {
                if (input.required && !input.value) {
                    if (input.closest('.input-material')) {

                        if (input.closest('.multi-mask')) {
                            input.closest('.multi-mask').classList.add('err')
                        } else {
                            input.closest('.input-material').classList.add('err')
                        }


                    } else {
                        input.classList.add('err')
                    }
                } else {
                    this.clearErr(input)
                }
            })
        }

        validateEmail(form) {

            const emailPattern = /^[^s@]+@[^s@]+.[^s@]+$/;

            form.querySelectorAll('[type="email"]').forEach(input => {
                if (!emailPattern.test(input.value)) {
                    if (input.closest('.input-material')) {
                        input.closest('.input-material').classList.add('err')
                    } else {
                        input.classList.add('err')
                    }
                } else {
                    this.clearErr(input)
                }
            })
        }
    }

    /* ======================================
    validation form
    ======================================*/

    new Validation(document.querySelectorAll('form'))

    /* ======================================
    multimask
    ======================================*/

    class MultiMask {
        constructor(params) {
            this.$el = (typeof params.el === 'string' ? document.querySelector(params.el) : params.el)
            this.input = this.$el.querySelector('input')
            this.inputCode = null
            this.select = null
            this.maska = null
            this.pathFlag = '/img/flags/'
            this.config = {
                default: 'ru'
            }

            this.init()
        }

        init() {
            this.addEvent()
            this.render()



            this.maska = new MaskInput(this.input)

            if (this.$el.querySelector('[rel = ' + this.config.default+']')) {
                this.selectedMask(this.$el.querySelector('[rel = ' + this.config.default+']'), 'init')

                if (this.input.getAttribute('value')) {
                    this.setNumberFromValue()
                }
            }
        }

        getMasks() {
            return {
                'ru': {
                    iso: 'ru',
                    code: '+7',
                    mask: '+7(###)###-##-##'
                },
                'by': {
                    iso: 'by',
                    code: '+375',
                    mask: '+375(##)###-##-##'
                },
                'kz': {
                    iso: 'kz',
                    code: '+7',
                    mask: '+7(###)###-##-##'
                },


            }
        }

        parseNumber(str) {
            const rx = /\+.+?\(/g
            const matches = str.match(rx);
            const code = matches ? matches.map(match => match.slice(1, -1)) : [null];

            const regex = /\((.*)$/;
            const number = str.match(regex) ? str.match(regex) : [null];

            return {
                code: '+' + code[0],
                number: number[0]
            }
        }

        setNumberFromValue() {


            const masks = this.getMasks();
            const numberArray = this.parseNumber(this.input.getAttribute('value'))

            let m = false;
            for (let key in masks) {
                if (masks[key]['code'] == numberArray['code']) {
                    m = masks[key];
                }
            }

            if (m !== false) {
                this.selectedMask(this.$el.querySelector('[rel = ' + m['iso'] + ']'))
                this.input.value = numberArray['number']
            } else {
                this.input.value = this.input.getAttribute('value')
            }

        }

        getTemplate() {

            const getlist = () => {
                let str = ''
                let codes = this.getMasks()
                for (let key in codes) {
                    str += `<li rel="${key}">
                        <span class="country-flag" style="background-image: url('${this.pathFlag}${codes[key]['iso']}.svg')" ></span> 
                    </li>`
                }

                return str ? str : 'нет кодов'
            }

            return `
                <div class="multi-mask__title" >
                    <span class="country-flag" style="background-image: url('${this.pathFlag}ru.svg')" ></span>
                    <span class="country-code" >+7</span>
                </div>
                <div class="multi-mask__dropd" >
                    <ul>${getlist()}</ul>
                </div>
                <input type="hidden" name="phone-code">
            `;
        }
        openDropdown() {
            this.select.classList.toggle('is-open')
        }

        selectedMask(el, type) {
            this.$el.querySelector('.multi-mask__title').innerHTML = el.innerHTML

            let iso = el.getAttribute('rel')

            //this.input.setAttribute('placeholder', this.getMasks()[iso]['mask'])

            if (!type) {
                this.input.value = this.getMasks()[iso]['code']
                this.input.setAttribute('area-valid', true)
                this.input.focus()
            }

            this.inputCode.value = this.getMasks()[iso]['code']

            this.maska.destroy()
            this.maska = new MaskInput(this.input, {
                mask: this.getMasks()[iso]['mask']
            })


        }

        render() {
            this.select = document.createElement('div')
            this.select.classList.add('multi-mask__select')
            this.select.innerHTML = this.getTemplate()

            this.select.addEventListener('click', e => {
                this.openDropdown()
            })

            this.$el.append(this.select)
            this.inputCode = this.select.querySelector('[name="phone-code"]')
        }


        addEvent() {
            this.$el.addEventListener('click', e => {
                if (e.target.closest('.multi-mask__dropd li')) {
                    this.selectedMask(e.target.closest('.multi-mask__dropd li'))
                }
            })
        }
    }

    //mask
    if (document.querySelector('.multi-mask')) {
        document.querySelectorAll('.multi-mask').forEach(el => {

            if (!el.classList.contains('initialized')) {
                el.classList.add('initialized');
                new MultiMask({
                    el
                })
            }
        })
    }

    /* =======================================
    crop text
    =======================================*/

    let countChars = document.body.clientWidth > 576 ? 500 : 150

    document.querySelectorAll('[data-crop-text]').forEach(item => {
        if (item.innerText.length > countChars) {
            item.classList.add('crop--text')

            let showButton = document.createElement('div')
            showButton.classList.add('show-more-button')
            showButton.innerText = 'Подробнее'

            showButton.addEventListener('click', e => {
                if (item.classList.contains('crop--text')) {
                    item.classList.remove('crop--text')
                    showButton.innerText = 'Cвернуть'
                } else {
                    item.classList.add('crop--text')
                    showButton.innerText = 'Подробнее'
                }

                showButton.classList.toggle('is-open')
            })

            item.after(showButton)
        }
    })

    /* =====================================
    select color
    ===================================== */




    class SelectColor {
        constructor(params) {
            this.$el = params.el
            this.popup = null;
            this.btnSelect = null;
            this.result = [];

            this.init()
        }

        init() {
            this.popup = new afLightbox({
                mobileInBottom: true,
                clases: 'af-position-left'
            })
        }

        open() {
            this.popup.open('<div class="af-spiner" ></div>', false)

            window.ajax({
                type: 'GET',
                url: '/parts/_select-color.html'
            }, (status, response) => {
                this.popup.changeContent(response)
                this.eventCheckbox()
            })
        }

        eventCheckbox() {
            this.popup.modal.querySelectorAll('input[type=radio]').forEach(input => {
                input.addEventListener('change', () => this.changeCheckbox())
            })

            this.btnSelect = this.popup.modal.querySelector('.btn')
            this.btnSelect.addEventListener('click', () => this.selectedColor())
        }

        selectedColor() {
            let container = this.$el.closest('.sp-details__colorpick')
            container.querySelector('.color-name').innerText = this.result[0].text

            if (this.result[0].value) {
                container.querySelector('.multi-color__wrp').innerHTML = ''

                this.result[0].value.split(',').forEach(color => {
                    let el = document.createElement('span')
                    el.style.setProperty('background', color)
                    container.querySelector('.multi-color__wrp').append(el)
                })
            }

            this.popup.close()

        }

        changeCheckbox() {

            this.popup.modal.querySelectorAll('input[type=radio]').forEach(input => {
                if (input.checked) {
                    this.result.push({
                        text: input.parentNode.querySelector('.product-checkbox__color-name').innerText,
                        value: input.value
                    })
                }
            })

            if (this.result.length) {
                this.btnSelect.removeAttribute('disabled')
            } else {
                this.btnSelect.setAttribute('disabled', 'disabled')
            }
        }
    }

    document.querySelectorAll('[data-select-color="open"]').forEach(item => {
        item.addEventListener('click', () => {
            let selectColor = new SelectColor({
                el: item
            })

            selectColor.open()
        })
    })




    /* =====================================
    select size
    ===================================== */

    class SizeList {
        constructor(el, list) {
            this.$el = el
            this.list = list
            this.container = null;

            this.init()
        }

        init() {
            this.container = this.$el.closest('.sp-details__border').querySelector('.sp-details__left')
            this.container.innerHTML = "";
            this.create()
        }

        getTemplate(item) {
            return `
                <span>${item.size}</span>
                <span>${item.count}шт</span>
            `;
        }

        create() {
            this.list.forEach(item => {
                let el = document.createElement('div')
                el.classList.add('item-size')
                el.innerHTML = this.getTemplate(item)
                this.container.append(el)
            })

            if (this.list.length > 3 && document.body.clientWidth > 576) {
                this.$el.closest('.sp-details__border').classList.add('is-view-all')
                return false;
            }


            if (this.list.length > 2) {
                let btn = document.createElement('div')
                btn.classList.add('more-items')
                btn.innerText = 'еще...'

                btn.addEventListener('click', e => {
                    this.$el.closest('.sp-details__border').classList.toggle('is-view-all')
                })

                this.container.append(btn)
            }
        }
    }


    class SelectSize {
        constructor(params) {
            this.$el = params.el
            this.popup = null;
            this.result = null;
            this.btnAdd = null;
            this.config = {
                maxCount: 100
            }

            this.init()
        }

        init() {
            this.popup = new afLightbox({
                mobileInBottom: true,
                clases: 'af-position-left'
            })
        }

        open() {
            this.popup.open('<div class="af-spiner" ></div>', false)



            window.ajax({
                type: 'GET',
                url: '/parts/_select-size.html'
            }, (status, response) => {
                this.popup.changeContent(response)
                this.addEvent()
            })
        }

        changeCountInc(e) {
            let el = e.target.closest('.counter')
            let input = el.querySelector('[type=text]')

            if (input.value < this.config.maxCount) input.value++

            this.calcTotalPrice()
        }

        changeCountDec(e) {
            let el = e.target.closest('.counter')
            let input = el.querySelector('[type=text]')

            if (input.value > 0) input.value--

            this.calcTotalPrice()
        }

        changeCountInput(e) {

            e.target.value = e.target.value.replace(/\D/g, '')

            if (e.target.value > this.config.maxCount) {
                e.target.value = this.config.maxCount
                return;
            }

            if (e.target.value < 0) {
                e.target.value = 0
                return;
            }


        }

        calcTotalPrice() {

            this.result = []

            this.popup.modal.querySelectorAll('input[type=text]').forEach(input => {

                input.setAttribute('data-is-empty', input.value > 0)


                if (input.value > 0) {
                    this.result.push({
                        count: input.value,
                        size: input.dataset.size,
                        price: input.dataset.price,
                    })
                }


            })

            this.popup.modal.querySelector('[data-total]').innerText = this.result.reduce((acc, item) => {
                return acc + (Number(item.price) * Number(item.count))
            }, 0) + ' ₽'

            this.popup.modal.querySelector('[data-count]').innerText = this.result.reduce((acc, item) => {
                return acc + Number(item.count)
            }, 0)

            if (this.result.length) {
                this.btnAdd.removeAttribute('disabled')
            } else {
                this.btnAdd.setAttribute('disabled', 'disabled')
            }
        }

        changeCountBlur(e) {

            if (!e.target.value.length) {
                e.target.value = 0
                return;
            }

            this.calcTotalPrice()
        }

        removeItem(e) {
            e.preventDefault()
            e.stopPropagation()
            e.target.closest('.popup-select-color__tr').querySelector('[type=text]').value = 0
            this.calcTotalPrice()
        }

        sizeAdd() {
            new SizeList(this.$el, this.result)
            this.popup.close()
        }

        addEvent() {
            this.popup.modal.querySelectorAll('input[type=text]').forEach(input => {
                input.addEventListener('input', (e) => this.changeCountInput(e))
                input.addEventListener('change', (e) => this.changeCountBlur(e))
            })

            this.popup.modal.querySelectorAll('.counter__inc').forEach(input => {
                input.addEventListener('click', (e) => this.changeCountInc(e))
            })

            this.popup.modal.querySelectorAll('.counter__dec').forEach(input => {
                input.addEventListener('click', (e) => this.changeCountDec(e))
            })

            this.popup.modal.querySelectorAll('.ic-remove').forEach(item => {
                item.addEventListener('click', (e) => this.removeItem(e))
            })

            this.popup.modal.querySelectorAll('[data-btn=add]').forEach(item => {
                this.btnAdd = item;
                item.addEventListener('click', (e) => this.sizeAdd())
            })

            initAjaxPopup(this.popup.modal)
        }


    }

    document.querySelectorAll('[data-select-size="open"]').forEach(item => {
        item.addEventListener('click', () => {
            let sizeSelect = new SelectSize({
                el: item
            })
            sizeSelect.open()
        })
    })

    /* ===========================================
    similar share
    ===========================================*/

    function initSharedLink(container) {
        container.querySelectorAll('[data-share="link"]').forEach(item => {
            item.addEventListener('click', e => {

                const url = e.target.closest('[data-share]').dataset.url

                const shareData = {
                    title: document.title,
                    text: document.querySelector('meta[name="description"]').getAttribute('content'),
                    url,
                };

                if (navigator.share && document.body.clientWidth < 992) {
                    navigator.share(shareData)
                        .then(() => console.log('Shared successfully'))
                        .catch((error) => console.error('Sharing failed:', error));

                } else {

                    const instansePopup = new afLightbox({
                        mobileInBottom: true
                    })

                    const html = `
                        <div class="popup-confirm" data-form-success="remove">
                            <div class="popup-confirm__title">Поделиться</div>
                            <div class="popup-confirm__desc">Скопируйте ссылку и отправте друзьям!</div>
                            <div class="popup-confirm__form">
                                    <textarea cols="40" ></textarea>
                            </div>
                            <div class="popup-confirm__btns">
                                    <button class="btn" data-copy="link" >Скопировать в буфер</button>
                                    <button class="btn btn-gray" data-af-popup="close">Закрыть</button>
                            </div>
    
                        </div>
                    `;

                    instansePopup.open(html, (instanse) => {
                        instanse.querySelector('textarea').value = url
                        instanse.querySelector('[data-copy="link"]').addEventListener('click', e => {
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(url)
                                    .then(() => {
                                        window.STATUS.msg('Ссылка скопирована в буфер обмена!')
                                    })
                                    .catch(err => {
                                        console.log('Something went wrong', err);
                                    });
                            }
                        })
                    })

                }
            })
        })
    }

    initSharedLink(document)

    /* =====================================
    init QuickviewPopup
    =====================================*/

    function initQuickviewPopup(popup) {

        if (popup.querySelector('[data-slider="quickview"]')) {
            const items = popup.querySelectorAll('[data-slider="quickview"]')

            items.forEach(slider => {
                let splide = new Splide(slider, {
                    arrows: true,
                    arrowPath: SLIDER_ARROW_PATH,
                    pagination: false,
                    gap: 5,
                    start: 0,
                    perPage: 2,
                    perMove: 2,
                    flickMaxPages: 1,
                    flickPower: 100
                });

                splide.mount();
            })

        }

        //init shared popup
        initSharedLink(popup)

        //init select size
        popup.querySelectorAll('[data-select-size="open"]').forEach(item => {
            item.addEventListener('click', () => {
                let sizeSelect = new SelectSize({
                    el: item
                })
                sizeSelect.open()
            })
        })

        //init select color

        popup.querySelectorAll('[data-select-color="open"]').forEach(item => {
            item.addEventListener('click', () => {
                let selectColor = new SelectColor({
                    el: item
                })

                selectColor.open()
            })
        })

        // init tooltip
        new TooltipAjax()
    }


    /* ====================================
    ajax tooltip
    ====================================*/

    if (document.querySelector('[data-prop-tooltip]')) {
        new TooltipAjax()
    }

    /* ====================================
    popup success
    ====================================*/

    function popupSuccess() {
        let popup = new afLightbox({
            mobileInBottom: true,
            clases: 'af-position-left af-content-center'
        })

        let html = `
            <div class="popup-form">
                <div class="popup-form__wrp">
                    <div class="popup-form__icon">
                        <svg  class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                            <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                            <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </div>
                    <div class="popup-form__title">Заявка отправлена успешно!</div>
                    <div class="popup-form__desc">Наш специалист свяжется с вами в течении рабочего дня.</div>
                    <div class="popup-form__btn">
                        <button class="btn btn-small" data-af-popup="close" >Ок</button>
                    </div>
                </div>
            </div>
        `;

        popup.open(html, false)
    }

    /* ====================================
    popup ajax
    ====================================*/



    function initAjaxPopup(container) {
        container.querySelectorAll('[data-popup="ajax"]').forEach(item => {
            item.addEventListener('click', () => {

                let popup = new afLightbox({
                    mobileInBottom: true,
                    clases: 'af-position-left af-content-center'
                })

                popup.open('<div class="af-spiner" ></div>', false)



                window.ajax({
                    type: 'GET',
                    url: item.dataset.url,
                }, (status, response) => {



                    popup.changeContent(response)

                    //mask
                    popup.modal.querySelectorAll('.multi-mask').forEach(el => {
                        new MultiMask({
                            el
                        })
                    })

                    // validation
                    new Validation(popup.modal.querySelectorAll('form'))

                    // input
                    new materialInput().init()

                    //init maska
                    initMaska()

                    if (popup.modal.querySelector('form')) {
                        popup.modal.querySelector('form').addEventListener('submit', e => onSubmitPopup(e, popup))
                    }

                    if (popup.modal.querySelector('[data-popup="ajax"]')) {
                        initAjaxPopup(popup.modal)
                    }

                    if (popup.modal.querySelector('.quickview')) {
                        initQuickviewPopup(popup.modal)
                    }

                })

            })
        })
    }


    if (document.querySelector('[data-popup="ajax"]')) {

        function onSubmitPopup(e, popup) {
            e.preventDefault()
            popup.close()
            popupSuccess()
        }

        initAjaxPopup(document)

    }

    /* ============================
    form
    ============================*/

    document.querySelectorAll('form').forEach(item => {
        item.addEventListener('submit', (e) => {
            e.preventDefault()
            item.reset()
            popupSuccess()
            MATERIAL_INPUT.reset()

        })
    })

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

            afterLoad(instance) {
                if (instance.querySelector('.splide')) {
                    const slider = new Splide(instance.querySelector('.splide'), {
                        arrows: true,
                        arrowPath: SLIDER_ARROW_PATH,
                        pagination: false,
                        perPage: 2,
                        perMove: 2,
                        updateOnMove: true,
                        gap: 5
                    });

                    slider.mount();
                }

                if (instance.querySelector('[data-select-size="open"]')) {
                    let el = instance.querySelector('[data-select-size="open"]')
                    el.addEventListener('click', () => {
                        let sizeSelect = new SelectSize({
                            el
                        })
                        sizeSelect.open()
                    })
                }

                if (instance.querySelector('[data-select-color="open"]')) {
                    let el = instance.querySelector('[data-select-color="open"]')
                    el.addEventListener('click', () => {
                        let colorSelect = new SelectColor({
                            el
                        })
                        colorSelect.open()
                    })
                }

                initSharedLink(instance)


            }


            addEvents() {
                this.$el.querySelectorAll('[data-color]').forEach((item, index) => {
                    item.addEventListener('click', e => this.changeColor(e, item.closest('li')))

                    if (index == 0) item.closest('li').classList.add('is-active')
                })

                this.$el.querySelectorAll('.minicard__tocart').forEach((item, index) => {
                    item.addEventListener('click', () => {
                        item.classList.toggle('is-active')

                        let popup = new afLightbox({
                            mobileInBottom: true,
                            clases: 'af-position-left'
                        })

                        popup.open('<div class="af-spiner" ></div>', false)

                        window.ajax({
                            type: 'GET',
                            url: '/parts/_popup-tocart.html',
                        }, (status, response) => {
                            popup.changeContent(response)
                            this.afterLoad(popup.modal)
                        })

                    })
                })
            }
        }

        document.querySelectorAll('.minicard').forEach(item => new Minicard(item))

    }

    /* ====================================
    action bar
    ====================================*/

    if (document.querySelector('.action-bar')) {
        document.querySelector('footer').classList.add('footer-action-bar')
    }

    /* ====================================
    flex collections
    ====================================*/

    class FlexCollections {
        constructor(params) {
            this.params = params
            this.$el = document.querySelector(params.el) || document
            this.widthButtonShowMore = 110;
            this.container = document.querySelector(this.params.container) || document
            this.showMoreBotton = this.container.querySelector('.show-more-tag')
            this.init()
        }

        init() {
            this.addEvent()
            this.render()

        }

        heightItems() {
            return this.$el.clientHeight;
        }

        heightContainer() {

            let heightItem = this.$el.querySelector('li').offsetHeight

            if (document.body.clientWidth > 760) {
                return heightItem * 2
            } else {
                return heightItem
            }

        }

        render() {

            if (this.$el.closest(this.params.container).classList.contains('is-open')) {
                return false;
            }

            this.$el.querySelectorAll('li.is-hide').forEach(li => li.classList.remove('is-hide'))

            this.showMoreBotton.style.display = (this.heightItems() > this.heightContainer() ? 'flex' : 'none')

            let i = 0;

            while (this.heightItems() > this.heightContainer()) {
                let visibleElements = this.$el.querySelectorAll('li:not(.is-hide)')
                if (visibleElements[(visibleElements.length - 1)]) {
                    visibleElements[(visibleElements.length - 1)].classList.add('is-hide')
                }

                i++;

                if (i > 100) return false
            }

            this.container.classList.contains('is-init') || this.container.classList.add('is-init')

        }

        debounce(method, delay, e) {
            clearTimeout(method._tId);
            method._tId = setTimeout(function () {
                method(e);
            }, delay);
        }


        addEvent() {
            const resizeHahdler = (e) => {
                this.render()
            }

            const observer = new ResizeObserver((entries) => {
                this.debounce(resizeHahdler, 30, entries)
            });

            observer.observe(document.querySelector(this.params.container));

            this.showMoreBotton.addEventListener('click', e => {
                this.container.classList.toggle('is-open');
                this.showMoreBotton.querySelector('span').innerText = this.container.classList.contains('is-open') ? 'Свернуть' : 'Eще...'

            })
        }

    }

    if (document.querySelector('.tag-collections__list')) {
        let collections = new FlexCollections({
            el: '.tag-collections__list ul',
            container: '.tag-collections__list'
        })
    }


    /* =================================
    top-search
    =================================*/

    class Find {
        constructor(params) {
            this.params = params
            this.$el = document.querySelector(params.el) || console.error('error: el undefined')
            this.placeholder = document.querySelector('[data-find="placeholder"]')
            this.openButton = document.querySelectorAll('[data-find="open"]')
            this.closeButton = document.querySelectorAll('[data-find="close"]')
            this.blockSuggest = this.$el.querySelector('[data-find="sgst"]')
            this.listSuggest = this.$el.querySelector('[data-find="list"]')
            this.input = document.querySelector('[data-find="input"]')
            this.form = document.querySelector('[data-find="form"]')
            this.totalResult = this.$el.querySelector('[data-find="total"]')
            this.timer = null
            this.isiOS = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
            this.recent = []

            this.init()
            this.addEvents()

        }

        init() {
            if (localStorage.getItem('find_queries') == null || localStorage.getItem('find_queries') == '') {
                localStorage.setItem('find_queries', JSON.stringify([]))

            } else {
                this.recent = JSON.parse(localStorage.getItem('find_queries'))
            }


            this.createButtonEnter()
            this.getRecentQuery()
        }

        createButtonEnter() {

            let button = document.createElement('span')
            button.classList.add('find-enter')

            button.addEventListener('click', () => {
                this.goToPage()
            })

            document.querySelector('.header__find').append(button)
        }

        lockScroll(val) {
            if (val) {
                //fix iOS body scroll
                if (this.isiOS) {
                    document.body.style.marginTop = `-${window.scrollY}px`
                    document.documentElement.classList.add('safari-fixed')
                }
                document.documentElement.classList.add('page-hidden')
            } else {

                //fix iOS body scroll
                let documentBody = document.body

                if (this.isiOS) {
                    if (document.documentElement.classList.contains('safari-fixed')) document.documentElement.classList.remove('safari-fixed')
                    const bodyMarginTop = parseInt(documentBody.style.marginTop, 10)
                    documentBody.style.marginTop = ''
                    if (bodyMarginTop || bodyMarginTop === 0) window.scrollTo(0, -bodyMarginTop)
                }

                document.documentElement.classList.remove('page-hidden')
            }
        }

        hideKeyboardMobile() {
            this.input.setAttribute('readonly', 'readonly');
            this.input.setAttribute('disabled', 'true');
            setTimeout(() => {
                this.input.blur();
                this.input.removeAttribute('readonly');
                this.input.removeAttribute('disabled');
            }, 100);
        }

        openFind() {
            this.$el.classList.add('is-open')
            this.lockScroll(true)

            const closeInOut = (e) => {

                if (e.target.closest('.header')) return false

                if (!e.target.closest(this.params.el)) {
                    this.closeFind()
                    document.removeEventListener('click', closeInOut)
                }
            }

            document.addEventListener('click', closeInOut)
            document.body.classList.toggle('open-find-popup', true)
        }

        closeFind() {
            this.$el.classList.remove('is-open')
            //this.closeSuggest()
            this.lockScroll(false)
            document.querySelector('header').classList.toggle('is-mobile', false)
            document.body.classList.toggle('open-find-popup', false)

        }

        openSuggest() {
            this.blockSuggest.style.setProperty('display', 'block')
            this.placeholder.classList.toggle('hide', true)
        }

        closeSuggest() {
            this.blockSuggest.style.removeProperty('display')
            this.placeholder.classList.toggle('hide', false)
        }

        declination(value, words) {
            value = Number(value);
            value = Math.abs(value) % 100;
            var num = value % 10;
            if (value > 10 && value < 20) return words[2];
            if (num > 1 && num < 5) return words[1];
            if (num == 1) return words[0];
            return words[2];
        }

        getTemplateCategory(data) {
            return `
                <div class="top-search__category"><a href="${data.href}">
                    <div class="top-search__title">${data.title}</div>
                    <div class="top-search__path">${data.desc}</div></a>
                </div>`;
        }

        getTemplateProduct(data) {
            return `
                <div class="top-search__product"><a href="${data.href}">
                    <div class="top-search__row">
                        <div class="top-search__image">
                            <span class="bgimage" style="background-image: url(${data.image});"></span>
                        </div>
                        <div class="top-search__main">
                            <div class="top-search__title">${data.title}</div>
                            <div class="top-search__desc">${data.desc}</div>
                            <div class="top-search__cost">${data.cost}</div>
                        </div>
                    </div></a>
                </div>`;
        }

        getRecentQuery() {

            if (!this.recent.length) {
                this.$el.querySelector('.top-search__looking').remove();
                return false
            }

            let str = this.recent.reverse().reduce((prev, curr) => {
                return prev + `<li>${curr} <span class="ts-remove" ></span></li>`
            }, '')

            this.$el.querySelector('.top-search__looking ul').innerHTML = str

            this.clickEl(this.$el.querySelectorAll('.top-search__looking ul li'))

        }

        clickEl(list) {
            list.forEach(item => {
                item.addEventListener('click', () => {
                    this.input.value = item.innerText;
                    this.ajaxRequest(this.input.value, (response) => {
                        this.render(response)
                        this.openSuggest()
                    })
                })
            })
        }

        ajaxRequest(value, callback) {
            window.ajax({
                type: 'GET',
                url: '/json/suggest.json?q=' + value,
                responseType: 'json'

            }, function (status, response) {
                callback(response)
            })
        }

        render(json) {

            //clear before render
            this.listSuggest.innerHTML = ''

            if (json['category']) {

                json['category'].forEach(item => {
                    let el = document.createElement('div')
                    el.classList.add('top-search__item')
                    el.innerHTML = this.getTemplateCategory(item)

                    this.listSuggest.append(el)
                })


            }

            if (json['products']) {
                json['products'].forEach(item => {
                    let el = document.createElement('div')
                    el.classList.add('top-search__item')
                    el.innerHTML = this.getTemplateProduct(item)

                    this.listSuggest.append(el)
                })

                this.totalResult.innerText = json['products'].length + this.declination(json['products'].length, [' товар', ' товара', ' товаров'])
            }
        }

        changeInput(e) {

            if (e.target.value.length > 1) {
                this.openFind()
                this.openSuggest()
            } else {
                this.closeSuggest()
            }

            this.ajaxRequest(e.target.value, (response) => {
                this.render(response)
                //this.hideKeyboardMobile()
            })
        }

        debounce(method, delay, e) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => method(e), delay);
        }

        saveLocalstorage() {
            localStorage.setItem('find_queries', JSON.stringify(this.recent.slice(-5)))
        }

        goToPage() {
            window.location.href = this.form.getAttribute('action')
        }

        addEvents() {

            const keyupHahdler = (e) => {
                this.changeInput(e)
            }

            this.input.addEventListener('focus', (e) => {
                //this.changeInput(e)
                this.openFind()
            })

            this.input.addEventListener('keydown', e => {
                if (e.keyCode == 13) {

                    this.goToPage()
                    this.recent.push(e.target.value)
                    this.saveLocalstorage()
                }
            })

            this.input.addEventListener('keyup', e => this.debounce(keyupHahdler, 200, e))

            this.closeButton.forEach(button => {
                button.addEventListener('click', e => {
                    this.closeFind()
                    this.input.value = ''
                })
            })

            document.querySelector('.find-icon').addEventListener('click', (e) => {
                e.target.closest('header').classList.toggle('is-mobile')
                e.target.closest('header').classList.contains('is-mobile') ? this.openFind() : this.closeFind()
            })

            document.querySelectorAll('.top-search__looking .ts-remove').forEach((item, index) => {
                item.addEventListener('click', e => {
                    e.stopPropagation()
                    this.recent.splice(index, 1)
                    this.saveLocalstorage()
                    e.target.closest('li').remove()
                })
            })

        }
    }

    window.find = new Find({
        el: '.top-search'
    })


    /* ====================================
    attach file
    ====================================*/

    if (document.querySelector('.attach-file')) {
        const input = document.querySelector('.attach-file input')
        const fileArray = [];

        function removeFileFromFileList(index, input) {
            const dt = new DataTransfer()
            const {
                files
            } = input

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (index !== i) dt.items.add(file)
            }

            input.files = dt.files // Assign the updates list
        }

        input.addEventListener('change', function (e) {

            const dt = new DataTransfer()

            if (e.target.closest('.attach-file').querySelector('.file-attach')) {
                e.target.closest('.attach-file').querySelectorAll('.file-attach').forEach(f => {
                    f.remove()
                })
            }

            for (let i = 0; i < input.files.length; ++i) {

                if (fileArray.length <= 19) {
                    fileArray.push(input.files[i])
                } else {
                    window.STATUS.wrn('Допустимо не более 20 файлов. Лишние файлы были удалены')
                }


            }

            fileArray.forEach((fileItem, i) => {

                let file = document.createElement('span')
                file.classList.add('file-attach')
                file.innerHTML = `
                    <div class="file-attach__name" >${fileItem['name']}</div>
                    <div class="file-attach__remove" >+</div>
                `;

                //event remove
                file.querySelector('.file-attach__remove').addEventListener('click', event => {
                    event.preventDefault()
                    event.stopPropagation()

                    removeFileFromFileList(i, input);
                    file.remove();

                    console.log(fileArray)

                    if (e.target.closest('.attach-file').querySelectorAll('.file-attach').length == 0) {
                        e.target.closest('.attach-file').classList.remove('is-loaded')
                    }
                })


                dt.items.add(fileItem)
                input.files = dt.files;

                e.target.closest('.attach-file').classList.add('is-loaded')
                e.target.closest('.attach-file').append(file)
            })
        })
    }


    /* ===================================
    tab delivery
    ===================================*/

    if (document.querySelector('[data-tab-container="type"]')) {

        const tabs = document.querySelectorAll('[data-tab]')
        const tabitems = document.querySelectorAll('[data-tabitem]')
        const container = document.querySelector('[data-tab-container="type"]')

        tabs.forEach(tab => {

            tab.addEventListener('click', e => {
                tabitems.forEach(tabitem => {
                    if (tabitem.dataset.tabitem == tab.dataset.tab) {
                        tabitem.classList.add('is-active')
                    } else {
                        !tabitem.classList.contains('is-active') || tabitem.classList.remove('is-active')
                    }
                })

                tabs.forEach(item => {
                    !item.classList.contains('is-active') || item.classList.remove('is-active')
                })

                tab.classList.add('is-active')
            })

        })

    }




}); //dcl