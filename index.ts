type MatrixElem = {
  sign?: string;
  pos?: string;
  cost: number;
  use: number;
};

type Matrix = MatrixElem[][];

type NumberMatrix = number[][];

type IndexElem = { i: number; j: number };
// размер ячейки при выводе матрицы
const SETW_SIZE = 8;

// матрица
const matrix: NumberMatrix = [
  [30, 24, 11, 12, 25],
  [26, 4, 29, 20, 24],
  [27, 14, 14, 10, 18],
  [6, 14, 28, 8, 2],
];

// запасы (последний столбик)
const stocks = [21, 19, 15, 25];

// потребности (последняя строка)
const needs = [15, 15, 15, 15, 20];

// аналог setw из C++
const setw = (number: any, size: number) => {
  const stringNumber = String(number);
  const PADDING = " ".repeat(size);
  const padded =
    PADDING.substring(0, PADDING.length - stringNumber.length) + stringNumber;
  return padded;
};

// показать матрицу
const showMatrix = (
  matrix: Matrix | NumberMatrix,
  stocks: number[],
  needs: number[]
) => {
  for (let i = 0; i < matrix.length; i++) {
    const output: string[] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      const element = matrix[i][j];
      if (typeof element === "number") {
        output.push(setw(matrix[i][j], SETW_SIZE));
      } else {
        const sign = element.sign || "";
        output.push(setw(`${element.cost}[${element.use}]${sign}`, SETW_SIZE));
      }
    }
    console.log(`${output} | ${stocks.length > 0 ? stocks[i] : ""}`);
  }
  console.log("—".repeat(SETW_SIZE * matrix[0].length + 6));

  const needsOutput: string[] = [];
  for (let i = 0; i < needs.length; i++) {
    needsOutput.push(setw(needs[i], SETW_SIZE));
  }
  console.log(needsOutput + "\n");
};

// поиск минимального элемента в матрице
const findMin = (matrix: NumberMatrix, stocks: number[], needs: number[]) => {
  let minI = 0;
  let minJ = 0;
  let minElement = Number.MAX_VALUE;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
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
    j: minJ,
  };
};

// распределение доходов
// (!) осторожно, мутирует входящие параметры
const distributionOfStocks = (
  matrix: Matrix,
  stocks: number[],
  needs: number[],
  minElement: IndexElem
) => {
  if (stocks[minElement.i] > needs[minElement.j]) {
    matrix[minElement.i][minElement.j].use = needs[minElement.j];
    stocks[minElement.i] = stocks[minElement.i] - needs[minElement.j];
    needs[minElement.j] = 0;
  } else {
    matrix[minElement.i][minElement.j].use = stocks[minElement.i];
    needs[minElement.j] = needs[minElement.j] - stocks[minElement.i];
    stocks[minElement.i] = 0;
  }
};

// проверка на нули в массиве
const isZero = (array: any[]) => array.includes(0);

// метод наименьшей стоимости
const leastCostMethod = (
  matrix: Matrix | NumberMatrix,
  stocks: number[],
  needs: number[]
) => {
  let methodNeeds = [...needs];
  let methodStocks = [...stocks];

  let methodMatrix = matrix.map((i) => {
    return i.map((j) => {
      return {
        cost: Number(j),
        use: 0,
      };
    });
  });

  do {
    let min = findMin(
      methodMatrix.map((i) => {
        return i.map((j) => j.cost);
      }),
      methodStocks,
      methodNeeds
    );

    console.log(`\nМинимальный элемент = ${min.number}`);
    distributionOfStocks(methodMatrix, methodStocks, methodNeeds, min);
    showMatrix(methodMatrix, methodStocks, methodNeeds);
  } while (!isZero(methodNeeds) && !isZero(methodStocks));

  console.log("F(x) = ", findFX(methodMatrix));

  return methodMatrix;
};

// подсчитывает f(x)
const findFX = (matrix: Matrix) => {
  let F = 0;
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j].use > 0) {
        F = F + matrix[i][j].use * matrix[i][j].cost;
      }
    }
  }

  return F;
};

