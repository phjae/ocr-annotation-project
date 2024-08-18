import { atom } from "recoil";
import { Comment, Content, Image, Rectangle } from '../common/Types';

export const pageRecoilState = atom<any>({
  key: 'pageSet',
  default: {
    page: 0,
    numberOfPages: 0,
    isResetFlag: true,
  },
});

export const fileRecoilState = atom<any>({
  key: 'file',
  default: undefined,
});

export const subFileRecoilState = atom<any>({
  key: 'subFile',
  default: undefined,
});

export const convertedDimensionRecoilState = atom<any>({
  key: "convertedDimension",
  default: {
    convertedWidth: undefined,
    convertedHeight: undefined,
  },
});

export const memorizedRectRecoilState = atom<Rectangle>({
  key: "memorizedRect",
  default: undefined,
});

export const rectanglesRecoilState = atom<Rectangle[]>({
  key: "rectangles",
  default: [],
});

export const currentTextJsonRecoilState = atom<number[][]>({
  key: "currentTextJson",
  default: undefined,
});

export const ocrDataRecoilState = atom<any>({
  key: "ocrData",
  default: undefined,
});

export const contentTypeRecoilState = atom<string>({
  key: "contentType",
  default: '',
});

export const selectedLabelRecoilState = atom<string | undefined>({
  key: "selectedLabel",
  default: undefined,
});

export const replaceCaptureRecoilState = atom<any>({
    key: 'replaceCapture',
    default: {
      selectedLabel: undefined,
      boxID: undefined,
    },
});

export const contentRecoilState = atom<Content | undefined>({
  key: "contents",
  default: undefined,
});

export const contentCommentRecoilState = atom<Comment[]>({
  key: "contentComment",
  default: [],
});

export const contentTableRecoilState = atom<Image[]>({
  key: "contentTable",
  default: [],
});

export const contentImageRecoilState = atom<Image[]>({
  key: "contentImage",
  default: [],
});

export const focusedRectRecoilState = atom<number[] | undefined>({
  key: "focusedRect",
  default: undefined,
});

export const contentStateRecoilState = atom<any>({
  key: "contentState",
  default: {
    activatedState: undefined,
    activatedPage: undefined,
    contents: [],
  },
});

export const contentSavedFlagRecoilState = atom<boolean>({
  key: "contentSavedFlag",
  default: false,
});