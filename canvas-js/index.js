document.addEventListener('DOMContentLoaded', ()=>{
    //Captura o DOM do canvas e cria o contexto 2d
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    canvas.addEventListener('contextmenu', (event) => {
        // Verifique se o evento é especificamente o menu de contexto
        if (event.target.classList.contains('pcr-app')) {
            return; // Permite que o color picker funcione normalmente
        }
        event.preventDefault(); // Desativa o menu de contexto do clique direito
    });

    //define tamanho do canvas desenhavel
    canvas.width = 800;
    canvas.height = 500;
    //Pinta a area do canvas de branco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height); 

    //Definição das ferramentas e do cursor--------------------------------------------------------------------------------
    let cursor = {
        position:{x: 0, y:0},
        lastPosition: null,
    }
    let brush = {
        work: false,
        color: "#000000",
        lineWidth: 30
    }

    let eraser = {
        work: false,
        color: "#ffffff",
        lineWidth: 30
    }
    let bucket = {
        work: false
    }
    let eyedropper = {
        work: false
    }

    //Menu de alteração de ferramenta------------------------------------------------------------------------------------
    
    //Define a ferramenta ativa pardrão como o brush
    let activeTool = brush;

    //Seleciona os icones de ferramenta 
    const brushTool = document.getElementById('brush');
    const eraserTool = document.getElementById('eraser');
    const bucketTool = document.getElementById('bucket');
    const eyedropperTool = document.getElementById("eyedropper");

    const tools = [brushTool, eraserTool,  bucketTool, eyedropperTool]

    //Altera a ferramenta selecionada na interface
    const selectTool = (selectedTool)=>{
        for(tool of tools){
            const image = tool.querySelector('img');
            if(tool == selectedTool){
               image.style.opacity = ".8";
            }else{
                image.style.opacity = ".2";
            }
        }
    }

    //Ativa a ferramenta selecionada
    const turnActive = (toolDOM, toolObj)=>{
        selectTool(toolDOM);
        activeTool = toolObj;
    }
    
    //Adicionando eventos de ativar ferramenta
    brushTool.onclick = ()=>{
        turnActive(brushTool,brush);
    }
    eraserTool.onclick = ()=>{
        turnActive(eraserTool,eraser);
    }
    bucketTool.onclick = ()=>{
        turnActive(bucketTool,bucket);
    }
    eyedropperTool.onclick = ()=>{
        turnActive(eyedropperTool,eyedropper);
    }

    //Funções de movimento do mouse-------------------------------------------------------------------------------

    canvas.onmousedown = ()=> {
        //Se a ainda não foi salva em #previous-color salvar
        if(saveColorFlag == true){
            saveColor();
            saveColorFlag = false;
        }
        activeTool.work = true;
    };
    canvas.onmouseup = ()=> activeTool.active = false;

    //captura as coordenadas do mouse
    canvas.onmousemove = (event)=>{
        cursor.position.x = event.offsetX;
        cursor.position.y = event.offsetY;
    };

    canvas.addEventListener('mouseout', ()=>{
        activeTool.work = false;
    })

    //ciclo que captura o momento de chamar a funçao da ferrameta//--------------------------------------------------------
    
    const cicle = ()=>{
        if(brush.work && cursor.lastPosition){
            draw({
                  inicial:{x:cursor.lastPosition.x, 
                           y:cursor.lastPosition.y},
                  final:{x:cursor.position.x, 
                         y:cursor.position.y},
                  color: brush.color,
                  width: brush.lineWidth
                });

        }
        else if(eraser.work && cursor.lastPosition){
            draw({
                  inicial:{x:cursor.lastPosition.x,
                           y:cursor.lastPosition.y},
                  final:{x:cursor.position.x,
                         y:cursor.position.y},
                  color: eraser.color, 
                  //COLOCAR ERASER
                  width: brush.lineWidth
                });
        
        }else if(eyedropper.work){
            copyColor({
                        x:cursor.position.x,
                        y:cursor.position.y
                      });
            turnActive(brushTool,brush);
            eyedropper.work = false;
            
        }else if(bucket.work){
            floodFill({
                        x:cursor.position.x,
                        y:cursor.position.y
                      }, 
                        hexToRgbaArr(brush.color) 
                     );
            bucket.work = false;

        }
        cursor.lastPosition = {x:cursor.position.x,y:cursor.position.y};
        requestAnimationFrame(cicle);
    }
    requestAnimationFrame(cicle);

    //Configs do color picker------------------------------------------------------------------------------------
    
    //flag que diz se a cor deve ser salva no histórico
    let saveColorFlag = false;

    const pickr = Pickr.create({
        el: '#color-picker',
        theme: 'monolith',
        default: '#000000',
        swatches: [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7',
            '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
            '#009688', '#4caf50', '#8bc34a', '#cddc39'
        ],
        components: {
            preview: true,
            opacity: false,
            hue: true,
            interaction: {
                hex: false,
                rgba: false,
                input: true,
                clear: false,
                save: false
            }
        }
    });

    const colorPicker = document.querySelector(".pcr-button");
    const colorPickerContainer = document.getElementById("color-picker-container");
    const pcrApp = document.querySelector(".pcr-app");

    //Adiciona o eventListenner para alterar a cor quando o valor do picker for alterado
    pickr.on('change', (color) => {
        saveColorFlag = true;
        color = color.toHEXA().toString();
        brush.color =  color;
        colorPicker.style.setProperty('--pcr-color', color);
    });
    //Define a posiçõa do container de seleção de cores
    colorPicker.onclick = ()=>{
        colorPickerContainer.appendChild(pcrApp);
    }

    //Salva a ultima cor colocada do canvas-----------------------------------------------------------------------------

    const previousColorsBtns = [...document.querySelectorAll('.prev-color')];
    const previousColorsArr = [];

    const saveColor = ()=>{
        // Exlui a ultima cor do array se todos os botões estiverem preenchidos
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
                pickr.setColor(color);
                saveColorFlag = false;
            }
            previousColorsBtns[index].addEventListener('mouseover', (event) => {
                event.target.style.borderColor = "#f0932b";
            });
            previousColorsBtns[index].addEventListener('mouseout', (event) => {
                event.target.style.borderColor = "#6127be";
            });
        } )  
    }

    //Função que altera o tamanho do brush de acordo com o valor do slider--------------------------------------
    const sizeSlider = document.getElementById('size');
    sizeSlider.onchange = () =>{
        brush.lineWidth = sizeSlider.value;
    }


    //*Problema ainda não resolvido* //

    // const opacitySlider = document.getElementById('opacity');
    // opacitySlider.onchange = () =>{
    //     if(brush.color.length > 7){
    //         brush.color = brush.color.slice(0,7);
    //     }
    //         brush.color += Number(opacitySlider.value).toString(16);
    // }


     //Função de desenho que é usada pela eraser e brush------------------------------------------------------------
     const draw = (line) => {
        ctx.beginPath();
        ctx.moveTo(line.inicial.x, line.inicial.y);
        ctx.lineTo(line.final.x, line.final.y);

        ctx.lineWidth = line.width;
        ctx.strokeStyle = line.color;
        ctx.lineCap = "round";
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.closePath();
    }

    //Funções de preenchimento da ferramenta balde-------------------------------------------------------------------
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

    //Função que aplica a lógica de preenchimento
    const fillPixel = (imageData, startPos, targetColor, fillColor) => {
        const stack = [startPos];
        
        while(stack.length > 0) {
            pos = stack.pop();

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

    //Funções Auxiliares do flood fill

    //Converte a cor recebida no picker para ser compativel com imageData.data
    const hexToRgbaArr = (hex, alpha = 255)=>{
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return [r,g,b,alpha];
    }

    //Função que devolve a cor de uma cordenada no canvas
    const getColor = (imageData, pos)=>{
        //Lugar no imageData.data em que a cor começa
        const offSet = (pos.y * imageData.width + pos.x) * 4;
        //retorna array com o valor da cor
        return imageData.data.slice(offSet, offSet+4);

    }

    //Verifica se as cores são iguais
    const colorsMatch = (a,b)=>{
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    //Define a cor de um pixel do canvas
    const setPixel = (imageData,pos,color) => {
        const offSet = (pos.y * imageData.width + pos.x) * 4;
        imageData.data[offSet] = color[0];
        imageData.data[offSet+1] = color[1];
        imageData.data[offSet+2] = color[2];
        imageData.data[offSet+3] = color[3];
    }

   //Função de copia de cor do eyedropper------------------------------------------------------------------------------
   const copyColor = (pos)=>{
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let color = getColor(imageData,pos);
        if(color[3] === 0){
            pickr.setColor("white");
        }else{
            color = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]/255})`;
            pickr.setColor(color);
        }
        
   }
})

