export class ResponseVO<T> {
  statusCode: string;
  valueObject: T;
  data: Array<T>;
  }
