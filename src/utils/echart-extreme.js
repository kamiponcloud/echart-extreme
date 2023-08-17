/**
 * 求取echarts的y轴最大最小值
 * @param {*} Data 数组，y轴所对应的数组
 * @param {*} option 选项
 * @returns
 */
export function calculateMaxMin (Data, option = {}) {
    try {
        if (!Array.isArray(Data)) return
        const data = Data.filter(item => typeof item === 'number')
        for (let opationKey in option) {
            if (typeof option[opationKey] === 'string' && option[opationKey] !== '') {
                option[opationKey] = parseFloat(parseFloat(option[opationKey]).toFixed(2))
            }
            if (typeof option[opationKey] !== 'number' && !isNaN(option[opationKey])) {
                delete option[opationKey]
            }
        }
        let { minInterval = 0.01, ymin = -2 ^ 1023 * (1 + (1 - 2 ^ -52)), ymax, maxSplitNumber = 10, headSpace = 0.1, footSpace = 0.1 } = option
        let max = Math.max(...data)
        let min = Math.min(...data)
        max = ((max - min) * headSpace + max).toFixed(2)
        if (min >= 0) ymin = 0
        min = min - (max - min) * footSpace > ymin ? (min - (max - min) * footSpace).toFixed(2) : ymin
        if (max - min < 0.2 && minInterval < 0.1) { // 特殊处理:0.1~0.01的小数处理
            let result = calculateMaxMin([max * 10, min * 10], { headSpace: 0.1, footSpace: 0.1, minInterval: 0.1, maxSplitNumber, ymin, ymax })
            return {
                interval: result.interval / 10,
                max: result.max / 10,
                maxInData: result.maxInData / 10,
                min: result.min / 10,
                minInData: result.minInData / 10,
                splitNumber: result.splitNumber
            }
        } else if (minInterval < 0.1) {
            minInterval = 0.1
        }
        let interval = getInterval(max, min, minInterval)
        let maxNumber = Math.ceil(max / interval) * interval
        let minNumber = Math.floor(min / interval) * interval
        let splitNumber = Math.floor(parseFloat(((parseFloat(maxNumber.toFixed(2)) - parseFloat(minNumber.toFixed(2))) / interval).toFixed(2)) * interval / interval)
        /*
      * 下面全是特殊处理了。时间原因只能做到这样。目前无法做到固定分割数，以及0.1以下的小数处理。
      * 未来的版本需要重新改良getInterval。
      * 这个算法核心还是通过进制去计算合适的间隔值。如果可以通过进制转换来处理。我们可以获得更多结果。当前的十进制，那么就可以得到10的倍数的间隔值。
      * 倘若处理好进制的转换和转换好后的逻辑。那么可得到相对任何间隔值都比较好的结果。或许解决上述问题
      * */

        // 特殊情况处理 [40,50] 相差为10的百以内的数
        if (maxNumber - minNumber === interval && interval >= minInterval * 10) {
            splitNumber = splitNumber * 10
        }

        // 特殊处理，让y轴尽量为整数
        // if (splitNumber >= 7 && minInterval < 1 && maxNumber - minNumber <= 7) {
        //   maxNumber = Math.ceil(maxNumber)
        //   minNumber = Math.floor(minNumber)
        //   splitNumber = maxNumber - minNumber
        //   interval = 1
        // }

        // 特殊处理，刻度线尽量别太少
        if (splitNumber === 3 && (maxNumber - minNumber) / splitNumber > minInterval * 2 && maxSplitNumber >= 6) splitNumber = 6
        if (splitNumber === 2 && (maxNumber - minNumber) / splitNumber > minInterval * 2 && maxSplitNumber >= 4) splitNumber = 4

        // 特殊处理，设置最大的分割数
        if (splitNumber === 7 && maxSplitNumber < 7) {
            let interval = parseFloat(((parseFloat(maxNumber.toFixed(2)) - parseFloat(minNumber.toFixed(2))) / splitNumber).toFixed(2))
            if (maxNumber - max > min - minNumber && min - interval >= ymin) {
                minNumber = minNumber - interval
            } else {
                maxNumber = maxNumber + interval
            }
            splitNumber = 8
        }
        if (splitNumber === 8 && maxSplitNumber < 8) splitNumber = 4
        if (splitNumber === 6 && maxSplitNumber < 6) splitNumber = 3
        if (splitNumber === 9 && maxSplitNumber < 9) {
            let interval = parseFloat(((parseFloat(maxNumber.toFixed(2)) - parseFloat(minNumber.toFixed(2))) / splitNumber).toFixed(2))
            if (maxNumber - max > min - minNumber && min - interval >= ymin) {
                minNumber = minNumber - interval
            } else {
                maxNumber = maxNumber + interval
            }
            splitNumber = 10
        }
        if (splitNumber === 10 && maxSplitNumber < 9) splitNumber = 5
        if (splitNumber === 5 && maxSplitNumber < 5) {
            let interval = parseFloat(((parseFloat(maxNumber.toFixed(2)) - parseFloat(minNumber.toFixed(2))) / splitNumber).toFixed(2))
            if (maxNumber - max > min - minNumber && min - interval >= ymin) {
                minNumber = minNumber - interval
            } else {
                maxNumber = maxNumber + interval
            }
            splitNumber = 3
        }

        // 确定最后的间隔值
        let resultInterval = parseFloat(((parseFloat(maxNumber.toFixed(2)) - parseFloat(minNumber.toFixed(2))) / splitNumber).toFixed(2))

        while (maxNumber - max >= resultInterval) {
            maxNumber = maxNumber - resultInterval
            splitNumber--
        }
        while (min - minNumber >= resultInterval) {
            minNumber = minNumber + resultInterval
            splitNumber--
        }
        resultInterval = parseFloat(((parseFloat(maxNumber.toFixed(2)) - parseFloat(minNumber.toFixed(2))) / splitNumber).toFixed(2))
        let result = {
            max: parseFloat(maxNumber.toFixed(2)),
            maxInData: parseFloat(max),
            min: parseFloat(minNumber.toFixed(2)),
            minInData: parseFloat(min),
            splitNumber: splitNumber,
            interval: resultInterval === 'NaN' ? 1 : resultInterval
        }
        if (result.max === result.min) { // 如果数据数据都一样
            let interval = Math.pow(0.1, getDecimalDigits(result.max))
            if (result.max === 0) interval = minInterval // 最大值最小值为0的时候，避免出现0，1的情况，应该是0，0.5
            interval = interval > minInterval ? interval : minInterval
            result.max = result.max + interval
            if (result.min - interval >= ymin) result.min = result.min - interval
            if (result.min - interval >= ymin) result.splitNumber = 2
            else result.splitNumber = 1
            result.interval = interval
        }
        // 如果y轴最大值小于ymin，y轴最小值大于ymax，则取ymin和ymax
        if (result.min < ymin && typeof ymin === 'number') result.min = parseFloat(ymin.toFixed(0))
        if (result.max > ymax && typeof ymax === 'number') result.max = parseFloat(ymax.toFixed(0))
        return result
    } catch (e) {
        console.error(e)
        return {}
    }
}

