document.addEventListener('DOMContentLoaded', ()=>{
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

 
    
    //define tamanho do canvas desenhavel
    canvas.width = 800;
    canvas.height = 500;

    ctx.fillStyle = "white"

    //Informações do pincel

    // LIMPAR O CODIGO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    let brush = {
        active: false,
        move: false,
        position:{x: 0, y:0},
        lastPosition: null,
        color: "#000000",
        lineWidth: 30
    }
    let eraser = {
        active: false,
        color: "#ffffff"
    }
    let bucket = {
        active: false
    }

    let activeTool = brush;

    //Desenha a linha
    const draw = (line) => {
        

    
        ctx.lineWidth = line.width;
        
        // //Desenha circulo que parece uma linha para suavisar a linha verdadeira
        // ctx.beginPath();
        // ctx.arc(line.inicial.x, line.inicial.y, lineWidth/2 , 0 , 2* Math.PI)
        // ctx.fillStyle = brush.color;
        // ctx.fill();
     

        //desenha linha
        ctx.beginPath();
        ctx.moveTo(line.inicial.x, line.inicial.y);
        ctx.lineTo(line.final.x, line.final.y);
        ctx.strokeStyle = line.color;
        ctx.lineCap = "round";
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.closePath();
    }

    // const getActiveTool = ()=>{
    //     for(a of tools){
    //         if(a.dataset.active == "true"){
    //             return a.id;
    //         }
    //     }
    // }

    //Toogle da flag de brush ativo
    canvas.onmousedown = ()=> {
        //Se a ainda não foi salva em #previous-color salvar
        if(saveColorFlag == true){
            saveColor();
            saveColorFlag = false;
        }
        activeTool.active = true;
    };
    canvas.onmouseup = ()=> activeTool.active = false;

    //captura as coordenadas do mouse
    canvas.onmousemove = (event)=>{
        brush.position.x = event.offsetX;
        brush.position.y = event.offsetY;
        brush.move = true
    };

    //ciclo que captura o momento de chamar a funçao de desenho
    const cicle = ()=>{
        //LIMPAR ISSSOOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        if(brush.active && brush.lastPosition && brush.move){
            draw({inicial:{x:brush.lastPosition.x,y:brush.lastPosition.y}, final:{x:brush.position.x,y:brush.position.y}, color: brush.color, width: brush.lineWidth});
            brush.move = false;
        }else if(eraser.active && brush.lastPosition && brush.move){
            draw({inicial:{x:brush.lastPosition.x,y:brush.lastPosition.y}, final:{x:brush.position.x,y:brush.position.y}, color: eraser.color, width: brush.lineWidth});
        }else if(bucket.active){
            floodFill({x:brush.position.x, y: brush.position.y}, hexToRgbaArr(brush.color) );
            bucket.active = false;
        }
        brush.lastPosition = {x:brush.position.x,y:brush.position.y};
        requestAnimationFrame(cicle);
    }
    requestAnimationFrame(cicle);

    let saveColorFlag = false;
    //Altera o valor color do brush
    const colorPicker = document.querySelector('input[type=color]');
    colorPicker.onchange = ()=>{
        saveColorFlag = true;
        brush.color = colorPicker.value
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
            previousColorsBtns[index].onclick = ()=>{
                brush.color = color;
                colorPicker.value = color;
            }
        } )  
    }

    const sizeSlider = document.getElementById('size');
    sizeSlider.onchange = () =>{
        brush.lineWidth = sizeSlider.value;
    }

    // const opacitySlider = document.getElementById('opacity');
    // opacitySlider.onchange = () =>{
    //     if(brush.color.length > 7){
    //         brush.color = brush.color.slice(0,7);
    //     }
    //         brush.color += Number(opacitySlider.value).toString(16);
    // }

    const brushTool = document.getElementById('brush');
    const eraserTool = document.getElementById('eraser');
    const bucketTool = document.getElementById('bucket');

    const tools = [brushTool, eraserTool,  bucketTool]

    const selectTool = (tool)=>{
        for(a of tools){
            if(a == tool){
                a.style.opacity = "1";
                a.dataset.active = "true";
            }else{
                if(a.dataset.active == "true"){
                    a.style.opacity = ".2";
                    a.dataset.active = "false";
                }
            }
        }
    }
    
    brushTool.onclick = ()=>{
        selectTool(brushTool);
        activeTool.active = false;
        activeTool = brush;
    }
    eraserTool.onclick = ()=>{
        selectTool(eraserTool);
        activeTool.active = false;
        activeTool = eraser;
    }
    bucketTool.onclick = ()=>{
        selectTool(bucketTool);
        activeTool.active = false;
        activeTool = bucket;
    }

    const hexToRgbaArr = (hex, alpha = 255)=>{
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return [r,g,b,alpha];
    }
    const floodFill = (pos, fillColor)=>{
        console.log('asda')
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const targetColor = getColor(imageData, pos);
        console.log(targetColor);
        if(!colorsMatch(targetColor, fillColor)){
            fillPixel(imageData, pos, targetColor, fillColor );
        }
        ctx.putImageData(imageData, 0, 0);
    }

    const getColor = (imageData, pos)=>{
        //Lugar no imageData.data em que a cor começa
        const offSet = (pos.y * imageData.width + pos.x) * 4;
        //retorna array com o valor da cor
        return imageData.data.slice(offSet, offSet+4);

    }

    const colorsMatch = (a,b)=>{
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    const setPixel = (imageData,pos,color) => {
        const offSet = (pos.y * imageData.width + pos.x) * 4;
        imageData.data[offSet] = color[0];
        imageData.data[offSet+1] = color[1];
        imageData.data[offSet+2] = color[2];
        imageData.data[offSet+3] = color[3];
    }

    const fillPixel = (imageData, startPos, targetColor, fillColor) => {
        const stack = [startPos];
        
        while(stack.length > 0) {
            pos = stack.pop();
            
            const lastFlag = true;

            if(pos.x < 0 || pos.y < 0 || pos.x >= canvas.width || pos.y >= canvas.height) continue;
    
            if(colorsMatch(targetColor, getColor(imageData, pos))) {
                setPixel(imageData, pos, fillColor);
                stack.push({x: pos.x + 1, y: pos.y});
                stack.push({x: pos.x - 1, y: pos.y});
                stack.push({x: pos.x, y: pos.y + 1});
                stack.push({x: pos.x, y: pos.y - 1});
            }
        }
    };
    

})

