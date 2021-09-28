export const areColumnsKosher = (columns) => {

    if (Array.isArray(columns)){
        const validArray = columns.map(item => {
            // for each item, does it have the necessary stuff?
            const hasName= 'name' in item;
            const hasType= 'type' in item;

            return (hasName && hasType)
        })


        return validArray.reduce(((prevVal, curVal)=> prevVal && curVal), true);
    }
    return false;
}