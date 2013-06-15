self.onmessage = function(e) {

    var data = e.data,
        tempData = [].slice.call(data.data, 0),
        w = data.width, h = data.height,
        point = [];

    for(var i=0;i<data.height;i++){
        for(var j=0;j<data.width*4;j+=4){
            var index=j+i*data.width*4;
            // 对于超过一定尺寸的图形，比如100X100，目前的算法会导致stackoverflow，
            //所以采用去除图形中间淡区域的方法，在某些情况下可能会有识别错误，而在多色块的情况下也仍有overflow的可能
            if (tempData[index+3] > 0 && !(tempData[index] > 250 && tempData[index + 1] > 250 && tempData[index + 2] > 250)) {
            //if (tempData[index+3] > 0) {
                point.push({x: j/4, y: i});
            }
            
        }
    }


    function detectAll(arr) {
      
            while (arr.length > 1) {
                var p0 = arr.shift(),
                    coord0 = {minX: p0.x, minY: p0.y, maxX: p0.x, maxY: p0.y};

                // 用try catch来防止stack overflow后程序的停止，继续识别然后再允许用户人工识别
                try {
                    detect(p0, arr, coord0);
                    
                    if (coord0.minX != coord0.maxX || coord0.minY != coord0.maxY)
                        postMessage(coord0);
                } catch (e) {}
            }
            postMessage('over');
    }


    function detect(p, arr, coord) {
        if (!p || arr.length == 0) {return;}

        var left, right, top, bottom, leftTop, rightTop, leftBottom, rightBottom, i = 0, len = arr.length, pos = Array(8), deled = 0;

        for (; i < len; i++) {
            if (arr[i].x == p.x - 1 && arr[i].y == p.y) {
                left = arr[i]; 
                pos[0] = i; 
            } else if (arr[i].x == p.x + 1 && arr[i].y == p.y) {
                right = arr[i];
                pos[1] = i;
            } else if (arr[i].x == p.x && arr[i].y == p.y - 1) {
                top = arr[i];
                pos[2] = i;
            } else if (arr[i].x == p.x && arr[i].y == p.y + 1) {
                bottom = arr[i];
                pos[3] = i;
            } 
           else if (arr[i].x == p.x - 1 && arr[i].y == p.y - 1) {
                leftTop = arr[i]; 
                pos[4] = i; 
            } else if (arr[i].x == p.x + 1 && arr[i].y == p.y - 1) {
                rightTop = arr[i];
                pos[5] = i;
            } else if (arr[i].x == p.x - 1 && arr[i].y == p.y + 1) {
                leftBottom = arr[i];
                pos[6] = i;
            }  else if (arr[i].x == p.x + 1 && arr[i].y == p.y + 1) {
                rightBottom = arr[i];
                pos[7] = i;
            } 
            else if (arr[i].x > p.x + 1 && arr[i].y > p.y) {
                break;
            }
        }
        

        if (leftTop) {
            arr.splice(pos[4] - deled++, 1);
            coord.minX = coord.minX > leftTop.x ? leftTop.x : coord.minX;   
            coord.minY = coord.minY > leftTop.y ? leftTop.y : coord.minY;   
        }
        if (top) {
            arr.splice(pos[2] - deled++, 1);
            coord.minY = coord.minY > top.y ? top.y : coord.minY;   
        }
        if (rightTop) {
            arr.splice(pos[5] - deled++, 1);
            coord.maxX = coord.maxX > rightTop.x ? coord.maxX : rightTop.x; 
            coord.minY = coord.minY > rightTop.y ? rightTop.y : coord.minY; 
        }
        if (left) {
            arr.splice(pos[0] - deled++, 1);
            coord.minX = coord.minX > left.x ? left.x : coord.minX;     
        }
        if (right) {
            arr.splice(pos[1] - deled++, 1);
            coord.maxX = coord.maxX > right.x ? coord.maxX : right.x;       
        }
         if (leftBottom) {
            arr.splice(pos[6] - deled++, 1);
            coord.minX = coord.minX > leftBottom.x ? leftBottom.x : coord.minX;
            coord.maxY = coord.maxY > leftBottom.y ? coord.maxY : leftBottom.y; 
        }
        if (bottom) {
            arr.splice(pos[3] - deled++, 1);
            coord.maxY = coord.maxY > bottom.y ? coord.maxY : bottom.y; 
        }
        if (rightBottom) {
            arr.splice(pos[7] - deled++, 1);
            coord.maxX = coord.maxX > rightBottom.x ? coord.maxX : rightBottom.x;
            coord.maxY = coord.maxY > rightBottom.y ? coord.maxY : rightBottom.y;   
        }
        //需要等arr全部splice完之后再递归
        if (leftTop)
            detect(leftTop, arr, coord);
        if(top)
            detect(top, arr, coord);
        if(rightTop)
            detect(rightTop, arr, coord);
        if (left)
            detect(left, arr, coord);
        if(right)
            detect(right, arr, coord);
        if(leftBottom)
            detect(leftBottom, arr, coord);
        if(bottom)
            detect(bottom, arr, coord);   
        if(rightBottom)
            detect(rightBottom, arr, coord);
    }

    detectAll(point);

}