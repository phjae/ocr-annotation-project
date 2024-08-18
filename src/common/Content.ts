import { convertStringToNumberPairs } from './RectangleUtil';
import { CONTENT_TYPE } from './Constant';

class Image {
    id: number | undefined;
    boxID: number | undefined;
    path: string | undefined;
    keyword: string | undefined;
    title: string | undefined;
    description: string | undefined;
    isModified: boolean | undefined;

    constructor(initialData: any) {
        const data: any = {
            id: undefined,
            boxID: undefined,
            path: undefined,
            keyword: undefined,
            title: undefined,
            description: undefined,
            isModified: undefined,
        };

        if (initialData) {
            data.id = initialData.taskAttchId;
            data.boxID = +initialData.taskContentShapeId;
            data.path = initialData.path || '';
            data.keyword = initialData.keyWord;
            data.title = initialData.title;
            data.description = initialData.content;
            data.isModified = false;
        }

        Object.defineProperties(
            this,
            Object.freeze({
                id: {
                    get: () => data.id,
                },
                boxID: {
                    get: () => data.boxID,
                },
                path: {
                    get: () => data.path,
                },
                keyword: {
                    get: () => data.keyword,
                },
                title: {
                    get: () => data.title,
                },
                description: {
                    get: () => data.description,
                },
                isModified: {
                    get: () => data.isModified,
                },
            }),
        );
    }
}

class Commentary {
    boxID: number | undefined;
    id: number | undefined;
    commentId: string | undefined;
    comment: string | undefined;

    constructor(initialData: any) {
        const data: any = {
            id: undefined,
            boxID: undefined,
            commentId: undefined,
            comment: undefined,
        };

        if (initialData) {
            data.id = initialData.commentaryId;
            data.boxID = +initialData.taskContentShapeId;
            data.commentId = initialData.commentaryNo;
            data.comment = initialData.commentary;
        }

        Object.defineProperties(
            this,
            Object.freeze({
                id: {
                    get: () => data.id,
                },
                boxID: {
                    get: () => data.boxID,
                },
                commentId: {
                    get: () => data.commentId,
                },
                comment: {
                    get: () => data.comment,
                },
            }),
        );
    }
}

class Box {
    id: number | undefined;
    x: number | undefined;
    y: number | undefined;
    width: number | undefined;
    height: number | undefined;
    page: number | undefined;
    contentType: string | undefined;
    points: number[][] | undefined;

    constructor(initialData: any, convertedDimension: any) {
        const data: any = {
            id: undefined,
            x: undefined,
            y: undefined,
            width: undefined,
            height: undefined,
            page: undefined,
            contentType: undefined,
            points: undefined,
        };

        if (initialData) {
            data.id = initialData.taskContentShapeId;
            data.page = initialData.page + 1;
            data.contentType = initialData.shapeType;
            data.points = convertStringToNumberPairs(initialData.points);
            //const {width, height} = getBoxDimensions(initialData.points);
            data.x = data.points[0][0] / convertedDimension.convertedWidth;
            data.y = data.points[0][1] / convertedDimension.convertedHeight;
            const width = data.points[1][0] / convertedDimension.convertedWidth - data.x;
            const height = data.points[2][1] / convertedDimension.convertedHeight - data.y;
            data.width = width;
            data.height = height;
        }

        Object.defineProperties(
            this,
            Object.freeze({
                id: {
                    get: () => data.id,
                },
                x: {
                    get: () => data.x,
                },
                y: {
                    get: () => data.y,
                },
                width: {
                    get: () => data.width,
                },
                height: {
                    get: () => data.height,
                },
                page: {
                    get: () => data.page,
                },
                contentType: {
                    get: () => data.contentType,
                },
                points: {
                    get: () => data.points,
                },
            }),
        );
    }
}

interface ContentData {
    contentId: number | undefined;
    taskId: number | undefined;
    chapter: string | undefined;
    section: string | undefined;
    article: string | undefined;
    paragraph: string | undefined;
    line: string | undefined;
    indices: string | undefined;
    startPage: number | undefined;
    endPage: number | undefined;
    contentNo?: string | undefined;
    answer?: string | undefined;
    categories: string | undefined;
    modUserId: number | undefined;
    contentInfo: any;
    commentaries: any[] | undefined;
    tables: any[] | undefined;
    images: any[] | undefined;
    boxes: any[] | undefined;
    contentType: string | undefined;
    comment: string | undefined;
    reply: string | undefined;
}

