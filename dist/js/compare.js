document.addEventListener('DOMContentLoaded', function (event) {

    /* ===================================
    class tabs
    ===================================*/


    class Tabs {

        constructor(params) {
            this.setting = params
            this.nav = document.querySelector(this.setting.navElem)

            if (this.nav) {
                this.container = document.querySelector(this.setting.containerElem)
                this.items = this.container.querySelectorAll('[data-tab]')
                this.init()
            }

        }


        init() {

            if (this.checkHash()) {
                this.changeTab(this.checkHash(), {
                    scroll: false
                })
            } else {
                this.changeTab(this.setting.tabStart, {
                    scroll: false
                })
            }

            this.clickTab()


        }

        checkHash() {
            if (window.location.hash == '') return false;
            return window.location.hash.replace('#', '')
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

            let leftPX = elemOffset.left - containerOffset.left + container.scrollLeft - (container.offsetWidth / 2) + (elem.offsetWidth / 2) + 5

            container.scrollTo({
                left: leftPX,
                behavior: 'smooth'
            });
        }

        changeTab(tab, params) {


            // this.items[0].classList.add('active')

            this.items.forEach(item => {

                if (item.dataset.tab.split(',').indexOf(tab) !== -1) {

                    this.items.forEach(item => {

                        if (item.dataset.tab.split(',').indexOf(tab) !== -1) {
                            item.classList.add('active')

                        } else {
                            if (item.classList.contains('active')) {
                                item.classList.remove('active')
                            }
                        }

                    })


                }


            })

            if (this.nav.querySelector('[href="#' + tab + '"]')) {

                //select active tab
                this.nav.querySelectorAll('a').forEach((item) => {
                    if (item.getAttribute('href') == '#' + tab) {
                        item.parentNode.classList.add('active')
                        this.scrollToElem(item.parentNode, this.nav)
                    } else {
                        if (item.parentNode.classList.contains('active')) {
                            item.parentNode.classList.remove('active')
                        }
                    }
                })

                //scroll to elem

                if (params.scroll) {

                    function offset(el) {
                        var rect = el.getBoundingClientRect(),
                            scrollLeft = window.scrollX || document.documentElement.scrollLeft,
                            scrollTop = window.scrollY || document.documentElement.scrollTop;
                        return {
                            top: rect.top + scrollTop,
                            left: rect.left + scrollLeft
                        }
                    }

                    switch (this.setting.scroll) {

                        case 'container':
                            window.scrollTo({
                                top: ((offset(this.container).top - 80) || 0),
                                behavior: 'smooth'
                            })

                            break;

                        case 'top':
                        default:

                            window.scrollTo({
                                top: (document.querySelector('header').clientHeight || 0),
                                behavior: 'smooth'
                            })
                            break;

                    }


                }
            }

            this.setting.onChangeTab(tab)

            if (document.querySelector('#my-slider')) {
                initPriceRange()
            }

        }

        clickTab() {

            //  this.nav.querySelectorAll('a').forEach(function (item) {
            //      item.addEventListener('click', function (event) {
            //          _this.changeTab((this.getAttribute('href').replace('#', '')))
            //      })
            //  })

            const _this = this

            window.addEventListener('hashchange', function () {
                _this.changeTab(window.location.hash.replace('#', ''), {
                    scroll: true
                })
            });
        }


    }

    /* ======================================
    compare remove
    ======================================*/

    if (document.querySelector('[data-comare="remove"]')) {
        const items = document.querySelectorAll('[data-comare="remove"]')

        items.forEach(item => {
            item.addEventListener('click', e => {
                if (confirm('Удалить товар?')) {
                    // ajax 
                }
            })
        })

    }

    /* ======================================
    compare table width
    ======================================*/



    /* =============================================
    compare scroll
    =============================================*/

    class FixedThead {
        constructor(params) {
            this.$el = params.el
            this.elWidth = params.elWidth
            this.wrapper = null
            this.init()
        }

        init() {
            !this.$el.querySelector('.fixed-thead') ? this.create() : this.update()
        }

        create() {
            let elem = this.$el.querySelector('.product-table__tbody').cloneNode(true);
            let section = document.querySelector('.section-compare-page')

            this.wrapper = document.createElement('div')
            this.wrapper.classList.add('fixed-thead')
            this.wrapper.style.width = this.elWidth + 'px'
            this.wrapper.append(elem)

            this.$el.querySelector('.compare-table__wrp').prepend(this.wrapper)

            let fixedStart = section.offsetTop + this.$el.querySelector('.product-table__group').offsetTop
            let fixedEnd = section.offsetTop + section.offsetHeight

            window.addEventListener('scroll', () => {
                if (window.scrollY > fixedStart && window.scrollY < fixedEnd) {
                    this.wrapper.classList.add('is-visible')
                } else {
                    !this.wrapper.classList.contains('is-visible') || this.wrapper.classList.remove('is-visible')
                }
            })

        }

        update() {

            this.wrapper = this.$el.querySelector('.fixed-thead')
            this.wrapper.style.width = this.elWidth + 'px'

        }

        syncScroll(offset) {

            if (this.wrapper) {
                this.wrapper.scrollLeft = offset
            }


        }
    }

    if (document.querySelector('.compare-table__wrp')) {

        window.InitScrollCompare = function ($el) {
            let widthWrp = $el.querySelector('.compare-table__wrp')
            let widthTable = $el.querySelector('.compare-table__wrp > table')
            let scrollerWrp = $el.querySelector('.table-scroller__wrp')
            let scrollerContent = $el.querySelector('.table-scroller__content')
            let scroller = $el.querySelector('.table-scroller')
            let groups = $el.querySelectorAll('.product-table__group')
            let fixedHeadIns = null;

            groups.forEach(item => {
                item.style.width = widthTable.clientWidth + 'px'
                item.querySelector('span').style.width = (widthWrp.clientWidth - 30) + 'px'
            })

            scrollerWrp.style.width = widthWrp.clientWidth + 'px'
            scrollerContent.style.width = widthTable.clientWidth + 'px'

            //init fixed thead

            fixedHeadIns = new FixedThead({
                el: $el,
                elWidth: widthWrp.clientWidth
            })

            scrollerWrp.addEventListener('scroll', e => {

                if (scroller.classList.contains('is-hover-scroller')) {
                    widthWrp.scrollLeft = e.target.scrollLeft

                }

                fixedHeadIns.syncScroll(e.target.scrollLeft)

            })

            widthWrp.addEventListener('scroll', e => {
                scrollerWrp.scrollLeft = e.target.scrollLeft
            })

            scroller.addEventListener('mouseenter', e => {
                e.target.classList.add('is-hover-scroller')
            })
            scroller.addEventListener('mouseleave', e => {
                e.target.classList.contains('is-hover-scroller') ? e.target.classList.remove('is-hover-scroller') : ''
            })




        }

        //compare
        window.tabsSingleProduct = new Tabs({
            navElem: '[data-tab-nav="compare"]',
            containerElem: '[data-container="compare"]',
            tabStart: '1',
            scroll: 'top',

            onChangeTab: function (tab) {

                //init scroll
                window.InitScrollCompare(document.querySelector('.compare-page__item.active'))

                //computed table width
                if (document.querySelector('.compare-table')) {

                    document.querySelectorAll('.compare-table').forEach(item => {
                        const products = item.querySelectorAll('.compare-product');
                        let widthWrp = item.querySelector('.compare-table__wrp')
                        const widthUnit = 336;
                        const table = item

                        if (widthWrp.clientWidth > (products.length * widthUnit)) {
                            table.style.width = (products.length * widthUnit) + 'px'
                        }
                    })

                }

                //reinit slider

                if (document.querySelector('.compare-page__item.active .compare-box').compareSlider) {
                    document.querySelector('.compare-page__item.active .compare-box').compareSlider.update()
                }

            }
        })



    }



    /* =====================================
    compare slider
    =====================================*/

    class CompareSlider {

        constructor(elem) {
            this.elem = elem
            this.container = this.elem.querySelector('.compare-table__wrp')
            this.items = this.container.querySelectorAll('.compare-product')

            this.containerW = this.elem.querySelector('.compare-table__wrp')
            this.containerTable = this.elem.querySelector('.compare-table__wrp table')
            this.leftPX = 0
            this.itemWidth = 336

            this.nav = {
                next: this.elem.querySelector('[data-se-slider="next"]'),
                prev: this.elem.querySelector('[data-se-slider="prev"]'),
            }
            this.activeSlide = 0

            this.init();

        }

        init() {
            this.addEvent()
            this.nav.prev.dataset.state = '0'

            if (this.container.scrollWidth <= this.container.offsetWidth) {
                this.nav.next.dataset.state = '0'
            }
        }

        update() {

            if (this.container.scrollWidth <= this.container.offsetWidth) {
                this.nav.next.dataset.state = '0'
            } else {
                this.nav.next.dataset.state = '1'
            }



        }

        scrollElement(container, stepOffset, _this) {

            _this.leftPX = this.container.scrollLeft + Number(stepOffset)

            container.scrollTo({
                left: _this.leftPX,
                behavior: 'smooth'
            });

        }

        changeSlide() {

            this.items.forEach(item => {
                if (item.classList.contains('active'))
                    item.classList.remove('active')
            })

            if (this.items.length) {
                this.items[this.activeSlide].classList.add('active')
                this.scrollElement(this.container, this.items[this.activeSlide], this)
            }
        }

        nextSlide() {

            if (this.leftPX < (this.containerTable.clientWidth - this.containerW.clientWidth) - 20) {
                this.scrollElement(this.container, this.itemWidth, this)
            }

        }

        prevSlide() {
            this.scrollElement(this.container, -this.itemWidth, this)
        }

        addEvent() {
            this.nav.next.addEventListener('click', () => {
                this.nextSlide()

                console.log('next')
            })
            this.nav.prev.addEventListener('click', () => {
                this.prevSlide()

                console.log('prev')
            })

            this.container.addEventListener('scroll', (e) => {
                this.nav.prev.dataset.state = (e.target.scrollLeft < 10 ? '0' : '1')
                this.nav.next.dataset.state = ((e.target.scrollWidth - (this.container.offsetWidth + 50) <= e.target.scrollLeft) ? '0' : '1')

                if (e.target.scrollLeft < 10) {
                    this.activeSlide = 0
                }
            })
        }

    }

    if (document.querySelector('[data-container="compare"]')) {

        document.querySelectorAll('.compare-box').forEach(item => {
            item['compareSlider'] = new CompareSlider(item)
            //window.InitScrollCompare(item)
        })

    }

    /* =====================================
    compare show/hide
    =====================================*/

    if (document.querySelector('.compare-table__wrp')) {

        const groups = document.querySelectorAll('.product-table__group')
        const items = document.querySelectorAll('.compare-table__wrp tbody')

        groups.forEach(group => {
            group.addEventListener('click', e => {


                if (group.classList.contains('is-hide-group')) {
                    group.classList.add('is-hide-group--close')
                    hideTbody(items)
                    group.classList.remove('is-hide-group')
                    group.classList.remove('is-hide-group--close')
                } else {
                    group.classList.add('is-hide-group')
                    showTbody(items)
                }

            })
        })

        function showTbody(items) {
            let flag = false

            items.forEach(item => {

                if (item.classList.contains('is-hide-group')) {
                    flag = true
                    return false
                }

                // alert('ee')

                if (flag && !item.classList.contains('product-table__group')) {

                    item.classList.add('hide-tbody')

                } else {
                    flag = false
                }
            })
        }

        function hideTbody(items) {
            let flag = false

            items.forEach(item => {

                if (item.classList.contains('is-hide-group--close')) {
                    flag = true
                    return false
                }

                // alert('ee')

                if (flag && !item.classList.contains('product-table__group')) {

                    if (item.classList.contains('hide-tbody')) {
                        item.classList.remove('hide-tbody')
                    }

                } else {
                    flag = false
                }
            })
        }



    }

    /* ====================================
    hide similar prop
    ====================================*/

    if (document.querySelector('.product-table__prop')) {


        const buttonShow = document.querySelectorAll('[data-similar="show"]')
        const buttonHide = document.querySelectorAll('[data-similar="hide"]')
        const props = document.querySelectorAll('.product-table__prop')

        buttonShow.forEach(item => {
            item.addEventListener('click', e => {
                showSimilarProp()
                changeActive('show')
            })
        })

        buttonHide.forEach(item => {
            item.addEventListener('click', e => {
                hideSimilarProp()
                changeActive('hide')
            })
        })


        function showSimilarProp() {
            props.forEach(prop => {
                if (prop.classList.contains('hide-prop-tbody')) {
                    prop.classList.remove('hide-prop-tbody')
                }
            })
        }

        function hideSimilarProp(prop) {
            props.forEach(prop => {
                const arr = new Set()
                prop.querySelectorAll('td').forEach(td => {
                    arr.add(td.innerText)
                })

                if (arr.size <= 2) {
                    prop.classList.add('hide-prop-tbody')
                }
            })
        }

        function changeActive(data) {
            const buttons = document.querySelectorAll('[data-similar]')



            buttons.forEach(item => {

                if (item.dataset.similar == data) {
                    item.classList.add('is-active')
                } else {
                    if (item.classList.contains('is-active')) {
                        item.classList.remove('is-active')
                    }
                }
            })

        }
    }


});