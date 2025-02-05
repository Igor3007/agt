class Cart {
    constructor(paraps) {
        this.$el = paraps.el
        this.selectAll = this.$el.querySelector('[data-cart="select-all"]')
        this.items = this.$el.querySelectorAll('.cart-item')
        this.popupConfirm = null
        this.popupContainer = null
        this.init()
    }

    init() {
        this.addEvents()
    }

    startTimer(duration, display) {
        let timer = duration,
            minutes, seconds;
        let instanceTimer = setInterval(() => {

            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(instanceTimer)
                display.parentNode.removeAttribute('disabled')
                display.remove()
            }
        }, 1000);
    }

    removeConfirm() {
        return `
            <div class="remove-confirm" >
                <div class="remove-confirm__icon" >
                    <span>Товар удален из корзины</span>
                </div>
                <div class="remove-confirm__name" >Кофта мужская зимняя KW 215</div>
                <div class="remove-confirm__recovery" >
                    <button class="btn" >Восстановить</button>
                </div>
                <div class="remove-confirm__time" >00:15</div>
            </div>
        `;
    }

    removeAjax() {
        // ajax запрос на удаление из корзины
        console.log('Товар удален из корзины')
    }

    removeItem(items) {
        this.popupConfirm = document.createElement('div')
        this.popupConfirm.innerHTML = this.removeConfirm()
        this.startTimer(15, this.popupConfirm.querySelector('.remove-confirm__time'))
        this.popupContainer = document.createElement('div')
        this.popupContainer.classList.add('confirm-container')
        this.popupContainer.append(this.popupConfirm)
        document.body.append(this.popupContainer)

        // let timer = setTimeout(() => {
        //     this.removeAjax()
        //     this.popupConfirm.remove()
        // }, 15000)

        // this.popupConfirm.querySelector('.btn').addEventListener('click', () => {
        //     clearTimeout(timer)
        //     this.popupConfirm.remove()
        // })


    }

    addEvents() {
        this.selectAll.addEventListener('change', () => {
            this.items.forEach(item => {
                item.querySelector('[type=checkbox]').checked = this.selectAll.checked
            })
        })

        this.items.forEach(item => {
            item.querySelector('[data-cart="remove"]').addEventListener('click', () => {
                this.removeItem([item])
            })
        })
    }
}

document.addEventListener('DOMContentLoaded', function (event) {
    document.querySelectorAll('.cart').forEach(el => {
        new Cart({
            el
        })
    })
});