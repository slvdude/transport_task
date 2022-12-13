var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// размер ячейки при выводе матрицы
var SETW_SIZE = 8;
// матрица
var matrix = [
    [30, 24, 11, 12, 25],
    [26, 4, 29, 20, 24],
    [27, 14, 14, 10, 18],
    [6, 14, 28, 8, 2],
];
// запасы (последний столбик)
var stocks = [21, 19, 15, 25];
// потребности (последняя строка)
var needs = [15, 15, 15, 15, 20];
// аналог setw из C++
var setw = function (number, size) {
    var stringNumber = String(number);
    var PADDING = " ".repeat(size);
    var padded = PADDING.substring(0, PADDING.length - stringNumber.length) + stringNumber;
    return padded;
};
// показать матрицу
var showMatrix = function (matrix, stocks, needs) {
    for (var i = 0; i < matrix.length; i++) {
        var output = [];
        for (var j = 0; j < matrix[i].length; j++) {
            var element = matrix[i][j];
            if (typeof element === "number") {
                output.push(setw(matrix[i][j], SETW_SIZE));
            }
            else {
                var sign = element.sign || "";
                output.push(setw("".concat(element.cost, "[").concat(element.use, "]").concat(sign), SETW_SIZE));
            }
        }
        console.log("".concat(output, " | ").concat(stocks.length > 0 ? stocks[i] : ""));
    }
    console.log("—".repeat(SETW_SIZE * matrix[0].length + 6));
    var needsOutput = [];
    for (var i = 0; i < needs.length; i++) {
        needsOutput.push(setw(needs[i], SETW_SIZE));
    }
    console.log(needsOutput + "\n");
};
// поиск минимального элемента в матрице
var findMin = function (matrix, stocks, needs) {
    var minI = 0;
    var minJ = 0;
    var minElement = Number.MAX_VALUE;
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] < minElement && stocks[i] != 0 && needs[j] != 0) {
                minElement = matrix[i][j];
                minI = i;
                minJ = j;
            }
        }
    }
    return {
        number: minElement,
        i: minI,
        j: minJ
    };
};
// распределение доходов
// (!) осторожно, мутирует входящие параметры
var distributionOfStocks = function (matrix, stocks, needs, minElement) {
    if (stocks[minElement.i] > needs[minElement.j]) {
        matrix[minElement.i][minElement.j].use = needs[minElement.j];
        stocks[minElement.i] = stocks[minElement.i] - needs[minElement.j];
        needs[minElement.j] = 0;
    }
    else {
        matrix[minElement.i][minElement.j].use = stocks[minElement.i];
        needs[minElement.j] = needs[minElement.j] - stocks[minElement.i];
        stocks[minElement.i] = 0;
    }
};
// проверка на нули в массиве
var isZero = function (array) { return array.includes(0); };
// метод наименьшей стоимости
var leastCostMethod = function (matrix, stocks, needs) {
    var methodNeeds = __spreadArray([], needs, true);
    var methodStocks = __spreadArray([], stocks, true);
    var methodMatrix = matrix.map(function (i) {
        return i.map(function (j) {
            return {
                cost: Number(j),
                use: 0
            };
        });
    });
    do {
        var min = findMin(methodMatrix.map(function (i) {
            return i.map(function (j) { return j.cost; });
        }), methodStocks, methodNeeds);
        console.log("\n\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442 = ".concat(min.number));
        distributionOfStocks(methodMatrix, methodStocks, methodNeeds, min);
        showMatrix(methodMatrix, methodStocks, methodNeeds);
    } while (!isZero(methodNeeds) && !isZero(methodStocks));
    console.log("F(x) = ", findFX(methodMatrix));
    return methodMatrix;
};
// подсчитывает f(x)
var findFX = function (matrix) {
    var F = 0;
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].use > 0) {
                F = F + matrix[i][j].use * matrix[i][j].cost;
            }
        }
    }
    return F;
};
// проверяет решение метода наимешньшей стоимости на оптимальность
var improvementLeastCostMethod = function (matrix) {
    var improvementMatrix = JSON.parse(JSON.stringify(matrix));
    var isExit = false;
    do {
        var potentials = findPotentials(improvementMatrix);
        var checkOptimal = isOptimal(improvementMatrix, potentials.UArray, potentials.VArray);
        if (!checkOptimal) {
            console.log("Решение является оптимальным, поздравляю!");
            showMatrix(improvementMatrix, potentials.UArray, potentials.VArray);
            console.log("F(x) = ", findFX(improvementMatrix));
            isExit = true;
            return;
        }
        console.log("Решение не является оптимальным");
        console.log("Построим замкнутый цикл:");
        console.log("\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 - ".concat(improvementMatrix[checkOptimal.i][checkOptimal.j].cost, "\ni - ").concat(checkOptimal.i, "\nj - ").concat(checkOptimal.j));
        improvementMatrix = makeClosedLoop(improvementMatrix, checkOptimal);
    } while (!isExit);
};
// создаём замкнутый цикл
var makeClosedLoop = function (matrix, firstElement) {
    var loopMatrix = JSON.parse(JSON.stringify(matrix));
    for (var i = 0; i < loopMatrix.length; i++) {
        for (var j = 0; j < loopMatrix[i].length; j++) {
            loopMatrix[i][j] = __assign(__assign({}, loopMatrix[i][j]), { pos: "".concat(i).concat(j) });
        }
    }
    var startI = firstElement.i;
    var startJ = firstElement.j;
    loopMatrix[startI][startJ] = __assign(__assign({}, loopMatrix[startI][startJ]), { sign: "+" });
    var startPoint = loopMatrix[startI][startJ];
    var usedCells = [];
    var isEnd = false;
    var fillLine = function (line, element, isRow, path) {
        if (isEnd)
            return;
        for (var i = 0; i < line.length; i++) {
            if (line[i] == startPoint) {
                isEnd = true;
                usedCells = __spreadArray(__spreadArray([], path, true), [element], false);
                return;
            }
        }
        var counter = 0;
        for (var i = 0; i < line.length; i++) {
            if (line[i].use > 0) {
                counter++;
            }
        }
        if (counter < 2) {
            return;
        }
        var _loop_2 = function (i) {
            if (line[i].use > 0 && line[i] != element) {
                if (isRow) {
                    fillLine(loopMatrix.map(function (element) { return element[i]; }), line[i], false, __spreadArray(__spreadArray([], path, true), [element], false));
                }
                else {
                    fillLine(loopMatrix[i], line[i], true, __spreadArray(__spreadArray([], path, true), [element], false));
                }
            }
        };
        for (var i = 0; i < line.length; i++) {
            _loop_2(i);
        }
    };
    var _loop_1 = function (i) {
        if (loopMatrix[startI][i].use > 0 && loopMatrix[startI][i] != startPoint) {
            fillLine(loopMatrix.map(function (element) { return element[i]; }), loopMatrix[startI][i], false, []);
        }
    };
    // запускаем рекурсию
    for (var i = 0; i < loopMatrix[startI].length; i++) {
        _loop_1(i);
    }
    // проставляем знаки '+' и '-'
    var isPlus = false;
    for (var k = 0; k < usedCells.length; k++) {
        var usedCell = usedCells[k];
        for (var i = 0; i < loopMatrix.length; i++) {
            for (var j = 0; j < loopMatrix[i].length; j++) {
                if (usedCell.pos == loopMatrix[i][j].pos) {
                    loopMatrix[i][j].sign = isPlus ? "+" : "-";
                    isPlus = !isPlus;
                }
            }
        }
    }
    showMatrix(loopMatrix, [], []);
    //ищем минимальное значение среди чисел со знаком минус
    var min = {
        cost: 0,
        use: Number.MAX_VALUE,
        i: 0,
        j: 0
    };
    for (var i = 0; i < loopMatrix.length; i++) {
        for (var j = 0; j < loopMatrix[i].length; j++) {
            if (loopMatrix[i][j].sign === "-" && loopMatrix[i][j].use < min.use) {
                min = __assign(__assign({}, loopMatrix[i][j]), { i: i, j: j });
            }
        }
    }
    console.log("\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0441\u0440\u0435\u0434\u0438 \u0447\u0438\u0441\u0435\u043B \u0441\u043E \u0437\u043D\u0430\u043A\u043E\u043C \u043C\u0438\u043D\u0443\u0441 - ".concat(min.cost, "[").concat(min.use, "]\ni - ").concat(min.i, "\nj - ").concat(min.j));
    // вычитаем найденное выше значение из чисел, имеющих знак '-'
    // и прибавляем к числам, имеющие знак '+'
    console.log("Вычтем этот элемент из элементов со знаком '-'\nи прибавим к элементам со знаком '+'");
    for (var i = 0; i < loopMatrix.length; i++) {
        for (var j = 0; j < loopMatrix[i].length; j++) {
            if (loopMatrix[i][j].sign === "-") {
                loopMatrix[i][j].use = loopMatrix[i][j].use - min.use;
            }
            if (loopMatrix[i][j].sign === "+") {
                loopMatrix[i][j].use = loopMatrix[i][j].use + min.use;
            }
            // убираем лишние свойста из массива
            loopMatrix[i][j] = {
                cost: loopMatrix[i][j].cost,
                use: loopMatrix[i][j].use
            };
        }
    }
    showMatrix(loopMatrix, [], []);
    return loopMatrix;
};
// находит потенциалы (U и V)
var findPotentials = function (matrix) {
    var potentialsMatrix = JSON.parse(JSON.stringify(matrix));
    // V потенциал (строка)
    var VArray = __spreadArray([], new Array(matrix[0].length), true).fill(undefined);
    // U потенциал (столбец)
    var UArray = __spreadArray([], new Array(matrix.length), true).fill(undefined);
    UArray[0] = 0;
    // создаём массив с занятыми клетками
    var filledCells = [];
    for (var i = 0; i < potentialsMatrix.length; i++) {
        for (var j = 0; j < potentialsMatrix[i].length; j++) {
            if (potentialsMatrix[i][j].use > 0) {
                filledCells.push({
                    i: i,
                    j: j,
                    cost: potentialsMatrix[i][j].cost
                });
            }
        }
    }
    // заполняем V и U (решаем систему уравнений)
    console.log("Заполним предварительные потенциалы V и U\n");
    do {
        for (var i = 0; i < filledCells.length; i++) {
            var cell = filledCells[i];
            if (VArray[cell.j] !== undefined && UArray[cell.i] === undefined) {
                console.log("\u0412\u044B\u0431\u0438\u0440\u0430\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 - \ni: ".concat(cell.i, " j: ").concat(cell.j, " \n\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435: ").concat(cell.cost));
                UArray[cell.i] = cell.cost - VArray[cell.j];
                break;
            }
            if (UArray[cell.i] !== undefined && VArray[cell.j] === undefined) {
                console.log("\u0412\u044B\u0431\u0438\u0440\u0430\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 - \ni: ".concat(cell.i, " j: ").concat(cell.j, " \n\u0417\u043D\u0430\u0447\u0435\u043D\u0438\u0435: ").concat(cell.cost));
                VArray[cell.j] = cell.cost - UArray[cell.i];
                break;
            }
        }
        showMatrix(potentialsMatrix, UArray, VArray);
    } while (isUndefined(VArray) || isUndefined(UArray));
    console.log("===============================================\n");
    return {
        VArray: VArray,
        UArray: UArray
    };
};
// проверка на undefined в массиве
var isUndefined = function (array) { return array.includes(undefined); };
// проверка матрицы на оптимальность
// находит дельта всех свободных элементов
// если матрица оптимальная - на выход даётся null
// если не оптимальная - элемент максимальной оценки
/**
 * проверка матрицы на оптимальность
 * находит дельта всех свободных элементов
 * если матрица оптимальная - на выход даётся null
 * если не оптимальная - элемент максимальной оценки
 */