// 获取小数位数
export function getDecimalDigits (num) {
    let result = 0
    try {
        result = num.toString().split('.')[1].length
    } catch (e) {
        result = 0
    }
    return result
}
// 判断是否是数组
export function isArray (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
}

// 用于计算数据集中小数位数最多的位数：
export function getMaxDecimalPlaces (data) {
    try {
        let List = []
        if (!isArray(data)) {
            let { min, max } = data
            while (min <= max && data.interval > 0 && typeof data.interval === 'number') {
                List.push(Number(min.toFixed(4)))
                min += data.interval ?? (max - min)
            }
        } else {
            List = data
        }
        let maxDecimalPlaces = 0

        for (let i = 0; i < List.length; i++) {
            const decimalPlaces = String(List[i]).split('.')[1] // 将数值转换为字符串，并获取小数点后的部分

            if (decimalPlaces && decimalPlaces.length > maxDecimalPlaces) {
                maxDecimalPlaces = decimalPlaces.length // 更新最大小数位数
            }
        }

        return maxDecimalPlaces
    } catch (e) {
        console.error(e)
        return 0
    }
}

// 计算双y轴
export function getAverageMaxMin (result1, result2, option1 = {}, option2 = {}) {
    try {
        let maxResult = JSON.parse(JSON.stringify(result1))
        let minResult = JSON.parse(JSON.stringify(result2))
        if (maxResult.interval === 0.05) { // 0.1以下小数特殊处理，小数位数尽量少一些
            maxResult = result1 = calculateMaxMin([maxResult.maxInData, maxResult.minInData], { headSpace: 0, footSpace: 0, minInterval: 0.1 })
        }
        if (minResult.interval === 0.05) { // 0.1以下小数特殊处理，小数位数尽量少一些
            minResult = result2 = calculateMaxMin([minResult.maxInData, minResult.minInData], { headSpace: 0, footSpace: 0, minInterval: 0.1 })
        }
        if (result1.splitNumber === result2.splitNumber) return [result1, result2]
        if (result1.splitNumber < result2.splitNumber) {
            maxResult = JSON.parse(JSON.stringify(result2))
            minResult = JSON.parse(JSON.stringify(result1))
        }

        let closestNumbers = getCommonDivisor(maxResult.splitNumber)
        // 如果是在公因数内，返回
        if (closestNumbers.indexOf(minResult.splitNumber) > -1) return [result1, result2]
        const toSplitNumber = getClosestNumber(minResult.splitNumber, closestNumbers)

        // 常规判断，让分割数小的尽量靠近分割数大的
        while (minResult.splitNumber < toSplitNumber) {
            if (minResult.max - minResult.maxInData > minResult.minInData - minResult.min && (minResult.min - minResult.interval >= 0)) {
                minResult.min = minResult.min - minResult.interval
                minResult.splitNumber++
            } else {
                minResult.max = minResult.max + minResult.interval
                minResult.splitNumber++
            }
        }
        // getCommonDivisor(result1.splitNumber)
        if (result1.splitNumber < result2.splitNumber) {
            return [minResult, maxResult]
        } else {
            return [maxResult, minResult]
        }
    } catch (e) {
        console.error(e)
        return [result1, result2]
    }
}

