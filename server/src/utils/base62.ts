const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = ALPHABET.length;

export const encode = (num: number): string => {
    let str = '';
    if (num === 0) return ALPHABET[0];
    while (num > 0) {
        str = ALPHABET[num % BASE] + str;
        num = Math.floor(num / BASE);
    }
    return str;
};

export const decode = (str: string): number => {
    let num = 0;
    for (let i = 0; i < str.length; i++) {
        num = num * BASE + ALPHABET.indexOf(str[i]);
    }
    return num;
};
