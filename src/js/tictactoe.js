
$(function() {
    initGame();
})
var ractive;
function initGame() {
    var data = initData(12);
    ractive = new Ractive({
        target: '#target',
        template: '#template',
        data: data
    })

    ractive.on('addValue', function(context, cell) {
        var _this = this;
        var key = cell.key;

        //hide score
        _this.animate('showScore', false, {
            easing : 'easeOut',
            duration: 2000
        });
        
        if(!_this.get(key + '.populated')) {
            _this.set('currentKey', key);
            _this.set(key + '.value', nextMove());
            _this.set(key + '.populated', true);
            ractive.fire('evaluate');
        }
    });

    ractive.on('evaluate', function(context) {
        var _this = this;
        var rows = _this.get('rows');
        var size = rows.length;
        var currentKey = _this.get('currentKey');
        var currentValue = _this.get(currentKey + '.value');
        var adjacentKeys = _this.get(currentKey + '.adjacentKeys');

        var adjKeyVal1 = null;
        var adjKeyVal2 = null;

         var pointsEarned = 0;

        var cross = adjacentKeys.cross;
        var vertical = adjacentKeys.vertical;
        var horizontal = adjacentKeys.horizontal;

        var correctKeys = new Array();

        //check cross
        for(var i in cross) {
            var keyPairs = cross[i];

            adjKeyVal1 = _this.get(keyPairs[0] + '.value');
            adjKeyVal2 = _this.get(keyPairs[1] + '.value');

            if(adjKeyVal1 && adjKeyVal2) {
                if(adjKeyVal1 === currentValue && adjKeyVal2 === currentValue) {
                    pointsEarned++;

                    correctKeys.push(keyPairs[0]);
                    correctKeys.push(keyPairs[1]);
                }
            }
        }

        //check vertical
        for(var j in vertical) {
            var keyPairs = vertical[j];

            adjKeyVal1 = _this.get(keyPairs[0] + '.value');
            adjKeyVal2 = _this.get(keyPairs[1] + '.value');

            if(adjKeyVal1 && adjKeyVal2) {
                if(adjKeyVal1 === currentValue && adjKeyVal2 === currentValue) {
                    pointsEarned++;

                    correctKeys.push(keyPairs[0]);
                    correctKeys.push(keyPairs[1]);
                }
            }
        }

        //check horizontal
        for(var k in horizontal) {
            var keyPairs = horizontal[k];

            adjKeyVal1 = _this.get(keyPairs[0] + '.value');
            adjKeyVal2 = _this.get(keyPairs[1] + '.value');

            if(adjKeyVal1 && adjKeyVal2) {
                if(adjKeyVal1 === currentValue && adjKeyVal2 === currentValue) {
                    pointsEarned++;

                    correctKeys.push(keyPairs[0]);
                    correctKeys.push(keyPairs[1]);
                }
            }
        }

        var currentPlayerKey = 'players.player' + currentValue;
        var currentScore = _this.get(currentPlayerKey + '.score');
        currentScore += pointsEarned;
        _this.set(currentPlayerKey + '.score', currentScore);

        if(pointsEarned > 0) {
            var classColor = getClassColor(pointsEarned);
            for(var i in correctKeys) {
                var correctAdjacentCellKey = correctKeys[i];
                _this.set(correctAdjacentCellKey + '.classColor', classColor);
                _this.set(currentKey + '.classColor', classColor);
            }

            //alert score
            _this.set('currentPlayer', _this.get(currentPlayerKey + '.name'));
            _this.set('earnedPoints', (pointsEarned > 1) ? (pointsEarned + ' points') : (pointsEarned + ' point'));
            _this.animate('showScore', true, {
                easing : 'easeOut',
                duration: 2000
            });
            
        }

        //switch turn
        _this.toggle('players.playerX.turn');
        _this.toggle('players.playerO.turn');
    })

    ractive.on('resetGame', function(context) {
        var _this = this;
        _this.reset(initData(12));

    })
}
var data;
function initData(size) {

    if(isNaN(size)) {
        return;
    }
    
    var modulus = size % 3;

    if(modulus != 0) {
        return;
    }

    var rows = new Array();
    var cells;
    var rowKey = ''
    var cellKey = '';
    for(var rowIdx = 0; rowIdx < size; rowIdx++) {

        rowKey += 'rows[' + rowIdx + '].';

        cells = new Array();

        for(var cellIdx = 0; cellIdx < size; cellIdx++) {
            cellKey = rowKey + 'cells[' + cellIdx + ']';
            cells.push({
                key: cellKey,
                adjacentKeys: getAdjacentKeys(rowIdx, cellIdx, size),
                value: '',
                populated: false
            });
        }

        rows.push({
            key: rowKey,
            cells: cells
        });

        rowKey = '';    
    }

    var players = {
        playerX: {
            name: 'Ey',
            score: 0,
            turn: true
        },
        playerO: {
            name: 'Nette',
            score: 0,
            turn: false
        }
    }
    
    data = {
        rows: rows,
        currentKey: '',
        players: players,
        size: size
    }

    return data;
}

