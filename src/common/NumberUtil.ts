function numberWithCommas(number: number): string{
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculateDisCountPercent(original: number, discount: number): number{
    return Math.round(((original - discount) / original)*100);
}



export default {
    numberWithCommas,
    calculateDisCountPercent,
}