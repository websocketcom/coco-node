const timer  = () => {
    setTimeout(() => {
        timer()
        console.log((new Date()).getTime())
    }, 995)
}
timer()