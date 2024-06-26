export interface IResponsePaging<T> {
  success: boolean;
  message: string;
  data: IDataPaging<T>;
}

export interface IResponseDetail<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface IDataPaging<T> {
  data: T[];
  total: number;
}

export interface IGetFoodData {
  id: string;
  name: string;
  price: string;
}
