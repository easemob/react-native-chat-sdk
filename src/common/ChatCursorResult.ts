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
