document.addEventListener('DOMContentLoaded', ()=>{
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 500;

    let brush = {
        active: false,
        move:false,
        position:{x: 0, y:0},
        lastPosition: null
    }
    ctx.lineWidth = 7;

    const draw = (line) => {
        ctx.beginPath();
        ctx.moveTo(line.inicial.x, line.inicial.y);
        ctx.lineTo(line.final.x, line.final.y);
        ctx.stroke();
    }

    canvas.onmousedown = ()=>{brush.active = true};
    canvas.onmouseup = ()=>{brush.active = false};

    canvas.onmousemove = (event)=>{
        brush.position.x = event.offsetX;
        brush.position.y = event.offsetY;
        brush.move = true;
    };

    const cicle = ()=>{
        if(brush.active  && brush.lastPosition){
            draw({inicial:{x:brush.lastPosition.x,y:brush.lastPosition.y}, final:{x:brush.position.x,y:brush.position.y}});
            brush.move = false;
        }
        brush.lastPosition = {x:brush.position.x,y:brush.position.y};
        setInterval(cicle,1);
    }
    cicle();
})
