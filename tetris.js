function createPiece(type){
    if(type==='T'){
        return[
                [0,0,0],    
                [1,1,1],    /* === */
                [0,1,0],    /*  =  */   
                 /*row=3,column=3 (3*3 matrix)*/
            ];
    }
    else if(type==='O'){
        return[
            [2,2],
            [2,2],
        ];
    }
    else if(type==='L'){
        return[
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
    }
    else if(type==='J'){
        return[
            [0,4,0],
            [0,4,0],
            [4,4,0],
        ];
    }
    else if(type==='I'){
        return[
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0]
        ];
    }     
    else if(type==='S'){
        return[
            [0,6,6],
            [6,6,0],
            [0,0,0],
        ]; 
    }
    else if(type==='Z'){
        return[
            [7,7,0],
            [0,7,7],
            [0,0,0],
        ];
    }          
}

/*making of background and call the draw-matrix*/
function drawTetris(){
    ctx.fillStyle="#0ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle='#000';
    ctx.fillRect(canvas.width / 32 * 9,0,canvas.width / 32 * 12,canvas.width / 32 * 20);
    //drawMatrix(arena,{x:10,y:10});/*to set element on by one at top*/
    //drawMatrix(playerTetris.matrix,playerTetris.pos);
    arena.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if (value!=0){
                ctx.fillStyle=colors[value] || '#50BFE6';
                ctx.fillRect(canvas.width / 32 * 9 + x * 32,y * 32,32,32);
            }
        });
    });

    playerTetris.matrix.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if (value!=0){
                ctx.fillStyle=colors[value];
                ctx.fillRect(canvas.width / 32 * 9 +x * 32 + playerTetris.pos.x * 32,y * 32 + playerTetris.pos.y * 32,32,32);
            }
        });
    });
}

/*color for tetris */
const colors=[
    null,
    '#FF355E','#50BFE6','#66FF66','#66FF66','#FF9933','#FFCC33'
    ]

/* tetris colour element*/
function drawMatrix(matrix,offset){  
     /* (x=element values),(y=matrix positon(rows)) */
    matrix.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if (value!=0){
                ctx.fillStyle=colors[value];
                ctx.fillRect(x+offset.x,y+offset.y,1,1);
            }
        });
    });
}



/*collison detection both down,right,left*/
function collide(arena,playerTetris){
    const [m,o]=[playerTetris.matrix,playerTetris.pos];
    for(let y=0;y<m.length;++y){
        for(let x=0;x<m[y].length;++x){
            if( m[y][x]!==0 && (arena[y+o.y] &&
                arena[y+o.y][x+o.x])!==0){
                    return true; 
                    /*if these condition true */ 
                }
               
        }
    }
    return false;/*no collision */
}



/*our tetris into matrix for detecting collison and all
#making our tetris to contain in matrix to chexk all the function using these big matrix cointainer */
function createMatrix(w,h){
    const matrix=[];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function merge(arena,playerTetris){
    playerTetris.matrix.forEach((row,y)=>{
        row.forEach((value,x)=>{
            if(value!==0){
                arena[y+playerTetris.pos.y][x+playerTetris.pos.x]=value;
            }
        });
    });
}

const arena=createMatrix(12,20);


/*down button drop frame value */
/*collide function *//*merge call */
function playerTetrisDrop(){
    playerTetris.pos.y++;
    if(collide(arena,playerTetris)){
        playerTetris.pos.y--;
        merge(arena,playerTetris);
        playerTetrisReset();
        arenaSweep();
    }
    dropCounter=0;
}

/*tetris element border limit not to go out of the given area */
function playerTetrisMove(dir){
    playerTetris.pos.x+=dir;
    if(collide(arena,playerTetris)){
        playerTetris.pos.x-=dir;
    }
}


/*calling rotate*/
function playerTetrisRotate(dir){
    const pos=playerTetris.pos.x;
    let offset=1;
    rotate(playerTetris.matrix,dir);
    while(collide(arena,playerTetris)){
        playerTetris.pos.x+=offset;
        offset=-(offset+(offset>0 ? 1:-1));
        if(offset>playerTetris.matrix[0].length){
            rotate(playerTetris.matrix,-dir);
            playerTetris.pos.x=pos;
            return;
        }
    }
}




/*rotation function to rotate tetris (if a matrix to rotate we have to transpose and reverse each row)*/
function rotate(matrix,dir){
    for(let y=0;y<matrix.length;y++){
        for(let x=0;x<y;++x){
            [
                matrix[x][y],
                matrix[y][x],
            ] =
            [
                matrix[y][x],
                matrix[x][y],
            ];       
        }
    }
    if(dir>0){
        matrix.forEach(row => row.reverse());
    }
    else{
        matrix.reverse();
    }
}


/*random tetris element call and check collide once again*/
function playerTetrisReset(){
    const pieces='ILJOTSZ'
    playerTetris.matrix=createPiece(pieces[pieces.length*Math.random()|0]);
    playerTetris.pos.y=0
    playerTetris.pos.x=(arena[0].length/2|0)-(playerTetris.matrix[0].length/2|0);
    if(collide(arena,playerTetris)){
        arena.forEach(row=>row.fill(0));
        playerTetris.score=0;
        state = STATES.GAME;
    }
}


/*arena sweep to cancel if element of tetris are filled properly 
and also score if all tetris are correctly filled*/
function arenaSweep(){
    let rowcount=1;
    lo:for(let y=arena.length-1;y>0;--y){
        for(let x=0;x<arena[y].length;++x){
            if(arena[y][x]===0){
                continue lo
            }
        }
        const row=arena.splice(y,1)[0].fill(0);
        arena.unshift(row);
        ++y;
        playerTetris.score+=rowcount*10
        rowcount*=2;

    }
}

/*matrix and offset values (main)*/
const playerTetris={
    pos:{x:5,y:5},
    matrix:createPiece('T'),
    score:0
}