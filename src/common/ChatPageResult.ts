export type PageResultMap = (obj: any) => any;

export class ChatPageResult<T> {
  pageCount: number;
  list?: Array<T>;
  constructor(params: {
    pageCount: number;
    list?: Array<T>;
    opt?: { map: PageResultMap };
  }) {
    this.pageCount = params.pageCount;
    let data: Array<T> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
