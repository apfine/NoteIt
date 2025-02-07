import mode ,{chMode} from "./source/javascript/dark.js"

const curMode = mode();
console.log(curMode)
const app = document.body
if(curMode==1){
    app.classList.add("dark-mode")
}
else{
    app.classList.add("light-mode")
}