var isOptimal = function (matrix, UArray, VArray) {
    var elements = [];
    for (var i = 0; i < matrix.length; i++) {
        for (var j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].use === 0 && VArray[j] + UArray[i] > matrix[i][j].cost) {
                elements.push({
                    i: i,
                    j: j,
                    difference: VArray[j] + UArray[i] - matrix[i][j].cost
                });
            }
        }
    }
    if (elements.length > 0) {
        console.log("Неоптимальные элементы:");
        for (var i = 0; i < elements.length; i++) {
            console.log("i: ".concat(elements[i].i, " j: ").concat(elements[i].j, " \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: ").concat(matrix[elements[i].i][elements[i].j].cost, " \u0440\u0430\u0437\u043D\u0438\u0446\u0430: ").concat(elements[i].difference));
        }
        var minElement = elements[0];
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].difference > minElement.difference) {
                minElement = elements[i];
            }
        }
        return minElement;
    }
    return null;
};
var run = function () {
    console.log("Исходная матрица:");
    showMatrix(matrix, stocks, needs);
    console.log("Метод наименьшей стоимости:");
    var leastCostMatrix = leastCostMethod(matrix, stocks, needs);
    console.log("\nПроизведём улучшение опорного плана:");
    improvementLeastCostMethod(leastCostMatrix);
};
run();
