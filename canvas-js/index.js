const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let isMouseDown = false;

document.addEventListener("mousedown", ()=>{
    isMouseDown = true;
})
document.addEventListener("mouseup", ()=>{
    isMouseDown = false;
})


canvas.addEventListener("mousemove", (event)=>{
     if(isMouseDown){
        console.log(event.pageX + ':' + event.pageY);
        console.log(event.offsetX + '/' + event.offsetY);
        ctx.fillRect(event.offsetX/2.7, event.offsetY/3.4, 3, 3);
     }
     
})


