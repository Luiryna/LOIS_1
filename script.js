"use strict";

//Опредеоение константных перепенных
const FORMULA_ID = "formula";
const ANSWER_1_ID = "answer1";
const FORMULA_REGEXP = new RegExp('([(]([A-Z])((->)|(&)|(\\|)|(~))([A-Z])[)])|([(][!]([A-Z])[)])|([A-Z])','g');
const CONTAINER_ID = "container";
const FORMULA_LABEL_ID = "formulaLabel";
const TABLE_ID = "table";
const ANSWER_2_ID = "answer2";

const NEGATION = "!";
const CONJUNCTION = "&";
const DISJUNCTION = "|";
const IMPLICATION = "->";
const EQUIVALENCE = "~";


//Стартовая фунция запуска скрипта
function run() {
    let formula = document.getElementById(FORMULA_ID).value;
    if(checkSDNF(formula)) {
        alert("TRUE");
    } else {
        alert("FALSE");
    }
}

function checkSDNF(expression) {
    if (expression.match(/\([A-Z]\)/g) || expression.match(/\([0-9]\)/g)){
        return false;
    }
    else if (expression != "") {
        if (expression.length == 1) {

            let reg = /[A-Z]/g
            if (reg.test(expression)) {
                return true;
            } else {
                return false;
            }
        } else {
            let isFormula = checkWithRegularExpressionFormula(expression);
            let totalOperations = expression.match(/&|\||->|!|~/g);
            let numOfOperations = totalOperations.length;
            if (isFormula) {
                let boolResult = checkAllConjunctions(expression, '|');
                if (expression.match(/((!)[(])/)) {
                    return false;
                }
                
                if (boolResult) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (expression.match(/\(|\)/g) == null) {
                    return false;
                }
                let allBrackets = expression.match(/\(|\)/g);
                //Проверяем на наличие лишних символов
                if (expression.match(/(?!([A-Z]|&|\||\(|\)|!))./g)) {
                    return false;
                }
                //Проверяем на чётность количества скобок
                if (!(allBrackets.length % 2 == 0)) {
                    return false;
                }
                if (allBrackets.length / 2 != numOfOperations.length) {
                    return false;
                }
            }
        }
    } else {
        return false;
    }
}


function checkAllConjunctions(expression, sep) {
    let conjunctionOperationsArray = expression.split(sep);
    if (conjunctionOperationsArray == false) return false
    let j, k;
    let conj = '&';
    let resBooltrue = false;
    let resBoolfalse = false;
    let eqResBool = false;
    for (j = 0; j < conjunctionOperationsArray.length; j++) {
        for (k = 0; k < conjunctionOperationsArray.length; k++) {
            if (j != k) {
                resBooltrue = compareConjunctions(conjunctionOperationsArray[j].split(conj), conjunctionOperationsArray[k].split(conj), true);
                resBoolfalse = compareConjunctions(conjunctionOperationsArray[j].split(conj), conjunctionOperationsArray[k].split(conj), false);
                if (resBooltrue == false || resBoolfalse == false) return false
            } else {
                eqResBool = compareSingleConjunction(conjunctionOperationsArray[j].split(conj));
                if (eqResBool == false) return false
            }
        }
    }
    return true
}


function compareConjunctions(first, second, type) {
    console.log(first, second, type)
    let x, y;
    let bool;
    if (first.length != second.length) return false
    for (x = 0; x < first.length; x++) {
        bool = false;
        for (y = 0; y < second.length; y++) {
            if (type) {
                first[x] = first[x].replace(/[!()]/g, '');
                second[y] = second[y].replace(/[!()]/g, '');
            } else {
                first[x] = first[x].replace(/[()]/g, '');
                second[y] = second[y].replace(/[()]/g, '');
            }
            if (first[x] == second[y]) {
                bool = true;
                break;
            }
        }
        if (type) {
            if (!bool) return false
        } else {
            if (bool == false) return true
        }
    }
    return type;
}


function compareSingleConjunction(first) {
    let x, y;
    let bool;
    for (x = 0; x < first.length; x++) {
        bool = true
        for (y = 0; y < first.length; y++) {
            if (x != y) {
                first[x] = first[x].replace(/[!()]/g, '');
                first[y] = first[y].replace(/[!()]/g, '');
                if (first[x] == first[y]) return false;
            }
        }
        if (bool != true) return false;
    }
    return bool;
}


function checkWithRegularExpressionFormula(formula) {
    let form = formula;

    if (form.length == 1 && form.match(/[A-Z]|[0-1]/)) {
        return true;
    } else {
        while (true) {
            let initLength = form.length;
            form = form.replace(FORMULA_REGEXP, '1')
            if (form.length === initLength) {
                break;
            }
        }
        if ((form.length === 1) && (form.match(/1/))) {
            return true;
        } else {
            return false;
        }
    }
}

//Функция расчета входных параметров для формулы
function calculateInputFormulaParameters(index, symbolSize) {
    let res = index.toString(2);
    //дописывает 0, если не хватает разрядов
    for (let index = res.length; index < symbolSize; index++) {
        res = "0" + res;
    }

    return res;
}

//Создания объекта формулы со входными параметрами
function createFormulaWithParameters(symbolInFormula, inputParameters) {
    let object = {};
    for (let index = 0; index < symbolInFormula.length; index++) {
        let symbol = symbolInFormula[index];
        //связь входного символа формулы с его входным значением
        object[symbol] = inputParameters[index];
    }

    return object;
}

//Функция получения результата логической формулы
function getAnswer(formula, obj){
    let constFormula = formula;
    for (let key of Object.keys(obj)) {
        let value = obj[key];
        //заменяем буквы значениями
        constFormula = constFormula.replace(new RegExp(key, 'g'), value);
    }
    return calculateFormula(constFormula);
}

//Функция высчитывания результата логической формулы
function calculateFormula(formula) {
    const REGEXP = new RegExp("([(][" + NEGATION + "][0-1][)])|" + "([(][0-1]((" + CONJUNCTION + ")|("+ "\\" + DISJUNCTION + ")|(" + IMPLICATION + ")|(" + EQUIVALENCE + "))[0-1][)])");
    while (REGEXP.exec(formula) != null) {
        let subFormula = REGEXP.exec(formula)[0];
        let result = calculateSimpleFormula(subFormula);
        formula = formula.replace(subFormula, result);
    }

    return formula;
}

//Высчитывание простой формулы
function calculateSimpleFormula(subFormula) {
    if (subFormula.indexOf(NEGATION) > -1) {
        return calculateNegation(subFormula);
    }

    if (subFormula.indexOf(CONJUNCTION) > -1) {
        return calculateConjunction(subFormula);
    }

    if (subFormula.indexOf(DISJUNCTION) > -1) {
        return calculateDisjunction(subFormula);
    }

    if (subFormula.indexOf(IMPLICATION) > -1) {
        return calculateImplication(subFormula);
    }

    if (subFormula.indexOf(EQUIVALENCE) > -1) {
        return calculateEquivalence(subFormula);
    }
}

//Функция высчитывания отрицания
function calculateNegation(subFormula) {
    if (parseInt(subFormula[2]) == 1) {
        return 0;
    }
    return 1;
}

//Функция высчитывания конъюнкции
function calculateConjunction(subFormula) {
    if (parseInt(subFormula[1]) && parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания дизъюнкции
function calculateDisjunction(subFormula) {
    if (parseInt(subFormula[1]) || parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания импликации
function calculateImplication(subFormula) {
    if ((!parseInt(subFormula[1])) || parseInt(subFormula[4])) {
        return 1;
    } else {
        return 0;
    }
}

//Функция высчитывания эквиваленции
function calculateEquivalence(subFormula) {
    if (parseInt(subFormula[1]) == parseInt(subFormula[3])) {
        return 1;
    } else {
        return 0;
    }
}
