document.addEventListener('DOMContentLoaded', function (event) {

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

    /* =================================================
     popup copy order number
     =================================================*/


    if (document.querySelector('[data-copy]')) {
        const items = document.querySelectorAll('[data-copy]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                if (e.target.getAttribute('href')) {
                    return false
                }

                const instansePopup = new afLightbox({
                    mobileInBottom: true
                })

                navigator.clipboard.writeText(item.dataset.copy)
                    .then(() => {
                        window.STATUS.msg('Номер заказа скопирован в буфер обмена!')
                    })
                    .catch(err => {
                        window.STATUS.err('Не удалось скопировать в буфер обмена')
                    });

            })
        })
    }

    /* =================================================
     logout confirm
     =================================================*/


    if (document.querySelector('[data-confirm="logout"]')) {
        const items = document.querySelectorAll('[data-confirm="logout"]')

        items.forEach(item => {
            item.addEventListener('click', e => {

                e.preventDefault()

                const instansePopup = new afLightbox({
                    mobileInBottom: true,
                    clases: 'af-popup-confirm'
                })

                const template = `
                    <div class="confirm-popup" >
                        <div class="confirm-popup__title" >Выход из кабинета</div>
                        <div class="confirm-popup__desc" >Вы уверены, что хотите покинуть личный кабинет? После этого при входе в кабинет вам снова нужно будет ввести логин и пароль.</div>
                        <div class="confirm-popup__btn" >
                            <button class="btn" data-popup="exit" >Выйти</button>
                            <button class="btn btn-light" data-af-popup="close" >Отмена</button>
                        </div>
                    </div>
                `;

                instansePopup.open(template, (popup) => {
                    popup.querySelector('[data-popup="exit"]').addEventListener('click', (e) => {
                        window.location.href = item.getAttribute('href')
                    })
                })



            })
        })
    }

    /* ==================================================
    button all order
    ==================================================*/

    if (document.querySelector('.mcr-block__orders')) {

        let wrapper = document.querySelector('.mcr-block__orders')
        let elScroll = document.querySelector('.mcr-block__scroll')
        let elButton = document.querySelector('.mcr-block__more')
        let elButtonText = elButton.innerText

        if (elScroll.clientHeight > wrapper.clientHeight) {
            elButton.classList.add('is-visible')
        } else {
            if (document.body.clientWidth >= 992) {

                //добивает таблицу заказов пустыми строками

                let delta = wrapper.clientHeight - elScroll.clientHeight
                let count = Math.floor(delta / 54.5)

                console.log(count)

                for (let i = 1; i <= count; i++) {

                    let elem = document.createElement('div')
                    elem.classList.add('order-row')
                    elem.innerHTML = ` 
                        <div class="order-row__col"><span></span></div>
                        <div class="order-row__col"><span></span></div>
                        <div class="order-row__col"><span></span></div>
                `

                    elScroll.append(elem)
                }
            }
        }

        elButton.addEventListener('click', (e) => {
            wrapper.classList.toggle('is-open')
            elButton.querySelector('.btn').innerText = wrapper.classList.contains('is-open') ? 'Cвернуть' : elButtonText
        })

    }


});