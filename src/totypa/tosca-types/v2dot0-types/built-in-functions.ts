import { equal } from "assert";
import { TOSCA_Function_Name } from "./alias-types";
import { TOSCA_Function_Definition } from "./definition-types";

// 6.1 Representation graph query functions
export const TOSCA_Graph_Query_Functions: {[functionKey: TOSCA_Function_Name]: TOSCA_Function_Definition} = {
    get_input: {
        description: "The get_input function is used to retrieve the values of parameters declared within the inputs section of a TOSCA Service Template.",
        signatures: [
            {
                arguments: [
                    {
                        type: "string",
                        description: "The name of the parameter as defined in the inputs section of the service template."
                    }
                ],
                optional_arguments: [
                    {
                        type: "string|integer",
                        description: "Some TOSCA input parameters are complex (i.e., composed as nested structures). These parameters are used to dereference into the names of these nested structures when needed."
                    }
                ],
                variadic: true
            }
        ]
    },
    get_property: {
        description: "The get_property function is used to retrieve property values of modelable entities in the representation graph. ",
        signatures: [
            {
                arguments: [
                    {
                        type: "string",
                        description: "Using the <tosca_traversal_path> we can traverse the representation graph to extract information from a certain node or relationship."
                    },
                    {
                        type: "string",
                        description: "The name of the property definition the function will return the value from."
                    }
                ],
                optional_arguments: [
                    {
                        type: "string",
                        description: "Some TOSCA properties are complex (i.e., composed as nested structures). These parameters are used to dereference into the names of these nested structures when needed."
                    },
                ],
                variadic: true
            }
        ]
    }
    // TODO further built-in functions...
}


// 6.2.1 Boolean Logic Functions
export const TOSCA_Boolean_Logic_Functions: {[functionKey: TOSCA_Function_Name]: TOSCA_Function_Definition} = {
    and: {
        description: "The $and function takes two or more Boolean arguments. It evaluates to true if all its arguments evaluate to true. It evaluates to false in all other cases.",
        signatures: [
            {
                arguments: [
                    { 
                        type: "boolean"
                    },
                    { 
                        type: "boolean"
                    }
                ],
                variadic: true
            }
        ]
    },
    or: {
        description: "The $or function takes two or more Boolean arguments. It evaluates to false if all of its arguments evaluate to false. It evaluates to true in all other cases.",
        signatures: [
            {
                arguments: [
                    { 
                        type: "boolean"
                    },
                    { 
                        type: "boolean"
                    }
                ],
                variadic: true
            }
        ]
    },
    not: {
        description: "The $not function takes one Boolean argument. It evaluates to true if its argument evaluates to false and evaluates to false if its argument evaluates to true.",
        signatures: [
            {
                arguments: [
                    { 
                        type: "boolean"
                    }
                ],
                variadic: false
            }
        ]
    },
    xor: {
        description: "The $xor function takes two Boolean arguments. It evaluates to false if both arguments either evaluate to true or both arguments evaluate to false, and evaluates to true otherwise.",
        signatures: [
            {
                arguments: [
                    { 
                        type: "boolean"
                    },
                    { 
                        type: "boolean"
                    }
                ],
                variadic: false
            }
        ]
    }
}

// 6.2.2 Comparison Functions
export const TOSCA_Comparison_Functions: {[functionKey: TOSCA_Function_Name]: TOSCA_Function_Definition} = {
    equal: {
        description: "The function takes two arguments of any type. It evaluates to true if the arguments are equal (that is in both type and value) and evaluates to false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "any"
                    },
                    { 
                        type: "any"
                    }
                ],
                variadic: false
            }
        ]
    },
    greater_than: {
        description: "The function takes two arguments of integer, float, string, timestamp, version, any scalar type, or their derivations. It evaluates to true if both arguments are of the same type, and if the first argument is greater than the second argument and evaluates to false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "any"
                    },
                    { 
                        type: "any"
                    }
                ],
                variadic: false
            }
        ]
    },
    greater_or_equal: {
        description: "The function takes two arguments of integer, float, string, timestamp, version, any scalar type, or their derivations. It evaluates to true if both arguments are of the same type, and if the first argument is greater than or equal to the second argument and evaluates to false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "any"
                    },
                    { 
                        type: "any"
                    }
                ],
                variadic: false
            }
        ]
    },
    less_than: {
        description: "The function takes two arguments of integer, float, string, timestamp, version, any scalar type, or their derivations. It evaluates to true if both arguments are of the same type, and if the first argument is less than the second argument and evaluates to false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "any"
                    },
                    { 
                        type: "any"
                    }
                ],
                variadic: false
            }
        ]
    },
    less_or_equal: {
        description: "The function takes two arguments of integer, float, string, timestamp, version, any scalar type, or their derivations. It evaluates to true if both arguments are of the same type, and if the first argument is less than or equal to the second argument and evaluates to false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "any"
                    },
                    { 
                        type: "any"
                    }
                ],
                variadic: false
            }
        ]
    },
    valid_values: {
        description: "The function takes two arguments. The first argument is of any type and the second argument is a list with any number of values of any type. It evaluates to true if the first argument is equal to a value in the second argument list and false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "any"
                    },
                    { 
                        type: "list of any"
                    }
                ],
                variadic: false
            }
        ]
    },
    matches: {
        description: "The function takes two arguments. The first argument is a general string, and the second argument is a string that encodes a regular expression pattern. It evaluates to true if the first argument matches the regular expression pattern represented by the second argument and false otherwise.",
        signatures:[
            {
                arguments: [
                    { 
                        type: "string"
                    },
                    { 
                        type: "regex"
                    }
                ],
                variadic: false
            }
        ]
    }
}