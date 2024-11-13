import { isUUID } from "class-validator";

type Objeto = Record<string, any>

export function flattenCaracteristica(caracteristicas: Objeto) {
    const result: Objeto = {};

    for (const key in caracteristicas) {
        const value = caracteristicas[key];
        
        if (typeof value === 'object' && value !== null) {
            for (const innerKey in value) {
                const innerValue = value[innerKey];
                if (typeof innerValue === 'object' && innerValue !== null) {
                    const nestedFlattened = flattenCaracteristica(innerValue);
                    Object.assign(result, nestedFlattened);
                } 
                else if (innerKey !== 'id' && !isUUID(innerValue) && innerValue !== null) {
                    result[innerKey] = innerValue;
                }
            }
        }
        else if (!isUUID(value) && value !== null) {
            result[key] = value;
        }
    }
    
    return result;
}