var nextMove = (function() {
    var switchTurn = false;
    
    return function() {
        if(switchTurn) {
            switchTurn = false; return 'O';
        } else {
            switchTurn = true; return 'X';
        }
    }   
})();

function getIndex(str) {
    str = str.trim();
    if(str) {
        return str.substring((str.indexOf('[') + 1), str.indexOf(']'));
    }
}

function createKey(row, cell) {
    return 'rows[' + row + '].cells[' + cell + ']';
     
}

function getAdjacentKeys(rowIdx, cellIdx, size) {

    if(isNaN(rowIdx) || isNaN(cellIdx)) {
        return; // do not generate adjacent keys
    }

     var adjacentKeys = {
        cross: generateCrossAdjacentCellKeys(rowIdx, cellIdx, size),
        horizontal: generateHorizontalAdjacentCellKeys(rowIdx, cellIdx, size),
        vertical: generateVerticalAdjacentCellKeys(rowIdx, cellIdx, size)
    }

    return adjacentKeys;
}

function generateCrossAdjacentCellKeys(rowIdx, cellIdx, size) {
    var cross = [];
    var rMin1 = rowIdx - 1;
    var rPlus1 = rowIdx + 1;
    var rMin2 = rowIdx - 2;
    var rPlus2 = rowIdx + 2;

    var cMin1 = cellIdx - 1;
    var cPlus1 = cellIdx + 1;
    var cMin2 = cellIdx - 2;
    var cPlus2 = cellIdx + 2;

    var tempFirstKey = '';
    var tempDiag = null;

    if(rMin1 >= 0) {

        if(cMin1 >= 0) {
            tempFirstKey = createKey(rMin1, cMin1);

            if(rPlus1 < size && cPlus1 < size) {
                if(!tempDiag) {
                    tempDiag = new Array();
                }
                tempDiag.push(tempFirstKey);
                tempDiag.push(createKey(rPlus1, cPlus1));
                cross.push(tempDiag);

                tempDiag = null;
            }

            if(rMin2 >= 0 && cMin2 >= 0) {
                if(!tempDiag) {
                    tempDiag = new Array();
                }

                tempDiag.push(tempFirstKey);
                tempDiag.push(createKey(rMin2, cMin2));
                cross.push(tempDiag);

                tempDiag = null;
            }
        }

        if(cPlus1 < size) {
            tempFirstKey = createKey(rMin1, cPlus1);

            if(rPlus1 < size && cMin1 >= 0) {
                if(!tempDiag) {
                    tempDiag = new Array();
                }

                tempDiag.push(tempFirstKey);
                tempDiag.push(createKey(rPlus1, cMin1));
                cross.push(tempDiag);

                tempDiag = null;
            }

            if(rMin2 >= 0 && cPlus2 < size) {
                if(!tempDiag) {
                    tempDiag = new Array();
                }

                tempDiag.push(tempFirstKey);
                tempDiag.push(createKey(rMin2, cPlus2));
                cross.push(tempDiag);

                tempDiag = null;
            }
        }
    }

    if(rPlus2 < size) {
        if(cPlus2 < size) {
            if(!tempDiag) {
                tempDiag = new Array();
            }

            tempDiag.push(createKey(rPlus2, cPlus2));
            tempDiag.push(createKey(rPlus1, cPlus1));
            cross.push(tempDiag);

            tempDiag = null;
        }

        if(cMin2 >= 0) {
            if(!tempDiag) {
                tempDiag = new Array();
            }

            tempDiag.push(createKey(rPlus2, cMin2));
            tempDiag.push(createKey(rPlus1, cMin1));
            cross.push(tempDiag);

            tempDiag = null;
        }
    }

    return cross;
}