// function deepClone (obj, visited = new WeakMap()) {
//   if (obj === null || typeof obj !== 'object') {
//     return obj
//   }
//
//   if (visited.has(obj)) {
//     return visited.get(obj)
//   }
//
//   let clone
//
//   if (Array.isArray(obj)) {
//     clone = []
//     visited.set(obj, clone)
//
//     for (let i = 0; i < obj.length; i++) {
//       clone[i] = deepClone(obj[i], visited)
//     }
//   } else {
//     clone = Object.create(Object.getPrototypeOf(obj))
//     visited.set(obj, clone)
//
//     const keys = Object.keys(obj)
//     for (let key of keys) {
//       clone[key] = deepClone(obj[key], visited)
//     }
//   }
//
//   return clone
// }

// 求一个数字，最接近数组里的其中一个数字
export function getClosestNumber (num, arr) {
    let result = arr[0]
    // arr.forEach(item => {
    //   if (num < item) {
    //     result = item
    //   }
    // })
    for (let i = 0; i < arr.length; i++) {
        if (num < arr[i]) {
            result = arr[i]
            break
        }
    }
    return result
    // let min = Math.abs(num - arr[0])
    // arr.forEach(item => {
    //     if (Math.abs(num - item) <= min) {
    //         min = Math.abs(num - item)
    //         result = item
    //     }
    // })
    // return result
}

// 求所有公因数
export function getCommonDivisor (a) {
    let result = []
    let i = 1
    while (i <= a) {
        if (a % i === 0) {
            result.push(i)
        }
        i++
    }
    return result
}
// 计算一个比较合适间隔值
export function getInterval (Max, Min, MinInterval) {
    let max = Max - Min
    let min = 0
    let minInterval = MinInterval

    let num = Math.abs(Max).toFixed(2).toString().length - Math.abs(Min).toFixed(2).toString().length
    if (num === 0) num = (Max - Min).toFixed(0).toString().length - 1
    let Interval = Math.pow(10, num)
    if (Interval === 1) {
        if (max - min < minInterval * 10) {
            return minInterval
        }
    }

    if (max < Interval * 0.5) { // 处理 9~11， 99~101这种情况
        Interval = Interval / 10
    }

    if (Math.abs(max).toFixed(0).toString().length === Math.abs(min).toFixed(0).toString().length && Min < 0) {
        Interval = Math.abs(max).toFixed(0).toString().length
    }
    const maxNumber = Math.ceil(max / Interval) * Interval
    const minNumber = Math.floor(min / Interval) * Interval
    let splitNumber = Math.floor((maxNumber - minNumber) / Interval) + 1
    while (splitNumber > 10) {
        Interval = Interval * 10
        splitNumber = Math.floor((max - min) / Interval)
    }
    return Interval
}

