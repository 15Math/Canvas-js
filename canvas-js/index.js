document.addEventListener('DOMContentLoaded', ()=>{
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext("2d");

    //define tamanho do canvas desenhavel
    canvas.width = 800;
    canvas.height = 500;

    //Informações do pincel
    let brush = {
        active: false,
        position:{x: 0, y:0},
        lastPosition: null,
        color: 'black',
        lineWidth: 7
    }
    let lineWidth = brush.lineWidth;


    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';

    //Desenha a linha
    const draw = (line) => {
        
        //Desenha circulo que parece uma linha para suavisar a linha verdadeira
        ctx.beginPath();
        ctx.arc(line.inicial.x, line.inicial.y, lineWidth/2.5 , 0 , 2* Math.PI)
        ctx.fillStyle = brush.color;
        ctx.fill();
        ctx.closePath();

        //desenha linha
        ctx.beginPath();
        ctx.moveTo(line.inicial.x, line.inicial.y);
        ctx.lineTo(line.final.x, line.final.y);
        ctx.strokeStyle = brush.color;
        ctx.stroke();
        ctx.closePath();
    }

    //Toogle da flag de brush ativo
    canvas.onmousedown = ()=> {
        //Se a ainda não foi salva em #previous-color salvar
        if(saveColorFlag == true){
            saveColor();
            saveColorFlag = false;
        }
        brush.active = true
    };
    canvas.onmouseup = ()=> brush.active = false;

    //captura as coordenadas do mouse
    canvas.onmousemove = (event)=>{
        brush.position.x = event.offsetX;
        brush.position.y = event.offsetY;
    };

    //ciclo que captura o momento de chamar a funçao de desenho
    const cicle = ()=>{
        if(brush.active && brush.lastPosition){
            draw({inicial:{x:brush.lastPosition.x,y:brush.lastPosition.y}, final:{x:brush.position.x,y:brush.position.y}});
            brush.move = false;
        }
        brush.lastPosition = {x:brush.position.x,y:brush.position.y};
        requestAnimationFrame(cicle);
    }
    requestAnimationFrame(cicle);

    let saveColorFlag = false;
    //Altera o valor color do brush
    const colorPicker = document.querySelector('input[type=color]');
    colorPicker.onchange = ()=>{
        brush.color = colorPicker.value
        saveColorFlag = true;
    }
    
    const previousColorsBtns = [...document.querySelectorAll('.prev-color')];
    const previousColorsArr = [];

    const saveColor = ()=>{
        // Exlui a ultima cor se todos os botões estiverem preenchidos
        if(previousColorsArr.length == 10){
            previousColorsArr.pop();
        }
        previousColorsArr.unshift(brush.color);

        // Atualiza as cores de cada botão conforme forem adicionadas novas
        previousColorsArr.forEach((color, index) =>{
            previousColorsBtns[index].style.backgroundColor = color;
            previousColorsBtns[index].style.cursor = "pointer";
            previousColorsBtns[index].dataset.color = color; 
        } )
            
       
    }

   
})
