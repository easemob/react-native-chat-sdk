/**
 * 包含游标及分页结果的泛型类。
 *
 * 做为分页获取数据的返回对象。
 */
export class ChatCursorResult<T> {
  /**
   * 游标，用于标记开始取数据的位置。
   */
  cursor: string;
  /**
   * 请求结果。
   */
  list?: Array<T>;
  constructor(params: {
    cursor: string;
    list?: Array<T>;
    opt?: { map: (obj: any) => any };
  }) {
    this.cursor = params.cursor;
    let data: Array<any> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
