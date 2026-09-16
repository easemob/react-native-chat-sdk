/**
 * The generic class which contains the cursor and pagination result.
 *
 * The class instance is returned when you make a paginated query.
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
  /**
   * The total count of the result on the server.
   *
   * **Note** This field is returned only by certain APIs on certain platforms.
   * It is `undefined` when the native SDK does not provide it.
   */
  totalCount?: number;
  constructor(params: {
    cursor: string;
    list?: Array<T>;
    totalCount?: number;
    opt?: { map: (obj: any) => any };
  }) {
    this.cursor = params.cursor;
    this.totalCount = params.totalCount;
    let data: Array<any> = [];
    params.list?.forEach((value) => {
      data.push(params.opt ? params.opt.map(value) : value);
    });
    this.list = data;
  }
}
