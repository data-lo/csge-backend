import { isUUID } from "class-validator";

type Caracteristica = Record<string, any>

export function flattenCaracteristica(caracteristica: Caracteristica){
    const result: Caracteristica = {};

    for(const key in caracteristica){
        const value = caracteristica[key];

        if(typeof value === 'object' && value !== null){
            
            //const nestedObject = flattenCaracteristica(value);

            for(const innerKey in value /*nestedObject*/){
                if(innerKey !== 'id'){
                    result[innerKey] = value[innerKey];
                }
            }
        }else if(value !== null){
            if(!isUUID(value)){
                const value = caracteristica[key];
                result[key] = value;
            }
        }
    }
    return result;
};