export function getNumSplit (num, minInterval = 0.5, type = 'ceil') {
    return Math[type](num / minInterval) * minInterval
}

/**
 * 最小值、最大值加上或减去相应数值
 * @param Data
 * @param option
 * @returns 返回最小值，最大值
 */
export function dealExtremeNumber (Data, option = {}) {
    // let { maxInterval, minInterval } = option
    // maxInterval = maxInterval || 0.1
    // minInterval = minInterval || 0.1
    let data = Data.map(d => typeof d === 'number' ? d : d?.value).filter(item => (item && item.toString().trim()) || item === 0)
    let initMin = Math.min(...data)
    let initMax = Math.max(...data)
    if (data.length > 0) {
        initMax = Math.ceil(initMax)
    } else {
        initMax = 1
    }
    if (initMin > 0) {
        initMin = Math.floor(initMin) > 0 ? Math.floor(initMin) : 0
    } else {
        initMin = Math.floor(initMin)
    }
    return { initMin, initMax }
}

/**
 * 求取echarts的y轴最大最小值
 * @param {*} data 数组，y轴所对应的数组
 * @param {*} splitNmber 分割数
 * @param {*} type
 * @param minInterval 最小间隔值
 * @returns
 */
// export function calculateMaxMin (data, splitNmber = 4, type, minInterval = 0.5) {
//   let max = Math.max(...data)
//   let min = Math.min(...data)
//
//   if (min < 0) return getNegativeMinMax(min, max, splitNmber)
//   if (max <= 10) return getSmallMinMax(min, max, splitNmber, type, minInterval)
//   return getBigMinMax(min, max, splitNmber, type)
// }

/**
 * 计算最小值
 * @param {*} number
 */
// function calculateMaxMin(number){
//   const length = getNumberLength(number)
//   let value = number
//   if(length === 1){
//     value = system(value)
//   }
// }

/**
 * 大数值求最大最小值
 * @param {*} min 数组里的最小值
 * @param {*} max 数组里的最大值
 * @param {*} splitNmber
 * @param {*} type
 * @returns
 */
// eslint-disable-next-line no-unused-vars
function getBigMinMax (min, max, splitNmber, type) {
    let smallest = calIntRound(Math.trunc(min))
    let biggest = calIntRound(Math.trunc(max), 1)
    let difference = biggest - smallest
    if (smallest === min) {
        smallest = smallest - (difference > 0 ? difference * 0.1 : 10)
        smallest = calIntRound(Math.trunc(smallest))
    }
    smallest = smallest < 0 ? 0 : smallest

    if (biggest === max || biggest < max) {
        biggest = biggest + (difference > 0 ? difference * 0.1 : 10)
        biggest = calIntRound(Math.trunc(biggest), 1)
    }

    // 保留一位小数
    let firstInterval = parseInt((biggest - smallest) / splitNmber * 10 / 10)
    // let firstInterval = Math.round((biggest - smallest) / splitNmber * 10) / 10
    firstInterval = calIntRound(firstInterval)

    // if (type === 'rain') {
    //   const judge = getNumberLength(firstInterval) > 1 ? firstInterval % 5 === 0 : firstInterval % 0.5 === 0
    //   // 求与该数字最接近的5的倍数
    //   if (!judge) firstInterval = Math.ceil(firstInterval / 5) * 5
    //   if (!judge) smallest = Math.ceil(smallest / 5) * 5
    // }

    // 个位数为某些数时需要重新处理
    let { minValue, intervalValue } = dealSpecialNumber(firstInterval, smallest, biggest)
    firstInterval = intervalValue
    smallest = minValue
    // 如果计算出来的最大值不在间隔点上的处理
    biggest = calculateFinalMax(firstInterval, biggest, smallest, max, splitNmber)
    // if ((biggest - smallest) % firstInterval !== 0 && splitNmber > 2) {
    //   let calNumberArr = []
    //   for (let i = 0; i < splitNmber - 2; i++) {
    //     const value = firstInterval * (splitNmber - i) + smallest
    //     if (value - max > 0) calNumberArr.push(value)
    //   }
    //   // 还要拿最大值和分割的最大值做比较，以便求出合适的最大值
    //   if (calNumberArr && calNumberArr.length > 0) {
    //     biggest = findNearesttargetber(calNumberArr, max)
    //   } else {
    //     let j = 1
    //     let bigValue = firstInterval * (splitNmber + j) + smallest
    //     while (bigValue <= max) {
    //       j++
    //       bigValue = firstInterval * (splitNmber + j) + smallest
    //     }
    //     biggest = bigValue
    //   }
    // }

    return {
        min: smallest,
        max: biggest,
        interval: firstInterval
    }
}