export class ContentConstructor implements ContentData {
    contentId: number | undefined;
    taskId: number | undefined;
    chapter: string | undefined;
    section: string | undefined;
    article: string | undefined;
    paragraph: string | undefined;
    line: string | undefined;
    indices: string | undefined;
    startPage: number | undefined;
    endPage: number | undefined;
    contentNo?: string | undefined;
    answer?: string | undefined;
    categories: string | undefined;
    modUserId: number | undefined;
    contentInfo: any | undefined;
    commentaries: any[] | undefined;
    tables: any[] | undefined;
    images: any[] | undefined;
    boxes: any[] | undefined;
    contentType: string | undefined;
    comment: string | undefined;
    reply: string | undefined;

    //contentTitle: string | undefined;
    //content: string | undefined;
    //question: string | undefined;
    //answer: string | undefined;
    //example: string | undefined;

    constructor(initialData: any, convertedDimension: any) {
        const contentData = initialData.content || undefined;
        const data: Partial<ContentData> = {
            contentId: undefined,
            taskId: undefined,
            chapter: undefined,
            section: undefined,
            article: undefined,
            paragraph: undefined,
            line: undefined,
            indices: undefined,
            startPage: undefined,
            endPage: undefined,
            contentNo: undefined,
            categories: undefined,
            modUserId: undefined,
            comment: undefined,
            reply: undefined,

            // contentInfo: undefined,
            // commentaries: undefined,
            // tables: undefined,
            // images: undefined,
            // boxes: undefined,
        };
        data.contentInfo = {};
        data.commentaries = [];
        data.tables = [];
        data.images = [];
        data.boxes = [];

        for (const property in data) {
            if (Object.prototype.hasOwnProperty.call(contentData, property)) {
                const key = property as keyof ContentData;
                if (['contentInfo', 'commentaries', 'tables', 'images', 'boxes'].includes(key)) break;
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                data[key] = contentData[key];
            }
        }

        if (Array.isArray(initialData.boxes)) {
            for (const box of initialData.boxes) {
                const classInstance = new Box(box, convertedDimension);
                data.boxes.push(classInstance);
            }
        }

        if (contentData !== undefined) {
            data.contentInfo = {
                boxID: contentData?.boxes?.map((str: string) => Number(str.trim())),
            };
            if ([CONTENT_TYPE.MANUAL, CONTENT_TYPE.GUIDE, CONTENT_TYPE.QNA].includes(initialData.contentType)) {
                data.contentInfo = {
                    ...data.contentInfo,
                    title: contentData.contentTitle,
                    description: contentData.content,
                };
            }
            if ([CONTENT_TYPE.EVALUATION].includes(initialData.contentType)) {
                data.contentInfo = {
                    ...data.contentInfo,
                    title: contentData.contentTitle,
                    description: contentData.content,
                    answer: contentData.answer || '',
                };
            }
        }

        if (Array.isArray(initialData.commentaries)) {
            for (const commentary of initialData.commentaries) {
                const classInstance = new Commentary(commentary);
                data.commentaries.push(classInstance);
            }
        }

        if (Array.isArray(initialData.tables)) {
            for (const table of initialData.tables) {
                const classInstance = new Image(table);
                data.tables.push(classInstance);
            }
        }

        if (Array.isArray(initialData.images)) {
            for (const image of initialData.images) {
                const classInstance = new Image(image);
                data.images.push(classInstance);
            }
        }

        Object.defineProperties(
            this,
            Object.freeze({
                contentId: {
                    get: () => data.contentId,
                },
                taskId: {
                    get: () => data.taskId,
                },
                chapter: {
                    get: () => data.chapter,
                },
                section: {
                    get: () => data.section,
                },
                article: {
                    get: () => data.article,
                },
                paragraph: {
                    get: () => data.paragraph,
                },
                line: {
                    get: () => data.line,
                },
                indices: {
                    get: () => data.indices,
                },
                startPage: {
                    get: () => data.startPage,
                },
                endPage: {
                    get: () => data.endPage,
                },
                contentNo: {
                    get: () => data.contentNo,
                },
                categories: {
                    get: () => data.categories,
                },
                modUserId: {
                    get: () => data.modUserId,
                },
                contentInfo: {
                    get: () => data.contentInfo,
                },
                commentaries: {
                    get: () => data.commentaries,
                },
                tables: {
                    get: () => data.tables,
                },
                images: {
                    get: () => data.images,
                },
                boxes: {
                    get: () => data.boxes,
                },
                comment: {
                    get: () => data.comment,
                },
                reply: {
                    get: () => data.reply,
                },
            }),
        );
    }
}