// проверяет решение метода наимешньшей стоимости на оптимальность
const improvementLeastCostMethod = (matrix: Matrix) => {
  let improvementMatrix: Matrix = JSON.parse(JSON.stringify(matrix));

  let isExit = false;
  do {
    let potentials = findPotentials(improvementMatrix);
    const checkOptimal = isOptimal(
      improvementMatrix,
      potentials.UArray,
      potentials.VArray
    );

    if (!checkOptimal) {
      console.log("Решение является оптимальным, поздравляю!");
      showMatrix(improvementMatrix, potentials.UArray, potentials.VArray);
      console.log("F(x) = ", findFX(improvementMatrix));
      isExit = true;
      return;
    }

    console.log("Решение не является оптимальным");
    console.log("Построим замкнутый цикл:");
    console.log(
      `Максимальная свободная клетка - ${
        improvementMatrix[checkOptimal.i][checkOptimal.j].cost
      }\ni - ${checkOptimal.i}\nj - ${checkOptimal.j}`
    );

    improvementMatrix = makeClosedLoop(improvementMatrix, checkOptimal);
  } while (!isExit);
};

// создаём замкнутый цикл
const makeClosedLoop = (matrix: Matrix, firstElement: IndexElem) => {
  let loopMatrix: Matrix = JSON.parse(JSON.stringify(matrix));
  for (let i = 0; i < loopMatrix.length; i++) {
    for (let j = 0; j < loopMatrix[i].length; j++) {
      loopMatrix[i][j] = { ...loopMatrix[i][j], pos: `${i}${j}` };
    }
  }

  const startI = firstElement.i;
  const startJ = firstElement.j;
  loopMatrix[startI][startJ] = { ...loopMatrix[startI][startJ], sign: "+" };

  const startPoint = loopMatrix[startI][startJ];
  let usedCells: MatrixElem[] = [];
  let isEnd = false;
  const fillLine = (
    line: MatrixElem[],
    element: MatrixElem,
    isRow: boolean,
    path: MatrixElem[]
  ) => {
    if (isEnd) return;

    for (let i = 0; i < line.length; i++) {
      if (line[i] == startPoint) {
        isEnd = true;
        usedCells = [...path, element];
        return;
      }
    }

    let counter = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i].use > 0) {
        counter++;
      }
    }
    if (counter < 2) {
      return;
    }

    for (let i = 0; i < line.length; i++) {
      if (line[i].use > 0 && line[i] != element) {
        if (isRow) {
          fillLine(
            loopMatrix.map((element) => element[i]),
            line[i],
            false,
            [...path, element]
          );
        } else {
          fillLine(loopMatrix[i], line[i], true, [...path, element]);
        }
      }
    }
  };

  // запускаем рекурсию
  for (let i = 0; i < loopMatrix[startI].length; i++) {
    if (loopMatrix[startI][i].use > 0 && loopMatrix[startI][i] != startPoint) {
      fillLine(
        loopMatrix.map((element) => element[i]),
        loopMatrix[startI][i],
        false,
        []
      );
    }
  }

  // проставляем знаки '+' и '-'
  let isPlus = false;
  for (let k = 0; k < usedCells.length; k++) {
    const usedCell = usedCells[k];
    for (let i = 0; i < loopMatrix.length; i++) {
      for (let j = 0; j < loopMatrix[i].length; j++) {
        if (usedCell.pos == loopMatrix[i][j].pos) {
          loopMatrix[i][j].sign = isPlus ? "+" : "-";
          isPlus = !isPlus;
        }
      }
    }
  }
  showMatrix(loopMatrix, [], []);

  //ищем минимальное значение среди чисел со знаком минус
  let min = {
    cost: 0,
    use: Number.MAX_VALUE,
    i: 0,
    j: 0,
  };
  for (let i = 0; i < loopMatrix.length; i++) {
    for (let j = 0; j < loopMatrix[i].length; j++) {
      if (loopMatrix[i][j].sign === "-" && loopMatrix[i][j].use < min.use) {
        min = {
          ...loopMatrix[i][j],
          i,
          j,
        };
      }
    }
  }
  console.log(
    `Минимальное значение среди чисел со знаком минус - ${min.cost}[${min.use}]\ni - ${min.i}\nj - ${min.j}`
  );

  // вычитаем найденное выше значение из чисел, имеющих знак '-'
  // и прибавляем к числам, имеющие знак '+'
  console.log(
    "Вычтем этот элемент из элементов со знаком '-'\nи прибавим к элементам со знаком '+'"
  );
  for (let i = 0; i < loopMatrix.length; i++) {
    for (let j = 0; j < loopMatrix[i].length; j++) {
      if (loopMatrix[i][j].sign === "-") {
        loopMatrix[i][j].use = loopMatrix[i][j].use - min.use;
      }

      if (loopMatrix[i][j].sign === "+") {
        loopMatrix[i][j].use = loopMatrix[i][j].use + min.use;
      }

      // убираем лишние свойста из массива
      loopMatrix[i][j] = {
        cost: loopMatrix[i][j].cost,
        use: loopMatrix[i][j].use,
      };
    }
  }
  showMatrix(loopMatrix, [], []);
  return loopMatrix;
};