/**
 * 小数值求最大最小值
 * @param {*} min
 * @param {*} max
 * @param {*} splitNmber
 * @param type
 * @param minInterval
 * @returns
 */
// eslint-disable-next-line no-unused-vars
function getSmallMinMax (min, max, splitNmber, type, minInterval = 0.5) {
    let biggest = Math.ceil(max)
    let smallest = min
    if (min > 1) smallest = Math.floor(min)
    let firstInterval = biggest - smallest
    if (smallest >= 1 && smallest === min) {
        smallest = smallest - (firstInterval > 0 ? (firstInterval * 0.2) : minInterval)
    }

    smallest = system(smallest)

    if (biggest === max) {
        biggest = biggest + (firstInterval > 0 ? (firstInterval * 0.2) : minInterval)
        biggest = round(biggest)
    }

    // 如果最小间隔值为整数
    if (!isPointNumber(minInterval)) {
        smallest = Math.floor(smallest)
        biggest = Math.ceil(biggest)
    }

    // 保留一位小数
    firstInterval = Math.round((biggest - smallest) / splitNmber * 10) / 10
    firstInterval = round(firstInterval)

    // 如果最小间隔值为整数
    if (!isPointNumber(minInterval) && isPointNumber(firstInterval)) {
        let smallInterVal = Math.floor(firstInterval)
        // 根据间隔数，计算间隔值
        if (max / smallInterVal > (splitNmber - 1)) {
            firstInterval = Math.ceil(firstInterval)
        } else {
            firstInterval = smallInterVal
        }
    }
    // 间隔值如果小于最小间隔
    if (firstInterval < minInterval) firstInterval = minInterval

    // 如果计算出来的最大值不在间隔点上的处理
    if ((biggest - smallest) % firstInterval !== 0 && splitNmber > 2) {
        let calNumberArr = []
        for (let i = 0; i < splitNmber - 2; i++) {
            const value = firstInterval * (splitNmber - i) + smallest
            if (value - max > 0) calNumberArr.push(value)
        }
        // 还要拿最大值和分割的最大值做比较，以便求出合适的最大值
        if (calNumberArr.length > 0) biggest = findNearesttargetber(calNumberArr, max)
    }
    return {
        min: smallest,
        max: biggest,
        interval: firstInterval
    }
}

/**
 * 最小值为负数时求最大最小值
 * @param {Object} min
 * @param {Object} max
 * @param {Object} splitNumber
 */
// eslint-disable-next-line no-unused-vars
function getNegativeMinMax (min, max, splitNumber) {
    let smallest = Math.round(min)
    let biggest = Math.round(max)
    let diffreence = biggest - smallest
    let interval = Math.round(diffreence / splitNumber)
    // 判断负数是小于-10还是大于-10
    if (smallest === min || smallest > min) {
        smallest = round(smallest - (diffreence * 0.1))
    }
    if (biggest === max || biggest < max) {
        biggest = round(biggest + (diffreence * 0.1))
    }

    smallest = dealNavigationSingle(smallest)
    interval = dealNavigationSingle(interval)

    const firstNumber = parseInt((interval + smallest) % 10)
    if (isInArray([1, 3, 4, 5, 7, 9], firstNumber)) {
        // this.recalculate(interval, biggest, 'add')
        interval = recalculate(interval, biggest, 'reduce')
    }

    // 如果计算出来的最大值不在间隔点上的处理
    if (interval !== 0) {
        biggest = calculateFinalMax(interval, biggest, smallest, max, splitNumber)
    }

    return {
        min: smallest,
        max: biggest,
        interval
    }
}

/**
 * 特殊数值的处理,如果各位数是3，4，7，9这些的处理
 */
