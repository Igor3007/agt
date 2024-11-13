document.addEventListener('DOMContentLoaded', function (event) {

    const API_YMAPS = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&mode=debug';


    /* =================================================
    load ymaps api
    =================================================*/

    window.loadApiYmaps = function (callback) {

        if (window.ymaps == undefined) {
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
    window.loadApiYmaps3 = function (callback) {
        const script = document.createElement('script')
        script.src = 'https://api-maps.yandex.ru/v3/?apikey=0e2d85e0-7f40-4425-aab6-ff6d922bb371&lang=ru_RU'
        script.onload = () => {
            callback()
        }
        document.head.append(script)
    }


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

    /* ============================================
    phone header
    ============================================*/

    if (document.querySelector('.header-phone-button')) {
        document.querySelector('.header-phone-button').addEventListener('click', e => {
            if (document.body.clientWidth > 481) {
                document.querySelector('.header-phone-wrp').classList.toggle('is-open')
            } else {
                const instansePopup = new afLightbox({
                    mobileInBottom: true
                })

                const html = document.querySelector('.header-phone-wrp').cloneNode(true)
                instansePopup.open(html.outerHTML, (instanse) => {
                    initDataModal(instanse)

                    instanse.querySelector('.header-callback').addEventListener('click', (e) => instansePopup.close())
                })
            }
        })
    }

    /* =========================================
    first block
    =========================================*/

    if (document.querySelector('.first-block__slide')) {

        const bgContainer = document.querySelector('.first-block__bg')

        document.querySelectorAll('.first-block__slide').forEach((slide, index) => {
            slide.addEventListener('mouseenter', (e) => {
                if (document.body.clientWidth > 992 && bgContainer.dataset.slideIndex != index) {

                    bgContainer.classList.add('fade-out-animate')

                    setTimeout(() => {
                        bgContainer.innerHTML = slide.querySelector('.fb-slide__image').innerHTML
                        bgContainer.classList.remove('fade-out-animate')
                        bgContainer.dataset.slideIndex = index
                    }, 200)

                }
            })
        })
    }

    /* ========================================
    slider
    ========================================*/


    if (document.querySelector('[data-slider="product"]')) {
        var splide22 = new Splide('[data-slider="product"]', {

            arrows: true,
            pagination: false,
            gap: 24,
            start: 0,
            perPage: 4,


            breakpoints: {
                1200: {
                    perPage: 3,
                    gap: 24,
                },
                992: {
                    perPage: 2,
                    gap: 12,
                },
                576: {
                    destroy: true,
                },

            },

        });




        splide22.mount();
    }

    /* ==================================================
    get width scrollbar
    ==================================================*/

    window.getScrollBarWidth = function () {

        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll'; // forcing scrollbar to appear
        outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
        document.body.appendChild(outer);

        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);

        // Calculating difference between container's full width and the child width
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);

        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);

        return scrollbarWidth;

    }

    /* ==============================================
    button page scroll-top
    ============================================== */

    if (document.querySelector('.float-bar__top')) {
        const btnPageScrollTop = document.querySelector('.float-bar__top')
        const btnFloat = document.querySelector('.float-bar')
        btnPageScrollTop.addEventListener('click', e => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        })

        window.addEventListener('scroll', e => {
            if (document.documentElement.scrollTop > 400) {
                btnFloat.classList.add('is-active')
            } else {
                if (btnFloat.classList.contains('is-active')) btnFloat.classList.remove('is-active')
            }
        })
    }

    /* ===========================================
    marquee 
    ===========================================*/

    class Marquee {
        constructor(el) {
            this.$el = el
            this.containerWidth = this.$el.clientWidth
            this.trackWidth = 0
            this.deltaWidth = 0
            this.currentPosition = 0
            this.shift = 10
            this.scrollDirection = '-'

            this.init()

        }


        init() {

            this.getTrackWidth()
            this.deltaWidth = this.trackWidth - this.containerWidth
            this.run()
            //this.scrollHandler()
        }

        getTrackWidth() {
            this.$el.querySelectorAll('li').forEach(li => {
                this.trackWidth += li.clientWidth
            })
        }

        run() {
            setInterval(() => {

                if (this.currentPosition < this.deltaWidth && this.scrollDirection == '-') {
                    this.currentPosition = this.currentPosition + this.shift;
                } else {
                    this.scrollDirection = '+'
                    this.currentPosition = this.currentPosition - this.shift;

                    if (this.currentPosition <= 0) {
                        this.scrollDirection = '-'
                    }
                }

                this.$el.querySelector('ul').style.transform = 'translateX(-' + this.currentPosition + 'px)'
            }, 290)
        }

        scrollHandler() {

            const checkScrollDirection = (event) => {
                this.scrollDirection = checkScrollDirectionIsUp(event) ? '+' : '-'
            }

            const checkScrollDirectionIsUp = (event) => {
                if (event.wheelDelta) {
                    return event.wheelDelta > 0;
                }
                return event.deltaY < 0;
            }

            document.body.addEventListener('wheel', checkScrollDirection);

        }


    }

    if (document.querySelector('[data-marquee]')) {
        const items = document.querySelectorAll('[data-marquee="container"]')
        items.forEach(item => new Marquee(item))
    }

    /* =======================================
    catalogPopup
    =======================================*/

    if (document.querySelector('a[href="#catalog-popup"]')) {

        class catalogPopup {
            constructor() {
                this.$el = document.querySelector('.catalog-popup')
                this.btnCatalog = document.querySelectorAll('a[href="#catalog-popup"]')
                this.btnClose = this.$el.querySelector('[data-catalog-popup="close"]')
                this.mobileBreakpoint = 993;
                this.initWindowWidth = document.body.clientWidth
                this.widthScrollbar = window.getScrollBarWidth()
                this.isiOS = window.isIOS
                this.currentUrl = window.location.pathname
                this.timer = null

                this.events()
            }

            open() {
                this.$el.classList.add('open')
                this.lockScroll(true)
                const items = this.$el.querySelector('.catalog-popup__nav').querySelectorAll('li')
                if (document.body.clientWidth > this.mobileBreakpoint && items.length) {
                    this.openSubDesctop(items[0])
                }
            }

            close() {

                this.$el.classList.add('fade-close-animation')

                setTimeout(() => {
                    this.$el.classList.remove('open')
                    this.$el.classList.remove('fade-close-animation')

                }, 400)

                this.lockScroll(false)
            }

            lockScroll(val) {
                if (val) {
                    //fix iOS body scroll
                    if (this.isiOS) {
                        document.body.style.marginTop = `-${window.scrollY}px`
                        document.documentElement.classList.add('safari-fixed')
                    } else {

                    }
                    //compensate scrollbar
                    //if (this.widthScrollbar > 0) document.body.style.setProperty('margin-right', this.widthScrollbar + 'px')

                    //page overflow hidden
                    document.body.classList.add('page-hidden')

                } else {

                    //fix iOS body scroll
                    let documentBody = document.body

                    if (this.isiOS) {
                        if (document.documentElement.classList.contains('safari-fixed')) document.documentElement.classList.remove('safari-fixed')
                        const bodyMarginTop = parseInt(documentBody.style.marginTop, 10)
                        documentBody.style.marginTop = ''
                        if (bodyMarginTop || bodyMarginTop === 0) window.scrollTo(0, -bodyMarginTop)
                    }

                    //compensate scrollbar
                    //document.body.style.removeProperty('margin-right', this.widthScrollbar + 'px')

                    //page overflow hidden
                    documentBody.classList.remove('page-hidden')
                }
            }

            openSubMobile(item) {

                if (item.querySelector('.sub-menu')) {

                    const template = `
                        <div class="catalog-popup__layer-title" >
                            <span class="icon-back" ></span>
                            <span class="layer-name" >${item.querySelector('a').innerText}</span>
                            <span class="icon-cross" ></span>
                        </div>
                        <div class="catalog-popup__layer-nav" ><ul>${item.querySelector('.sub-menu').innerHTML}</ul></div>
                       `;

                    const layer = document.createElement('div')
                    layer.classList.add('catalog-popup__layer')
                    layer.innerHTML = template

                    layer.querySelector('.icon-back').addEventListener('click', e => {
                        layer.remove()
                    })

                    layer.querySelector('.icon-cross').addEventListener('click', e => {
                        this.close()
                    })

                    this.liEvents(layer)

                    this.$el.querySelector('.catalog-popup__main').append(layer)


                }

            }


            getColumnMenu(menu) {
                let items = menu.querySelector('.sub-menu').children
                let result = '';
                let columns = 3

                let array = Array.from(items);
                var partSize = Math.ceil(array.length / columns);

                for (var i = 0; i < array.length; i += partSize) {
                    let subarray = array.slice(i, i + partSize)
                    let ul = document.createElement('ul')

                    subarray.forEach(li => ul.append(li))
                    result += ul.outerHTML
                }

                return result
            }


            openSubDesctop(item) {

                if (item.querySelector('.sub-menu')) {

                    item.classList.add('is-hover')

                    const template = `
                       <div class="catalog-popup__catig" >${item.querySelector('.category-tree--level1').innerText}</div>
                       <div class="catalog-popup__list" >${this.getColumnMenu(item.cloneNode(true))}</div>
                      `;

                    const layer = document.createElement('div')
                    layer.classList.add('catalog-popup__submenu')
                    layer.innerHTML = template

                    const subMenu = layer.querySelectorAll('.sub-menu')
                    subMenu.forEach(item => {

                        if (item.querySelectorAll('li').length > 7) {

                            item.classList.add('is-slice-list')
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

                    // закрывать при переходе на другую страницу
                    layer.querySelectorAll('a').forEach(link => {
                        link.addEventListener('click', e => {
                            setTimeout(() => {
                                this.close()
                            }, 300)
                        })
                    })

                    this.$el.querySelector('.catalog-popup__main').innerHTML = '';
                    this.$el.querySelector('.catalog-popup__main').append(layer)

                }

            }

            events() {

                this.btnCatalog.forEach(item => {
                    item.addEventListener('click', e => {
                        e.preventDefault()
                        this.open()
                    })
                })

                this.liEvents(this.$el.querySelector('.catalog-popup__nav'))

                document.addEventListener('click', e => {
                    if (document.body.clientWidth > this.mobileBreakpoint) {
                        if (!e.target.closest('.catalog-popup__wrp') && !e.target.closest('a[href="#catalog-popup"]')) {
                            this.close()
                        }
                    }
                })


                this.btnClose.addEventListener('click', e => {
                    this.close()
                })


            }



            debounce(method, delay, e) {
                clearTimeout(this.timer);
                this.timer = setTimeout(function () {
                    method(e);
                }, delay);
            }

            liEvents(container) {
                const items = container.querySelectorAll('li')




                items.forEach(item => {

                    const keyupHahdler = (e) => {
                        items.forEach(item => {
                            if (item.classList.contains('is-hover')) {
                                item.classList.remove('is-hover')
                            }
                        })


                        if (document.body.clientWidth > this.mobileBreakpoint) {
                            this.openSubDesctop(item)
                        } else {
                            this.openSubMobile(item)
                        }
                    }

                    item.addEventListener((document.body.clientWidth > this.mobileBreakpoint ? 'mouseenter' : 'click'), e => this.debounce(keyupHahdler, 200, e))
                })
            }
        }

        if (document.querySelector('.catalog-popup')) {
            window.catalogPopup = new catalogPopup()
        }


    }

    /* =================================================
     popups
     =================================================*/

    function popupSuccess() {

        const instansePopup = new afLightbox({
            mobileInBottom: true
        })

        instansePopup.open(`
           <div class="popup-thanks" >
                <h2> Спасибо! </h2>
                <p>Мы свяжемся с вами в ближайшее время!</p>
           </div> `, false)

    }

    function initDataModal(ctx) {
        const items = ctx.querySelectorAll('[data-modal]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                window.ajax({
                    type: 'GET',
                    url: item.dataset.modal
                }, (status, response) => {

                    const instansePopup = new afLightbox({
                        mobileInBottom: true
                    })

                    instansePopup.open(response, (instanse) => {
                        initMaska()

                        if (instanse.querySelector('form')) {
                            const form = instanse.querySelector('form')

                            form.addEventListener('submit', e => {

                                e.preventDefault()

                                const formData = new FormData(e.target)
                                let params = {}
                                let btn = form.querySelector('.btn')

                                for (let [name, value] of formData) {
                                    params[name] = value
                                }

                                btn.classList.add('btn-loading')

                                /*  window.ajax({
                                     type: 'POST',
                                     url: form.getAttribute('action'),
                                     data: params

                                 }, (status, response) => {

                                     if (status == 200) {
                                         popupSuccess();
                                         !btn.classList.contains('btn-loading') || btn.classList.remove('btn-loading')
                                         instansePopup.close()
                                     }


                                 }) */

                                setTimeout(() => {

                                    popupSuccess();
                                    !btn.classList.contains('btn-loading') || btn.classList.remove('btn-loading')
                                    instansePopup.close()
                                }, 1000)
                            })
                        }

                        if (item.dataset.title) {
                            instanse.querySelector('.popup-form__title').innerHTML = item.dataset.title
                        }

                        if (item.dataset.desc) {
                            instanse.querySelector('.popup-form__desc').innerHTML = item.dataset.desc
                        }
                    })
                })

            })
        })
    }

    if (document.querySelector('[data-modal]')) initDataModal(document)

    /* ========================================
    dfdf
    ========================================*/

    class FlexTags {
        constructor(params) {
            this.params = params
            this.$el = document.querySelector(params.el) || document
            this.widthButtonShowMore = 110;
            this.container = document.querySelector(this.params.container) || document
            this.showMoreBotton = this.container.querySelector('[data-ft="more"]')
            this.showMoreBottonText = this.showMoreBotton.querySelector('span').innerText
            this.liItems = this.$el.querySelectorAll('li')
            this.init()
        }

        init() {
            this.addEvent()
            this.render()
        }

        heightItems() {
            return this.$el.offsetHeight;
        }

        heightContainer() {

            let el = this.$el.querySelector('li')
            let heightItem = el.offsetHeight
            heightItem += parseInt(window.getComputedStyle(el).marginTop)
            heightItem += parseInt(window.getComputedStyle(el).marginBottom)

            return heightItem * this.params.rows

        }

        render() {

            if (this.$el.closest(this.params.container).classList.contains('is-open')) {
                return false;
            }

            this.$el.querySelectorAll('li.is-hide').forEach(li => li.classList.remove('is-hide'))
            this.showMoreBotton.style.display = (this.heightItems() > this.heightContainer() ? 'flex' : 'none')

            for (let i = 0; i <= this.liItems.length; i++) {

                if (this.heightItems() > this.heightContainer()) {
                    let visibleElements = this.$el.querySelectorAll('li:not(.is-hide)')
                    if (visibleElements[(visibleElements.length - 1)]) {
                        visibleElements[(visibleElements.length - 1)].classList.add('is-hide')
                    }
                }

            }

            setTimeout(() => {
                this.container.classList.add('is-init')
            }, 0)

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
                this.showMoreBotton.querySelector('span').innerText = this.container.classList.contains('is-open') ? 'Свернуть' : this.showMoreBottonText
            })
        }
    }

    if (document.querySelector('.catalog__nav')) {
        new FlexTags({
            el: '.catalog__nav ul',
            container: '.catalog__top',
            rows: 2
        })


        // scroll to catig

        const items = document.querySelectorAll('.catalog__nav li a')
        const container = document.querySelector('.catalog__categories')
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault()



                if (container.querySelector(item.getAttribute('href'))) {

                    let elem = container.querySelector(item.getAttribute('href'))

                    window.scrollToTargetAdjusted({
                        elem,
                        offset: 20
                    })
                }


            })
        })
    }

    /* ===================================================================================
    filter catalog
    ===================================================================================*/

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
                    item.closest('.filter-properties').classList.toggle('is-height-auto')
                    elem.innerText = (item.classList.contains('is-open') ? 'Свернуть' : 'Ещё')
                })

                item.after(elem)

            }

        })

    }

    /* =========================================
    show / hide item filter
    =========================================*/

    class СollapseFilterProperties {
        constructor(params) {
            this.$el = params.el
            this.maxHeightContainer = this.$el.clientHeight;
            this.head = this.$el.querySelector('.filter-properties__head')
            this.heightHead = this.head.offsetHeight + 10;

            this.addEvents()
            this.init()

            /*if(params.el.classList.contains('group_Элементы')) {
                this.close();
            }*/

        }

        init() {
            if (this.maxHeightContainer) {
                this.$el.style.maxHeight = this.maxHeightContainer + 'px';
            }
        }

        reinit(el) {
            this.maxHeightContainer = el.clientHeight
            this.heightHead = el.querySelector('.filter-properties__head').offsetHeight + 10;
            this.init()
        }

        open() {
            !this.$el.classList.contains('is-hide') || this.$el.classList.remove('is-hide');
            this.$el.style.maxHeight = this.maxHeightContainer + 'px'

            if (this.$el.querySelector('.filter-properties__list ul').classList.contains('is-open')) {
                this.$el.classList.add('is-height-auto');
            }
        }

        close() {

            this.$el.classList.add('is-hide')
            this.$el.style.maxHeight = this.heightHead + 'px';
            !this.$el.classList.contains('is-height-auto') || this.$el.classList.remove('is-height-auto');
        }

        addEvents() {
            this.head.addEventListener('click', e => {
                this.$el.classList.contains('is-hide') ? this.open() : this.close()
            })
        }
    }

    if (document.querySelector('.filter-properties__head')) {
        document.querySelectorAll('.filter-properties').forEach(el => {
            el['СollapseFilterProperties'] = new СollapseFilterProperties({
                el
            })
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
                }

                //init collapse filter
                document.querySelectorAll('.filter-properties').forEach(el => el['СollapseFilterProperties'].reinit(el))
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

    /* ======================================
    slider single product
    ======================================*/

    if (document.querySelector('[data-slider="single"]')) {

        let main = new Splide('[data-slider="single"]', {
            type: 'slide',
            pagination: false,
            arrows: false,
            cover: true,

            breakpoints: {
                992: {
                    pagination: true,
                    type: 'slide',
                },
            },
        });

        let thumbnails = new Splide('[data-slider="thumb"]', {
            rewind: true,
            perPage: 4,
            arrows: false,
            isNavigation: true,
            gap: 10,
            focus: 'center',
            pagination: false,
            cover: true,
            updateOnMove: true,
            dragMinThreshold: {
                mouse: 4,
                touch: 10,
            },
            //  breakpoints: {
            //      640: {
            //          fixedWidth: 70,
            //          fixedHeight: 70,
            //      },
            //  },
        });

        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();

    }

    /*====================================== 
    scroll nav single product
    ======================================*/

    if (document.querySelector('[data-sp="nav"]')) {
        const items = document.querySelectorAll('[data-sp="nav"] li a')
        const container = document
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault()

                if (container.querySelector(item.getAttribute('href'))) {
                    let elem = container.querySelector(item.getAttribute('href'))
                    window.scrollToTargetAdjusted({
                        elem,
                        offset: 20
                    })
                }


            })
        })
    }

    /* ====================================
    crop long text on review
    ====================================*/

    function showHideLongText() {

        let countChars = document.body.clientWidth > 576 ? 500 : 150

        document.querySelectorAll('.card-review__desc').forEach(item => {
            if (item.innerText.length > countChars) {
                item.classList.add('crop--text')

                let showButton = document.createElement('div')
                showButton.classList.add('card-review__more')
                showButton.innerText = 'Читать полностью'

                showButton.addEventListener('click', e => {

                    showButton.classList.toggle('is-open')

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

    function popupReviewAll() {
        document.querySelectorAll('.card-review').forEach(item => {

            if (item.querySelector('.card-review__desc')) {
                item.querySelector('.card-review__desc').addEventListener('click', function () {


                    const instansePopup = new afLightbox({
                        mobileInBottom: true
                    })

                    instansePopup.open(item.cloneNode(true).outerHTML, (instanse) => {
                        instanse.querySelector('.card-review').classList.add('popup-review')
                    })

                })
            }

        })

    }

    //init

    showHideLongText()
    popupReviewAll()


    /* ====================================================
    map contacts
    ====================================================*/

    function initMapContacts() {
        window.loadApiYmaps((ymaps) => {

            let points = [];
            let myMap = null;

            let isMobile = () => {
                return document.body.clientWidth <= 992
            }

            // add click for button "in-map"
            // create points array

            document.querySelectorAll('.contact-info [data-coordinates]').forEach((item, i) => {
                points.push({
                    coordinates: item.dataset.coordinates.split(',')
                })

                item.addEventListener('click', () => {
                    myMap.setCenter(points[i]['coordinates'])
                    myMap.setZoom(14)

                    //offset center map
                    if (!isMobile()) {
                        let gpc = myMap.getGlobalPixelCenter()
                        myMap.setGlobalPixelCenter([(gpc[0] + 300), (gpc[1])], 14)
                    }

                    if (isMobile()) {
                        window.scrollToTargetAdjusted({
                            elem: '#map-container',
                            offset: 20
                        })
                    }
                })
            })

            ymaps.ready(function () {

                //init ymaps
                myMap = new ymaps.Map('map-container', {
                    center: points[0].coordinates,
                    zoom: 7,
                    controls: ['zoomControl'],

                }, {
                    searchControlProvider: 'yandex#search',
                    suppressMapOpenBlock: true,
                });

                // create placemark

                for (let key in points) {
                    const myPlacemark = new ymaps.Placemark(points[key].coordinates, {
                        hintContent: 'MaxCleanRoom',
                    }, {
                        iconLayout: 'default#image',
                        iconImageHref: '/img/svg/ic_pin.svg',
                        iconImageSize: [60, 68],
                        iconImageOffset: [-30, -68]
                    });

                    myMap.geoObjects.add(myPlacemark)
                }

                // set MapCenter with offset

                function getOffsetLeft() {
                    if (!isMobile()) {
                        return (document.body.clientWidth / 2)
                    }
                    return 60;
                }

                myMap.setBounds(myMap.geoObjects.getBounds(), {
                    checkZoomRange: true,
                    zoomMargin: [30, getOffsetLeft(), 30, 30],
                    duration: 300,
                }).then(() => {
                    if (myMap.getZoom() > 6) myMap.setZoom(6);
                });

                myMap.behaviors.disable('scrollZoom');

            })
        })
    }

    //init
    if (document.querySelector('#map-container')) initMapContacts()



    /* =======================================================
    Compare
    =======================================================*/

    function Compare(params) {

        this.elemCookie = params.elemCookie;
        this.elemTotal = document.querySelector(params.elemTotal);

        this.init = function () {
            this.getTotal()
        }

        this.getTotal = function () {
            this.elemTotal.innerText = this.getArray().length ? '(' + this.getArray().length + ')' : '';
        }

        this.getArray = function () {
            if (!Cookies.get(this.elemCookie)) return new Array()

            return String(Cookies.get(this.elemCookie)).split(',')
        }

        this.add = function (id) {
            var array = this.getArray();
            array.push(id)
            array = Array.from(new Set(array))

            Cookies.set(this.elemCookie, array.join(','), {
                expires: 7
            })
            this.getTotal()
            return array;
        }

        this.remove = function (id) {

            var array = this.getArray();
            var result = array.filter(function (item) {
                return item != id
            })

            Cookies.set(this.elemCookie, result.join(','), {
                expires: 7
            })
            this.getTotal()
            return array;

        }
    }

    /* ==========================================
    popup compare
    ==========================================*/

    function comparePopup(id, type) {

        if (!id) return false

        window.ajax({
            type: 'GET',
            url: '/parts/_compare-popup.html',
            data: {
                id: id
            }
        }, (status, response) => {


            if (document.querySelector('main')) {

                let elem = document.createElement('div')
                let main = document.querySelector('main')

                elem.innerHTML = response
                elem.classList.add('popup-top-tooltip')

                //remove old
                main.querySelectorAll('.popup-top-tooltip').forEach(item => item.remove())
                main.append(elem)

                //add scroll event
                window.addEventListener('scroll', e => {
                    elem.classList.add('fadeout')
                    setTimeout(() => {
                        elem.remove()
                    }, 100)
                })

            } else {
                window.STATUS.msg('Товар добавлен в избранное')
            }


        })

    }


    /*===========================================
    init compare
    ===========================================*/

    window.compareInstance = new Compare({
        elemCookie: 'compare',
        elemTotal: '[data-total="compare"]',
    });

    const CP = window.compareInstance;

    CP.init()

    const compare = document.querySelectorAll('[data-compare]');
    const arrayCompare = CP.getArray()

    compare.forEach(function (item, index) {

        const product_id = item.dataset.compare;

        if (arrayCompare.lastIndexOf(product_id) !== -1) {
            item.classList.add('active')
        }

        item.addEventListener('click', function (event) {
            event.preventDefault()
            if (this.classList.contains('active')) {

                CP.remove(product_id)
                this.classList.remove('active')
            } else {

                CP.add(product_id)
                this.classList.add('active')
                comparePopup(product_id, 'compare')
            }
        })
    })



    /* =======================================
    page document
    =======================================*/

    if (document.querySelector('.page-document__content')) {
        const container = document.querySelector('.page-document__content ')
        const headers = container.querySelectorAll('h1,h2,h3,h4,h5,h6')
        const nav = document.querySelector('.page-document__aside ul')

        headers.forEach(item => {
            let el = document.createElement('li')
            el.innerHTML = '<a href="#" >' + item.innerText + '</a>'

            el.addEventListener('click', (e) => {

                nav.querySelectorAll('li').forEach(li => !li.classList.contains('is-active') || li.classList.remove('is-active'))
                el.classList.add('is-active')

                e.preventDefault()
                window.scrollToTargetAdjusted({
                    elem: item,
                    offset: 20
                })
            })

            nav.append(el)
        })
    }

    /* ====================================
    attach file
    ====================================*/

    if (document.querySelector('.form-attach')) {
        const input = document.querySelector('.form-attach input')
        const filelist = input.closest('form').querySelector('.attach-filelist')

        input.addEventListener('change', function (e) {

            let file = document.createElement('span')
            file.classList.add('file-attach')
            file.innerHTML = `
                <div class="file-attach__name" >${this.files[0]['name']}</div>
                <div class="file-attach__remove" >+</div>
            `;

            file.querySelector('.file-attach__remove').addEventListener('click', event => {
                event.preventDefault()
                event.stopPropagation()
                file.remove();
                e.target.value = '';
            })

            if (filelist.querySelector('.file-attach')) {
                filelist.querySelector('.file-attach').remove()
            }

            filelist.append(file)
        })
    }

    /* ====================================
    splide
    ====================================*/

    if (document.querySelector('[data-slider="cr-main"]')) {
        let main = new Splide('[data-slider="cr-main"]', {
            type: 'fade',
            pagination: false,
            arrows: true,

            breakpoints: {

                992: {
                    arrows: false,
                },


            },

        });

        let thumbnails = new Splide('[data-slider="cr-thumb"]', {
            rewind: true,
            isNavigation: true,
            gap: 4,
            focus: 'center',
            pagination: false,
            perPage: 12,
            arrows: false,

            dragMinThreshold: {
                mouse: 4,
                touch: 10,
            },

            breakpoints: {
                1200: {
                    perPage: 10,

                },
                992: {
                    perPage: 7,

                },
                576: {
                    perPage: 4,
                },

            },

        });

        main.sync(thumbnails);
        main.mount();
        thumbnails.mount();
    }

    /* =========================================
    video youtube
    =========================================*/

    if (document.querySelector('.video')) {
        document.querySelectorAll('.video').forEach(container => {

            if (container.closest('.video-block__yt')) return false

            const getYoutubeId = (url) => {
                var m = url.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
                if (!m || !m[1]) return null;
                return m[1];
            }

            container.querySelector('.video__button').addEventListener('click', e => {
                container.classList.add('is-play')

                let iframe = document.createElement('iframe')
                iframe.setAttribute('allowfullscreen', '')
                iframe.setAttribute('src', '//www.youtube.com/embed/' + getYoutubeId(container.dataset.id) + '?autoplay=true')

                container.querySelector('.video__iframe').append(iframe)
            })


        })
    }

    /* =======================================
    hover image
    =======================================*/

    if (document.querySelector('[data-map-image]')) {

        class ImageMap {
            constructor(el) {
                this.$el = el
                this.tooltip = null
                this.addEvents()
                this.offset = {
                    left: 0,
                    top: 10
                }
            }

            open() {

                let rect = this.$el.getBoundingClientRect()
                this.$el.closest('[data-map-image]').append(this.tooltip)

                this.tooltip.style.setProperty('position', 'fixed')
                this.tooltip.style.setProperty('left', rect.left + 'px')
                this.tooltip.style.setProperty('top', rect.top - (this.tooltip.clientHeight) - (this.offset.top) + 'px')

                if ((window.innerWidth - (rect.left)) < this.tooltip.clientWidth) {
                    this.tooltip.style.setProperty('left', rect.left - (this.tooltip.clientWidth) + 'px')
                }

                window.addEventListener('scroll', () => {
                    this.close()
                })
            }

            close() {
                if (this.tooltip) this.tooltip.remove()
            }

            getTooltipElem(id) {
                return document.querySelector('[data-tooltip="' + id + '"]')
            }

            clickHandler() {
                window.open(this.tooltip.querySelector('a').getAttribute('href'))
            }

            addEvents() {
                this.$el.addEventListener('mouseleave', () => {
                    this.close()
                })

                this.$el.addEventListener('click', () => {
                    this.clickHandler()
                })

                this.$el.addEventListener('mouseenter', () => {
                    if (this.getTooltipElem(this.$el.dataset.tooltipId)) {
                        this.tooltip = this.getTooltipElem(this.$el.dataset.tooltipId).cloneNode(true)
                        this.open()
                    } else {
                        console.error('Не найден элемент для подсказки')
                    }
                })


            }
        }

        document.querySelectorAll('[data-tooltip-id]').forEach(el => new ImageMap(el))

    }



    /* ======================================
    scroll smooth
    ======================================*/

    if (document.querySelector('[data-scroll="smooth"]')) {
        const items = document.querySelectorAll('[data-scroll="smooth"]')
        items.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault()

                window.scrollToTargetAdjusted({
                    elem: item.getAttribute('href')
                })
            })
        })
    }

    /* ======================================
    SHOW MORE REFERENCE
    ======================================*/

    if (document.querySelector('.table-ref')) {
        const items = document.querySelectorAll('.table-ref .table__tr')
        const btn = document.querySelector('.table-ref__more')

        items.forEach((item, index) => {
            if (index > 30) {
                item.classList.add('is-hide')
                btn.classList.add('is-show')
            }
        })

        btn.addEventListener('click', () => {
            items.forEach((item, index) => {
                !item.classList.contains('is-hide') || item.classList.remove('is-hide')
            })

            btn.classList.remove('is-show')
        })

    }


}); //dcl