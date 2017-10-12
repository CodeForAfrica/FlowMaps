import $                                from 'jquery'

export default () => {
    let buttons = {
        twitter: $('#twitter-button'),
        facebook: $('#facebook-button'),
        whatsapp: $('#whatsapp-button'),
        share: $('#share-button'),
        close: $('#share-close-button')
    }

    buttons.twitter.on('click', (event) => {
        event.preventDefault()

        let url = 'https://twitter.com/intent/tweet?text=...'
        let name = 'twitter-share-dialog'
        let options = 'menubar=no, toolbar=no, resizable=no, scrollbar=no, height=400, width=500'

        window.open(url, name, options)
    })

    buttons.facebook.on('click', (event) => {
        event.preventDefault()

        let url = 'https://facebook.com/sharer.php?u=' + encodeURIComponent('https://codeforafrica.github.io/GenderGapClock/dist/')
        let name = 'facebook-share-dialog'
        let options = 'menubar=no, toolbar=no, resizable=no, scrollbar=no, height=400, width=500'

        window.open(url, name, options)
    })

    buttons.share.on('click', (event) => {
        event.preventDefault()

        if (window.matchMedia('(min-width: 550px)').matches) {
            return
        } else {
            $('.social-media__buttons').addClass('active')
        }
    })

    buttons.close.on('click', (event) => {
        event.preventDefault()
        $('.social-media__buttons').removeClass('active')
    })
}