function dealNavigationSingle (number) {
    let gapNumber = number % 10
    // 1, 3, 4, 7, 9
    // 当整数个数是一位，1. 不是小数 2. 改数字不再所需范围内
    if ((getNumberLength(number) === 1) && !isPointNumber(number) && isInArray([3, 4, 7, 9], number)) {
        if (number > 0) {
            number = number > 10 ? number - 1 : number - 0.5
        } else if (number < 0) {
            number = number > -10 ? number - 1 : number - 0.5
        }
    }

    // 当整数个数大于2，且个位数字不是5或者0，要重新处理计算
    if (getNumberLength(number) >= 2 && !isInArray([0, 5], gapNumber)) {
        if (number < 0) {
            gapNumber = gapNumber < 5 ? 5 : 10
        } else {
            gapNumber = gapNumber < 5 ? 0 : 10
        }
        number = number - number % 10 + gapNumber
    }
    return number
}

/**
 * 当最大值不在间隔点上的处理
 * @param {*} interval
 * @param {*} biggest
 * @param {*} smallest
 * @param {*} splitNmber
 */
function calculateFinalMax (interval, biggest, smallest, max, splitNumber) {
    // if ((biggest - smallest) % interval !== 0 && splitNumber > 2) {
    if (splitNumber > 2) {
        let calNumberArr = []
        for (let i = 0; i < splitNumber - 1; i++) {
            const value = interval * (splitNumber - i) + smallest
            if (value - max > 0) calNumberArr.push(value)
        }
        // 还要拿最大值和分割的最大值做比较，以便求出合适的最大值
        if (calNumberArr && calNumberArr.length > 0) {
            biggest = findNearesttargetber(calNumberArr, max)
        } else {
            let j = 1
            let bigValue = interval * (splitNumber + j) + smallest
            while (bigValue <= max) {
                j++
                bigValue = interval * (splitNumber + j) + smallest
            }
            biggest = bigValue
        }
    }
    return biggest
}

/**
 * 特殊数值的处理
 * @param {Object} firstInterval
 * @param {Object} smallest
 * @param {Object} biggest
 */
function dealSpecialNumber (firstInterval, smallest, biggest) {
    // 个位数字不要是1，3，4，7，9，如果有小数点那就不用管
    const oddNumbers = [1, 3, 4, 7, 9]

    // 间隔值
    const singleNumber = parseInt(firstInterval % 10)
    const smaleSingle = parseInt(smallest % 10)
    const singleIsOdd = isInArray(oddNumbers, singleNumber)
    const smallIsOdd = isInArray(oddNumbers, smaleSingle)
    const reg = /[.]/
    // 第一种情况：两个数都是奇数
    if (singleIsOdd && smallIsOdd) {
        // 两个值都需要重新计算
        // 1. 先判断字符长度，如果长度为1，那1是可存在的
        if (singleNumber === 1) {
            if (!reg.test(firstInterval)) firstInterval = getNumberLength(firstInterval) > 1 ? 2 : firstInterval
            if (!reg.test(smallest)) {
                if (firstInterval > 10) {
                    smallest = smallest - 1 > 0 ? smallest - 1 : 0
                } else {
                    smallest = getNumberLength(smallest) > 1 ? 2 : smallest
                }
            }
        } else {
            firstInterval = recalculate(firstInterval, biggest, 'add')
            smallest = recalculate(smallest, biggest, 'reduction')
        }
    }
    // 第二种情况：其中之一为奇数
    if (smallIsOdd && !singleIsOdd) smallest = recalculate(smallest, biggest, 'reduction')

    if (!smallIsOdd && singleIsOdd) firstInterval = recalculate(firstInterval, biggest, 'add')

    // 第三种情况，两者都非奇数，但间隔+最小值为奇数
    if (!smallIsOdd && !singleIsOdd) {
        const firstNumber = parseInt((firstInterval + smallest) % 10)
        if (isInArray(oddNumbers, firstNumber)) firstInterval = recalculate(firstInterval, biggest, 'add')
    }

    return {
        minValue: smallest,
        intervalValue: firstInterval
    }
}

/**
 * 小数处理
 * @param {*} number
 * @returns
 */
function system (number) {
    if (number < 0.5) {
        number = 0
    } else if (number < 1) {
        number = 0.5
    } else {
        number = round(number)
    }
    return number
}

/**
 * @param {Number} number
 * @param {Number} biggest 需要进行比较的值
 * @param {String} type 值为add或者reduction, 如果是add表示加，如果是reduction表示减
 */
