export type CursorResultMap = (obj: any) => any;

export class ChatCursorResult<T> {
  cursor: string;
  list?: Array<T>;
  constructor(params: {
    cursor: string;
    list?: Array<T>;
    opt?: { map: CursorResultMap };
  }) {
    this.cursor = params.cursor;
    let data: Array<any> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