function generateVerticalAdjacentCellKeys(rowIdx, cellIdx, size) {
    var vertical = [];
    var rMin1 = rowIdx - 1;
    var rPlus1 = rowIdx + 1;
    var rMin2 = rowIdx - 2;
    var rPlus2 = rowIdx + 2;

    var tempFirstKey = null;;
    var tempVert = null;

    if(rPlus1 < size) {
        
        tempFirstKey = createKey(rPlus1, cellIdx);

        if(rMin1 >= 0) {

            if(!tempVert) {
                tempVert = new Array();
            }

            tempVert.push(tempFirstKey);
            tempVert.push(createKey(rMin1, cellIdx));
            vertical.push(tempVert);
            tempVert = null;
        }

        if(rPlus2 < size) {

            if(!tempVert) {
                tempVert = new Array();
            }

            tempVert.push(tempFirstKey);
            tempVert.push(createKey(rPlus2, cellIdx));
            vertical.push(tempVert);
            tempVert = null;
        }
    }

    if(rMin2 >= 0) {

        if(!tempVert) {
            tempVert = new Array();
        }

        tempVert.push(createKey(rMin2, cellIdx));
        tempVert.push(createKey(rMin1, cellIdx));
        vertical.push(tempVert);
        tempVert = null;
    }

    return vertical;
}

function generateHorizontalAdjacentCellKeys(rowIdx, cellIdx, size) {
    var horizonal = [];
    var cMin1 = cellIdx - 1;
    var cPlus1 = cellIdx + 1;
    var cMin2 = cellIdx - 2;
    var cPlus2 = cellIdx + 2;

    var tempHoriz = null;
    var tempFirstKey = null;

    if(cPlus1 < size) {
        
        tempFirstKey = createKey(rowIdx, cPlus1);

        if(cMin1 >= 0) {

            if(!tempHoriz) {
                tempHoriz = new Array();
            }

            tempHoriz.push(tempFirstKey);
            tempHoriz.push(createKey(rowIdx, cMin1));
            horizonal.push(tempHoriz);
            tempHoriz = null;
        }

        if(cPlus2 < size) {

            if(!tempHoriz) {
                tempHoriz = new Array();
            }

            tempHoriz.push(tempFirstKey);
            tempHoriz.push(createKey(rowIdx, cPlus2));
            horizonal.push(tempHoriz);
            tempHoriz = null;
        }
    }

    if(cMin2 >= 0) {

        if(!tempHoriz) {
            tempHoriz = new Array();
        }

        tempHoriz.push(createKey(rowIdx, cMin2));
        tempHoriz.push(createKey(rowIdx, cMin1));
        horizonal.push(tempHoriz);
        tempHoriz = null;
    }

    return horizonal;
}

function getClassColor(earnedPoints) {

    if(isNaN(earnedPoints) || earnedPoints <= 0) {
        return;
    }

    var classColor = 'one'; //default

    if(earnedPoints >= 12) {
        classColor = 'twelve';

    } else if(earnedPoints >= 8) {
        classColor = 'eight';
    
    } else if(earnedPoints >= 5) {
        classColor = 'five';

    } else if(earnedPoints >= 3) {
        classColor = 'three';
    
    } else if(earnedPoints >= 2) {
        classColor = 'two';
    }

    return classColor;

}