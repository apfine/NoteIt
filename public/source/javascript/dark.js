
var dark = 0

const mode =()=>{
    if(document.cookie){
        dark =Number((document.cookie))
        console.log(dark)
    }
    else{
        document.cookie ="0"
    }
    return dark
}

export  function chMode() {
    mode()
    if(dark==0){
        document.cookie.remove()
        document.cookie = "1"
    }
}
export default mode
