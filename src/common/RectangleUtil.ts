export function generateNewUniqueID() {
    // object_id를 db에서 key로 사용하기 위해서 unique한 값 생성
    return Number(String(new Date().getTime()) + String(Math.floor(100 + Math.random() * 900)));
}

export function generateBoxColor(contentType: string) {
    let color: any = null;
    switch (contentType) {
        case 'content':
        case 'CONTENT':
            color = 'rgb(39,236,47)';
            break;
        case 'comment':
        case 'COMMENTARY':
            color = 'rgb(253,80,80)';
            break;
        case 'table':
        case 'TABLE':
            color = 'rgb(170,79,255)';
            break;
        case 'image':
        case 'IMAGE':
            color = 'rgb(79,175,255)';
            break;
        default:
            color = 'blue';
    }

    return color;
}

export function convertStringToNumberPairs(inputString: string): number[][] {
    return inputString
        .split(',')
        .map(Number)
        .reduce((result: number[][], value: number, index: number, array: number[]) => {
            if (index % 2 === 0) {
                result.push([value, array[index + 1]]);
            }
            return result;
        }, []);
}

export function getBoxDimensions(pointsString: string): { width: number; height: number } | null {
    const pointsArray = pointsString.split(',').map((coord) => parseFloat(coord.trim()));

    if (pointsArray.length % 2 !== 0) {
        console.error('Invalid points string. Must be a comma-separated list of x, y coordinates.');
        return null;
    }

    let minX = pointsArray[0],
        maxX = pointsArray[0];
    let minY = pointsArray[1],
        maxY = pointsArray[1];

    for (let i = 2; i < pointsArray.length; i += 2) {
        const x = pointsArray[i];
        const y = pointsArray[i + 1];

        // Update min and max coordinates
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    return { width, height };
}

function isBase64(str: string): boolean {
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

    if (str.length % 4 !== 0) {
        return false;
    }

    return base64Pattern.test(str);
}

export function isUrlPathBase64(url: string): boolean {
    let urlPath = '';

    try {
        urlPath = url !== '' ? url.startsWith('/') ? new URL(url).pathname.slice(1) : new URL(url).pathname : '';
    } catch (e) {
        urlPath = url;
    }

    if (urlPath.startsWith('data:image/png;base64,')) {
        urlPath = urlPath.replace('data:image/png;base64,', '');
    }
    if (urlPath.startsWith('image/png;base64,') ) {
        urlPath = urlPath.replace('image/png;base64,', '');
    }

    return isBase64(urlPath);
}
