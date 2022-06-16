/**
 * The ChatCursorResult class, which specifies the cursor from which to query results.
 * When querying using this class, the SDK returns the queried instance and the cursor.
 */
export class ChatCursorResult<T> {
  /**
   * The cursor that specifies where to start to get data.
   */
  cursor: string;
  /**
   * The request result.
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