function recalculate (number, biggest, type) {
    const reg = /[.]/
    const middleNum = type === 'add' ? 1 : type === 'reduction' ? -1 : 0
    const oddNumbers = [1, 3, 4, 7, 9]
    if (!reg.test(number)) {
        // if (getNumberLength(number) > 1) {
        //   if (isInArray(oddNumbers, number)) number += 1
        // } else {
        //   number = biggest > 10 ? number + 1 : number + 0.5
        // }
        if (getNumberLength(number) > 1) {
            if (isInArray(oddNumbers, number)) number = number + (1 * middleNum)
        } else {
            number = biggest > 10 ? number + (1 * middleNum) : number + (0.5 * middleNum)
        }
    }
    return number
}

/**
 * 判断某个字符是否存在于指定数组中
 * @param {Object} arr
 * @param {Object} number
 */
function isInArray (arr, number) {
    // 大于0存在，-1不存在
    const index = arr.findIndex(item => item === number)
    return index >= 0
}

/**
 * 四舍五入：小数位数
 * @param {*} number 需要进行处理的数字
 * @returns
 */
function round (number) {
    // 获取小数部分
    let spotNmber = number % 1
    spotNmber = spotNmber === 0 ? 0 : spotNmber <= 0.5 ? 0.5 : 1

    // Math.trunc 获取整数部分
    // return Math.trunc(number) + spotNmber
    return number >= 0 ? Math.trunc(number) + spotNmber : Math.trunc(number) - spotNmber
}

/**
 * 查找多个数字中最接近目标值的一个, 采用二分法
 * @param {*} arr 数组，多个需要进行比对的数字组成的数组
 * @param {*} target 目标数字
 * @returns
 */
function findNearesttargetber (arr, target) {
    // 先进行排序，改成有序数组
    arr = arr.sort()
    let mid
    let l = 0
    let r = arr.length - 1
    // 保证指针最终停留在相邻的两个数，这里判断是否大于一
    while (r - l > 1) {
        mid = Math.floor((l + r) / 2)
        // 如果目标数比中间小，所以范围在左边
        if (target < arr[mid]) {
            r = mid
        } else {
            l = mid
        }
    }
    // 最后比较两个数字的大小即可【这里是需要正数大于0的而且都要比目标值大才可以，所以不取绝对值】
    return arr[l] - target < arr[r] - target ? arr[l] : arr[r]
}

/**
 * 自定义的正整数的四舍五入
 * @param {*} value 需要计算的数值
 * @param {*} addNum 值为1或0，1: 入，0: 舍
 * eg: 37 如果是入则值为40，如果是舍则值为30
 * @returns
 */
function calIntRound (value, addNum = 0) {
    let valueLength = getNumberLength(value)
    let i = valueLength - 1
    let newValue = 0
    let number = 0
    if (valueLength > 2) {
        // 求取从左往右数第二位数的数字
        number = parseInt(value % (Math.pow(10, i)) / Math.pow(10, i - 1))
    } else {
        // 两位数求取十位数数字
        number = parseInt(value / (Math.pow(10, i)))
    }

    if (i - 1 > 0) {
        // 求取从左往右数第三位数的数字
        if (i === 2) { // 总共三位数，第三位是求个位数
            let bits = (parseInt(value % 10) && addNum > 0) ? addNum : 0
            number = number + bits
            newValue = Math.pow(10, i) * parseInt(value / Math.pow(10, i)) + Math.pow(10, i - 1) * number
        } else {
            let best = parseInt(value / Math.pow(10, i - 2))
            let addValue = best > 0 && addNum > 0 ? addNum : 0
            number = number + addValue
            newValue = Math.pow(10, i) * parseInt(value / Math.pow(10, i)) + Math.pow(10, i - 1) * number
        }
    } else {
        newValue = Math.pow(10, i) * (number + addNum)
    }
    return newValue
}

/**
 * 判断改数字是否为小数
 * @param {Object} number
 */
function isPointNumber (number) {
    const reg = /[.]/
    return reg.test(number)
}

/**
 * 获取数字整数部分的长度
 * @param {*} number
 */
function getNumberLength (number) {
    number = Math.trunc(number)
    let length = number.toString().length
    if (number < 0) length -= 1
    return length
}
