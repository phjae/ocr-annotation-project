function isEmpty(str?: string | null): boolean {
    return str === undefined || str === null || str === "";
}

function isNotEmpty(str?: string | null): boolean {
    return !isEmpty(str);
}

function stringify(object: any){
    for (const eachIdx in object) {
        if (object[eachIdx] instanceof Map) {
            object[eachIdx] = Array.from(object[eachIdx]);
            stringify(object);
        } else if (typeof object[eachIdx] == 'object') stringify(object[eachIdx]);
    }
    return JSON.stringify(object, null, 4);
}

// function jsonString2ObjectWithMap<R>(
//     jsonString: string
// ): R {
//     if(isEmpty(jsonString)) return null
//
//     const object = JSON.parse(jsonString);
//
//     const jsonStringToObject = (object: any) => {
//         for (const eachIdx in object) {
//             if (
//                 object[eachIdx] instanceof Array &&
//                 object[eachIdx].length > 0 &&
//                 object[eachIdx][0].constructor === Array
//             ) {
//                 object[eachIdx] = new Map(object[eachIdx]);
//                 jsonStringToObject(object);
//             } else if (typeof object[eachIdx] == 'object')
//                 jsonStringToObject(object[eachIdx]);
//         }
//
//         return object;
//     };
//
//     const result = jsonStringToObject(object);
//
//     return result;
// }

function addComma (num: number) {
    if (!num) {
        num = 0
    }
    const parts = num.toString().split(".")
    const regexp = /\B(?=(\d{3})+(?!\d))/g
    return parts[0].replace(regexp, ',') + (parts[1] ? "." + parts[1] : "")
}


function jsonString2object (object:object) {
    return JSON.stringify(object)
}

function object2jsonString (str:string) {
    return JSON.parse(str)
}

// function deleteDuplicate(arr: any) {
//     const set = new Set(arr);
//     return [...set]
// }


export default {
    isNotEmpty,
    isEmpty,
    stringify,
    jsonString2object,
    object2jsonString,
}