// находит потенциалы (U и V)
const findPotentials = (matrix: Matrix) => {
  let potentialsMatrix: Matrix = JSON.parse(JSON.stringify(matrix));

  // V потенциал (строка)
  const VArray: number[] = [...new Array(matrix[0].length)].fill(undefined);

  // U потенциал (столбец)
  const UArray: number[] = [...new Array(matrix.length)].fill(undefined);
  UArray[0] = 0;

  // создаём массив с занятыми клетками
  const filledCells: (IndexElem & Pick<MatrixElem, "cost">)[] = [];
  for (let i = 0; i < potentialsMatrix.length; i++) {
    for (let j = 0; j < potentialsMatrix[i].length; j++) {
      if (potentialsMatrix[i][j].use > 0) {
        filledCells.push({
          i,
          j,
          cost: potentialsMatrix[i][j].cost,
        });
      }
    }
  }

  // заполняем V и U (решаем систему уравнений)
  console.log("Заполним предварительные потенциалы V и U\n");
  do {
    for (let i = 0; i < filledCells.length; i++) {
      const cell = filledCells[i];

      if (VArray[cell.j] !== undefined && UArray[cell.i] === undefined) {
        console.log(
          `Выбираем клетку - \ni: ${cell.i} j: ${cell.j} \nЗначение: ${cell.cost}`
        );
        UArray[cell.i] = cell.cost - VArray[cell.j];
        break;
      }

      if (UArray[cell.i] !== undefined && VArray[cell.j] === undefined) {
        console.log(
          `Выбираем клетку - \ni: ${cell.i} j: ${cell.j} \nЗначение: ${cell.cost}`
        );
        VArray[cell.j] = cell.cost - UArray[cell.i];
        break;
      }
    }

    // TODO loop error
    showMatrix(potentialsMatrix, UArray, VArray);

  } while (isUndefined(VArray) || isUndefined(UArray));
  console.log("===============================================\n");
  return {
    VArray,
    UArray,
  };
};

// проверка на undefined в массиве
const isUndefined = (array: any[]) => array.includes(undefined);

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
const isOptimal = (matrix: Matrix, UArray: number[], VArray: number[]) => {
  const elements: (IndexElem & { difference: number })[] = [];

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j].use === 0 && VArray[j] + UArray[i] > matrix[i][j].cost) {
        elements.push({
          i,
          j,
          difference: VArray[j] + UArray[i] - matrix[i][j].cost,
        });
      }
    }
  }

  if (elements.length > 0) {
    console.log("Неоптимальные элементы:");
    for (let i = 0; i < elements.length; i++) {
      console.log(
        `i: ${elements[i].i} j: ${elements[i].j} значение: ${
          matrix[elements[i].i][elements[i].j].cost
        } разница: ${elements[i].difference}`
      );
    }
    let minElement = elements[0];
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].difference > minElement.difference) {
        minElement = elements[i];
      }
    }
    return minElement;
  }

  return null;
};

const run = () => {
  console.log("Исходная матрица:");
  showMatrix(matrix, stocks, needs);

  console.log("Метод наименьшей стоимости:");
  const leastCostMatrix = leastCostMethod(matrix, stocks, needs);

  console.log("\nПроизведём улучшение опорного плана:");
  improvementLeastCostMethod(leastCostMatrix);
};

run();
