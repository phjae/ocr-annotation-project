export const base64ToFile = (base64String: string, fileName: string) => {
    if (!base64String) return undefined;
    const arr = base64String.split(',');
    const mimeMatch = arr[0]?.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : '';

    if (!arr[1]) {
        return undefined; // Handle case where arr[1] is undefined
    }
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
};